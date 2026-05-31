/**
 * Mission-map resolver — turns a declarative `MissionMap` spec (+ its scenario)
 * into a flat, fully-resolved `DrawableMap` the `<MissionMap>` component can
 * render without further logic. Pure data: no React, no DOM.
 *
 * Two things genuinely need computing here (everything else is pass-through):
 *   - the approach-vector ring, swept clockwise from the setup edge, with its
 *     size derived from the squads' `vector` values, and
 *   - asteroid placement (seeded, min-distance rejection sampling).
 */

import type {
  MapHue,
  MapPoint,
  MapRect,
  MapSide,
  MapZone,
  MissionMap,
  Scenario,
  ScenarioSquad,
  SimpleVector,
  Vector,
} from '../../data/scenarios/types';

export const DEFAULT_GRID = 9;
const DEFAULT_SETUP_DEPTH = 1.1;
const DEFAULT_MIN_DIST = 1.6;
/** Asteroids stay this far inside their zone's rect so rocks don't spill out. */
const ASTEROID_INSET = 0.3;

export type ResolvedToken =
  | { kind: 'playerStart'; at: readonly [number, number]; playerCount?: number; tip?: string }
  | { kind: 'objective'; at: readonly [number, number]; label?: string; tip?: string }
  | {
      kind: 'structure';
      at: readonly [number, number];
      label?: string;
      playerCount?: number;
      tip?: string;
    };

export interface DrawableVector {
  n: number;
  side: MapSide;
  /** Fraction along the edge, 0..1 from its clockwise-start corner. */
  t: number;
}

export interface DrawableAsteroids {
  rocks: readonly (readonly [number, number])[];
  seed: number;
  tip?: string;
}

export interface DrawableStation {
  preset: 'triHub' | 'bar';
  at: readonly [number, number];
  label?: string;
  tip?: string;
}

export interface DrawableMap {
  grid: number;
  seed: number;
  /** Setup edge synthesised as the first zone (warn-hued band) when present. */
  zones: readonly (MapZone & { hue: MapHue })[];
  asteroids: readonly DrawableAsteroids[];
  stations: readonly DrawableStation[];
  tokens: readonly ResolvedToken[];
  vectors: readonly DrawableVector[];
}

export function resolvePoint(at: MapPoint, grid: number): readonly [number, number] {
  return at === 'center' ? [grid / 2, grid / 2] : at;
}

// --- vector ring ------------------------------------------------------------

/** Edges swept clockwise starting from the one immediately after `setup`. */
const EDGES_AFTER: Record<MapSide, readonly MapSide[]> = {
  bottom: ['left', 'top', 'right'],
  top: ['right', 'bottom', 'left'],
  left: ['top', 'right', 'bottom'],
  right: ['bottom', 'left', 'top'],
};
/** Edges whose clockwise traversal runs in the direction of increasing `t`. */
const INCREASING_T: ReadonlySet<MapSide> = new Set<MapSide>(['top', 'right']);

function simpleVectorReaches12(v: SimpleVector): boolean {
  if (typeof v === 'number') return v > 6;
  return v === '1d12' || v === '1d6+6';
}

function vectorReaches12(v: Vector): boolean {
  if (Array.isArray(v)) return v.some(simpleVectorReaches12);
  if (typeof v === 'object') return true; // oppositeOf pairs resolve into 7..12
  return simpleVectorReaches12(v as SimpleVector);
}

/** 6- or 12-vector ring, inferred from whether any squad can arrive on 7..12. */
export function deriveVectorCount(squads: readonly ScenarioSquad[]): 6 | 12 {
  return squads.some((s) => vectorReaches12(s.vector)) ? 12 : 6;
}

/**
 * Place `count` numbered vectors on the three non-setup edges, `count / 3` per
 * edge, swept clockwise from the setup edge. Reproduces the printed ring (1,2
 * left · 3,4 top · 5,6 right for a bottom setup edge) and scales to 12.
 */
export function vectorRing(setupSide: MapSide, count: 6 | 12): DrawableVector[] {
  const perEdge = count / 3;
  const base = Array.from({ length: perEdge }, (_, i) => (i + 1) / (perEdge + 1));
  const out: DrawableVector[] = [];
  let n = 1;
  for (const side of EDGES_AFTER[setupSide]) {
    const ts = INCREASING_T.has(side) ? base : [...base].reverse();
    for (const t of ts) out.push({ n: n++, side, t });
  }
  return out;
}

// --- zone bounds + asteroid sampling ---------------------------------------

