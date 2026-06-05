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

import type { ShipId } from '../../data/Ships';
import type {
  ApproachDir,
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
import { placeStation, type HullPoly } from './stationAssembly';

export const DEFAULT_GRID = 9;
const DEFAULT_SETUP_DEPTH = 1.1;
const DEFAULT_MIN_DIST = 1.6;
/** Asteroids stay this far inside their zone's rect so rocks don't spill out. */
const ASTEROID_INSET = 0.3;

export type ResolvedToken =
  | { kind: 'playerStart'; at: readonly [number, number]; playerCount?: number; tip?: string }
  | { kind: 'objective'; at: readonly [number, number]; label?: string; tip?: string }
  | {
      kind: 'relay';
      at: readonly [number, number];
      label?: string;
      playerCount?: number;
      tip?: string;
    }
  | {
      kind: 'structure';
      at: readonly [number, number];
      /** Orientation (deg) of the parent hull panel, so the module box aligns. */
      angle?: number;
      label?: string;
      playerCount?: number;
      tip?: string;
    }
  | {
      kind: 'ship';
      at: readonly [number, number];
      ship: ShipId;
      hue?: MapHue;
      label?: string;
      playerCount?: number;
      tip?: string;
    }
  | {
      kind: 'transport';
      at: readonly [number, number];
      angle?: number;
      length?: number;
      width?: number;
      label?: string;
      playerCount?: number;
      tip?: string;
    };

export interface DrawableVector {
  n: number;
  side: MapSide;
  /** Fraction along the edge, 0..1 from its clockwise-start corner. */
  t: number;
  /** Board corner this badge sits on, if any — drawn pointing diagonally inward. */
  corner?: 'bl' | 'tl' | 'tr' | 'br';
  /**
   * Interior anchor (grid coords) for a lettered approach vector that sits on an
   * inner intersection instead of the board edge. When present, `dir` gives the
   * direction it points along and `label` overrides the number in the badge.
   */
  at?: readonly [number, number];
  dir?: ApproachDir;
  label?: string;
}

export interface DrawableAsteroids {
  rocks: readonly (readonly [number, number])[];
  /** Red "debris" rocks, sampled in the same pass so they stay spaced from `rocks`. */
  debris: readonly (readonly [number, number])[];
  /** Subset of `rocks` (by position) carrying a Sensor Beacon emplacement. */
  beacons: readonly (readonly [number, number])[];
  seed: number;
  tip?: string;
}

export interface DrawableMines {
  mines: readonly (readonly [number, number])[];
  seed: number;
  tip?: string;
}

export interface DrawableIonStorms {
  clouds: readonly (readonly [number, number])[];
  seed: number;
  /** Cloud radius in cells. */
  size: number;
  tip?: string;
}

export interface DrawableStation {
  preset: 'triHub' | 'bar';
  at: readonly [number, number];
  label?: string;
  tip?: string;
}

export interface DrawableHull {
  /** Pre-positioned outline polygons (hub, tiles, connectors), in cell coords. */
  polys: readonly HullPoly[];
  tip?: string;
}

export interface DrawableMap {
  grid: number;
  seed: number;
  /** Setup edge synthesised as the first zone (warn-hued band) when present. */
  zones: readonly (MapZone & { hue: MapHue })[];
  asteroids: readonly DrawableAsteroids[];
  minefields: readonly DrawableMines[];
  ionStorms: readonly DrawableIonStorms[];
  stations: readonly DrawableStation[];
  hulls: readonly DrawableHull[];
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
  return simpleVectorReaches12(v);
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

/**
 * Full-perimeter ring for central-setup maps (no setup edge). Numbered 1..count
 * clockwise starting at the bottom-left corner: up the left edge, across the
 * top, down the right edge, then back across the bottom. Corners (1,4,7,10 for
 * a 12-ring) sit exactly on the board corners, matching the printed map.
 */
export function vectorRingPerimeter(count: 6 | 12): DrawableVector[] {
  if (count === 12) {
    return [
      { n: 1, side: 'left', t: 1, corner: 'bl' }, // bottom-left corner
      { n: 2, side: 'left', t: 2 / 3 },
      { n: 3, side: 'left', t: 1 / 3 },
      { n: 4, side: 'top', t: 0, corner: 'tl' }, // top-left corner
      { n: 5, side: 'top', t: 1 / 3 },
      { n: 6, side: 'top', t: 2 / 3 },
      { n: 7, side: 'right', t: 0, corner: 'tr' }, // top-right corner
      { n: 8, side: 'right', t: 1 / 3 },
      { n: 9, side: 'right', t: 2 / 3 },
      { n: 10, side: 'bottom', t: 1, corner: 'br' }, // bottom-right corner
      { n: 11, side: 'bottom', t: 2 / 3 },
      { n: 12, side: 'bottom', t: 1 / 3 },
    ];
  }
  return [
    { n: 1, side: 'left', t: 1, corner: 'bl' }, // bottom-left corner
    { n: 2, side: 'left', t: 1 / 3 },
    { n: 3, side: 'top', t: 1 / 3 },
    { n: 4, side: 'top', t: 2 / 3 },
    { n: 5, side: 'right', t: 2 / 3 },
    { n: 6, side: 'bottom', t: 1 / 2 },
  ];
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
  if (zone.tri) {
    const pts = zone.tri.map((p) => resolvePoint(p, grid));
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  const p = zone.point ?? [grid / 2, grid / 2];
  return [p[0], p[1], p[0], p[1]];
}

type Pt = readonly [number, number];

/** Resolve a triangle zone's three vertices to concrete cell coords. */
function triPoints(zone: MapZone, grid: number): readonly [Pt, Pt, Pt] {
  const t = zone.tri ?? ([[0, 0], [0, 0], [0, 0]] as const);
  return [resolvePoint(t[0], grid), resolvePoint(t[1], grid), resolvePoint(t[2], grid)];
}

/** Shrink a triangle toward its centroid by `by` cells per vertex (keeps mines off the edges). */
function insetTriangle(tri: readonly [Pt, Pt, Pt], by: number): readonly [Pt, Pt, Pt] {
  const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
  const cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
  return tri.map(([x, y]) => {
    const dx = cx - x;
    const dy = cy - y;
    const len = Math.hypot(dx, dy) || 1;
    return [x + (dx / len) * by, y + (dy / len) * by] as Pt;
  }) as unknown as readonly [Pt, Pt, Pt];
}

function pointInTriangle(px: number, py: number, [a, b, c]: readonly [Pt, Pt, Pt]): boolean {
  const cross = (p: Pt, q: Pt) => (px - q[0]) * (p[1] - q[1]) - (p[0] - q[0]) * (py - q[1]);
  const d1 = cross(a, b);
  const d2 = cross(b, c);
  const d3 = cross(c, a);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
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
  accept?: (x: number, y: number) => boolean,
): (readonly [number, number])[] {
  const rng = mulberry32((seed >>> 0) * 2654435761);
  const [x0, y0, x1, y1] = region;
  const placed: [number, number][] = [];
  let guard = 0;
  while (placed.length < count && guard < 5000) {
    guard++;
    const x = x0 + rng() * (x1 - x0);
    const y = y0 + rng() * (y1 - y0);
    if (accept && !accept(x, y)) continue;
    if (placed.every((p) => Math.hypot(p[0] - x, p[1] - y) >= minDist)) placed.push([x, y]);
  }
  return placed;
}

// --- top-level resolve ------------------------------------------------------

function insetRect(r: MapRect, by: number): MapRect {
  return [r[0] + by, r[1] + by, r[2] - by, r[3] - by];
}

/**
 * Resolve a scenario's map for a given player count. Tokens carrying a
 * `playerCount` threshold are kept only when `playerCount >= threshold` (the
 * board grows with the table size, the way the printed maps add shuttles,
 * cargo, and turbolasers at higher counts). Omit `playerCount` to show every
 * token regardless of threshold.
 */
export function resolveMissionMap(scenario: Scenario, playerCount?: number): DrawableMap {
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
    // Central-setup maps (no setup edge) get a full-perimeter ring with corners;
    // edge-setup maps get the swept ring over the three non-setup edges.
    vectors = setupEdge ? vectorRing(setupEdge.side, count) : vectorRingPerimeter(count);
  } else {
    vectors = vspec.map((v) => ({ n: v.n, side: v.side, t: v.t }));
  }

  // Lettered interior approach vectors (e.g. C/D/E/F) — drawn as inward-pointing
  // chevrons on inner intersections, in addition to any edge ring above.
  (spec.approaches ?? []).forEach((a, i) => {
    vectors.push({
      n: 100 + i,
      side: 'top',
      t: 0,
      at: resolvePoint(a.at, grid),
      dir: a.dir,
      label: a.label,
    });
  });

  // Features → asteroids + stations.
  const byId = new Map(specZones.filter((z) => z.id).map((z) => [z.id, z] as const));
  const asteroids: DrawableAsteroids[] = [];
  const minefields: DrawableMines[] = [];
  const ionStorms: DrawableIonStorms[] = [];
  const stations: DrawableStation[] = [];
  const hulls: DrawableHull[] = [];
  const stationTokens: ResolvedToken[] = [];
  for (const f of spec.features ?? []) {
    if (f.kind === 'hull') {
      const placed = placeStation(f.root, resolvePoint(f.at, grid), f.connectorWidth ?? 0.28, playerCount);
      hulls.push({ polys: placed.polys, tip: f.tip });
      stationTokens.push(...placed.tokens);
    } else if (f.kind === 'asteroids') {
      const zone = f.in ? byId.get(f.in) : undefined;
      const region: MapRect =
        f.region ??
        (zone ? insetRect(zoneRect(zone, grid), ASTEROID_INSET) : insetRect([0, 0, grid, grid], 2));
      const fSeed = f.seed ?? seed;
      const debrisCount = f.debris ?? 0;
      const all = sampleAsteroids(region, f.count + debrisCount, fSeed, f.minDist ?? DEFAULT_MIN_DIST);
      const rocks = all.slice(0, f.count);
      const beaconCount = f.beaconsPerPlayer
        ? Math.min(rocks.length, f.beaconsPerPlayer * (playerCount ?? 2))
        : 0;
      asteroids.push({
        rocks,
        debris: all.slice(f.count),
        beacons: rocks.slice(0, beaconCount),
        seed: fSeed,
        tip:
          debrisCount > 0
            ? 'Asteroid & debris field — placement is randomized at setup'
            : beaconCount > 0
              ? 'Asteroid field — Sensor Beacons (satellite tokens) are placed on random asteroids at setup'
              : 'Asteroid field — placement is randomized at setup',
      });
    } else if (f.kind === 'minefields') {
      const zone = f.in ? byId.get(f.in) : undefined;
      const fSeed = f.seed ?? seed;
      const total = (f.perPlayer ? f.perPlayer * (playerCount ?? 2) : 0) + (f.count ?? 0);
      // Triangle zones clip the scatter to the inset triangle; otherwise sample
      // the (inset) bounding rect as for asteroids.
      const accept =
        zone?.tri
          ? (() => {
              const inset = insetTriangle(triPoints(zone, grid), 0.7);
              return (x: number, y: number) => pointInTriangle(x, y, inset);
            })()
          : undefined;
      const region: MapRect =
        f.region ??
        (zone ? insetRect(zoneRect(zone, grid), ASTEROID_INSET) : insetRect([0, 0, grid, grid], 2));
      const mines = sampleAsteroids(region, total, fSeed, f.minDist ?? 1.2, accept);
      minefields.push({
        mines,
        seed: fSeed,
        tip:
          f.tip ??
          'Minefield — each token placed just beyond Range 1 from two others and Range 1+ from the edge',
      });
    } else if (f.kind === 'ionStorms') {
      const zone = f.in ? byId.get(f.in) : undefined;
      const region: MapRect =
        f.region ??
        (zone ? insetRect(zoneRect(zone, grid), ASTEROID_INSET) : insetRect([0, 0, grid, grid], 1.5));
      const fSeed = f.seed ?? seed;
      const size = f.size ?? 0.95;
      const clouds = sampleAsteroids(region, f.count, fSeed, f.minDist ?? 1.9);
      ionStorms.push({
        clouds,
        seed: fSeed,
        size,
        tip:
          f.tip ??
          'Ion storms — large ion clouds; placement is randomized at setup, Range >1 apart',
      });
    } else {
      stations.push({ preset: f.preset, at: resolvePoint(f.at, grid), label: f.label, tip: f.tip });
    }
  }

  const tokens: ResolvedToken[] = [
    ...(spec.tokens ?? [])
      .filter((tk) => {
        const threshold = 'playerCount' in tk ? tk.playerCount : undefined;
        return playerCount === undefined || threshold === undefined || playerCount >= threshold;
      })
      .map((tk) => ({
        ...tk,
        at: resolvePoint(tk.at, grid),
      })),
    ...stationTokens,
  ];

  return {
    grid,
    seed,
    zones: [...setupZone, ...specZones],
    asteroids,
    minefields,
    ionStorms,
    hulls,
    stations,
    tokens,
    vectors,
  };
}