/** Axis-aligned bounding rect of a zone shape, in cell units. */
export function zoneRect(zone: MapZone, grid: number): MapRect {
  if (zone.rect) return zone.rect;
  if (zone.band) {
    const { side, depth, span } = zone.band;
    const [a, b] = span ?? [0, grid];
    if (side === 'top') return [a, 0, b, depth];
    if (side === 'bottom') return [a, grid - depth, b, grid];
    if (side === 'left') return [0, a, depth, b];
    return [grid - depth, a, grid, b];
  }
  if (zone.disc) {
    const [cx, cy] = resolvePoint(zone.disc.at, grid);
    const r = zone.disc.r;
    return [cx - r, cy - r, cx + r, cy + r];
  }
  if (zone.corner) {
    const { corner, radius } = zone.corner;
    const x = corner.includes('l') ? 0 : grid - radius;
    const y = corner.includes('t') ? 0 : grid - radius;
    return [x, y, x + radius, y + radius];
  }
  const p = zone.point ?? [grid / 2, grid / 2];
  return [p[0], p[1], p[0], p[1]];
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Rejection-sample `count` rock centres at least `minDist` apart inside
 * `region`. Deterministic in `seed`; bails out gracefully if the region is too
 * tight to fit them all.
 */
export function sampleAsteroids(
  region: MapRect,
  count: number,
  seed: number,
  minDist: number,
): (readonly [number, number])[] {
  const rng = mulberry32((seed >>> 0) * 2654435761);
  const [x0, y0, x1, y1] = region;
  const placed: [number, number][] = [];
  let guard = 0;
  while (placed.length < count && guard < 5000) {
    guard++;
    const x = x0 + rng() * (x1 - x0);
    const y = y0 + rng() * (y1 - y0);
    if (placed.every((p) => Math.hypot(p[0] - x, p[1] - y) >= minDist)) placed.push([x, y]);
  }
  return placed;
}

// --- top-level resolve ------------------------------------------------------

function insetRect(r: MapRect, by: number): MapRect {
  return [r[0] + by, r[1] + by, r[2] - by, r[3] - by];
}

export function resolveMissionMap(scenario: Scenario): DrawableMap {
  const spec: MissionMap = scenario.map ?? {};
  const grid = spec.grid ?? DEFAULT_GRID;
  const seed = spec.seed ?? 1;

  // Setup edge → a warn-hued band zone, drawn first (under everything).
  const setupEdge = spec.setupEdge === false ? null : (spec.setupEdge ?? { side: 'bottom' });
  const setupZone: (MapZone & { hue: MapHue })[] = setupEdge
    ? [
        {
          hue: 'warn',
          label: setupEdge.label ?? 'A',
          tip: 'Player setup edge — deploy your ships along this edge',
          band: { side: setupEdge.side, depth: setupEdge.depth ?? DEFAULT_SETUP_DEPTH },
        },
      ]
    : [];
  const specZones: (MapZone & { hue: MapHue })[] = (spec.zones ?? []).map((z) => ({
    ...z,
    hue: z.hue ?? 'holo',
  }));

  // Vector ring. Explicit list wins; otherwise derive/force a swept ring.
  const vspec = spec.vectors;
  let vectors: DrawableVector[] = [];
  if (vspec === false) {
    vectors = [];
  } else if (vspec === undefined || vspec === 'auto' || vspec === 6 || vspec === 12) {
    const count = vspec === undefined || vspec === 'auto' ? deriveVectorCount(scenario.squads) : vspec;
    vectors = vectorRing(setupEdge?.side ?? 'bottom', count);
  } else {
    vectors = vspec.map((v) => ({ n: v.n, side: v.side, t: v.t }));
  }

  // Features → asteroids + stations.
  const byId = new Map(specZones.filter((z) => z.id).map((z) => [z.id, z] as const));
  const asteroids: DrawableAsteroids[] = [];
  const stations: DrawableStation[] = [];
  for (const f of spec.features ?? []) {
    if (f.kind === 'asteroids') {
      const zone = f.in ? byId.get(f.in) : undefined;
      const region: MapRect = f.region
        ? f.region
        : zone
          ? insetRect(zoneRect(zone, grid), ASTEROID_INSET)
          : insetRect([0, 0, grid, grid], 2);
      const fSeed = f.seed ?? seed;
      asteroids.push({
        rocks: sampleAsteroids(region, f.count, fSeed, f.minDist ?? DEFAULT_MIN_DIST),
        seed: fSeed,
        tip: 'Asteroid field — placement is randomized at setup',
      });
    } else {
      stations.push({ preset: f.preset, at: resolvePoint(f.at, grid), label: f.label, tip: f.tip });
    }
  }

  const tokens: ResolvedToken[] = (spec.tokens ?? []).map((tk) => ({
    ...tk,
    at: resolvePoint(tk.at, grid),
  }));

  return {
    grid,
    seed,
    zones: [...setupZone, ...specZones],
    asteroids,
    stations,
    tokens,
    vectors,
  };
}
