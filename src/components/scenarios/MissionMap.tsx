/**
 * <MissionMap> — renders a scenario's `map` spec as a stylized holo SVG board,
 * replacing the ASCII `mapDiagram` in the briefing. All geometry comes from the
 * pure resolver in `missionMapModel`; this file is just the SVG/JSX drawing of
 * the resolved `DrawableMap`. Colors map to the app's `--accent-*` tokens.
 */

import type { ReactElement } from 'react';
import type { ShipId } from '../../data/Ships';
import type { ApproachDir, MapHue, MapSide, Scenario } from '../../data/scenarios/types';
import {
  resolveMissionMap,
  zoneRect,
  type DrawableAsteroids,
  type DrawableHull,
  type DrawableIonStorms,
  type DrawableMap,
  type DrawableMines,
  type DrawableStation,
  type DrawableVector,
  type ResolvedToken,
} from './missionMapModel';
import './MissionMap.css';

const CELL = 66;
const MARGIN = 60;

// Shared GR-75 transport hull size (cells). Single source of truth — scenarios
// may still override per-token, but normally inherit these so every map draws
// the transport at a consistent scale.
const GR75_LENGTH = 2.1;
const GR75_WIDTH = 0.7;

const HUE: Record<MapHue, string> = {
  holo: 'var(--accent-holo)',
  warn: 'var(--accent-warn)',
  danger: 'var(--accent-danger)',
};

// Brighter fills for ship silhouettes — friendlies lift to near-white cyan to
// match the squad card's --accent-holo-bright glyph; hostiles stay alert-red.
const SHIP_FILL: Record<MapHue, string> = {
  holo: 'var(--accent-holo-bright)',
  warn: 'var(--accent-warn)',
  danger: 'var(--accent-danger)',
};

/**
 * Internal `ShipId` → glyph character in the vendored `XWingShip` icon font
 * (see `src/fonts/xwing-miniatures.css`). Only the ships that actually appear
 * on mission maps need an entry; extend as new maps are authored.
 */
const SHIP_GLYPH_CHAR: Partial<Record<ShipId, string>> = {
  TIELN: 'F',
  TIEIN: 'I',
  LAMBDA: 'l',
  TIESA: 'B',
  TIEADVX: 'A',
  TIEDEF: 'D',
  TIEPH: 'P',
  HWK290: 'h',
  OUTER_RIM_SMUGGLER: 'o',
};

interface Geo {
  grid: number;
  size: number;
  vb: number;
  X: (g: number) => number;
  Y: (g: number) => number;
}

function makeGeo(grid: number): Geo {
  const size = grid * CELL;
  return {
    grid,
    size,
    vb: size + MARGIN * 2,
    X: (g) => MARGIN + g * CELL,
    Y: (g) => MARGIN + g * CELL,
  };
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

function LabelBadge({ cx, cy, text, hue }: { cx: number; cy: number; text: string; hue: MapHue }) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={16}
        fill={HUE[hue]}
        fillOpacity={0.95}
        stroke="#eaffff"
        strokeWidth={1.4}
        filter="url(#mm-glow)"
      />
      <text
        x={cx}
        y={cy + 1}
        fill="#04121b"
        fontSize={18}
        fontWeight={800}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {text}
      </text>
    </g>
  );
}

function Defs() {
  return (
    <defs>
      {/* General stroke glow — tight halo hugging the vectors. */}
      <filter id="mm-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* Two-tier bloom mirroring the squad card's
       * drop-shadow(0 0 4px) + drop-shadow(0 0 8px) — a soft inner halo over a
       * wider diffuse glow. Used for ship silhouettes and headline tokens. */}
      <filter id="mm-bloom" x="-75%" y="-75%" width="250%" height="250%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="inner" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="outer" />
        <feMerge>
          <feMergeNode in="outer" />
          <feMergeNode in="inner" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* Diagonal hatch fills for hazard areas — reads as "marked/dangerous"
       * far better than a red dashed border (frees red for actual threats). */}
      <pattern id="mm-hatch-danger" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="7" stroke="var(--accent-danger)" strokeWidth="1" strokeOpacity="0.45" />
      </pattern>
    </defs>
  );
}

/** Points string for a rect with two clipped corners (top-right + bottom-left),
 * echoing the squad-card / modal panel cut. */
function clippedRectPoints(x: number, y: number, w: number, h: number, cut: number): string {
  const f = (n: number) => n.toFixed(1);
  return [
    `${f(x)},${f(y)}`,
    `${f(x + w - cut)},${f(y)}`,
    `${f(x + w)},${f(y + cut)}`,
    `${f(x + w)},${f(y + h)}`,
    `${f(x + cut)},${f(y + h)}`,
    `${f(x)},${f(y + h - cut)}`,
  ].join(' ');
}

/** Four L-shaped registration brackets at a rect's corners (open edges) — the
 * SW "designated area" idiom, used instead of a full dashed border. */
function CornerBrackets({ x, y, w, h, col, arm = 14 }: { x: number; y: number; w: number; h: number; col: string; arm?: number }) {
  const f = (n: number) => n.toFixed(1);
  const L = (cx: number, cy: number, sx: number, sy: number, k: string) => (
    <path
      key={k}
      d={`M ${f(cx + sx * arm)} ${f(cy)} L ${f(cx)} ${f(cy)} L ${f(cx)} ${f(cy + sy * arm)}`}
      fill="none"
      stroke={col}
      strokeWidth={1.6}
      strokeOpacity={0.95}
      strokeLinecap="round"
    />
  );
  return (
    <g>
      {L(x, y, 1, 1, 'a')}
      {L(x + w, y, -1, 1, 'b')}
      {L(x, y + h, 1, -1, 'c')}
      {L(x + w, y + h, -1, -1, 'd')}
    </g>
  );
}

function Starfield({ geo, seed }: { geo: Geo; seed: number }) {
  const r = mulberry32(seed);
  const stars: ReactElement[] = [];
  for (let i = 0; i < 90; i++) {
    stars.push(
      <circle
        key={i}
        cx={+(MARGIN + r() * geo.size).toFixed(1)}
        cy={+(MARGIN + r() * geo.size).toFixed(1)}
        r={+(r() * 0.9 + 0.2).toFixed(2)}
        fill="#bfe6ff"
        fillOpacity={+(r() * 0.4 + 0.08).toFixed(2)}
      />,
    );
  }
  return <g>{stars}</g>;
}

function Grid({ geo }: { geo: Geo }) {
  const { grid, size, X, Y } = geo;
  const third = grid / 3;
  const twoThird = (2 * grid) / 3;
  const lines: ReactElement[] = [];
  for (let i = 1; i < grid; i++) {
    const major = i === third || i === twoThird;
    // Two-tier hierarchy: major thirds read clearly in full holo cyan; minor
    // cells are a crisp solid hairline (not dashed) kept subordinate by opacity
    // — bright lines on near-black, like the reference schematics.
    const common = major
      ? { stroke: 'var(--accent-holo)', strokeWidth: 1, strokeOpacity: 0.55 }
      : {
          stroke: 'var(--accent-holo)',
          strokeWidth: 0.6,
          strokeOpacity: 0.22,
        };
    lines.push(<line key={`v${i.toString()}`} x1={X(i)} y1={Y(0)} x2={X(i)} y2={Y(grid)} {...common} />);
    lines.push(<line key={`h${i.toString()}`} x1={X(0)} y1={Y(i)} x2={X(grid)} y2={Y(i)} {...common} />);
  }
  // Small registration crosses where the major thirds intersect.
  const crosses: ReactElement[] = [];
  const c = 5;
  for (const gx of [third, twoThird]) {
    for (const gy of [third, twoThird]) {
      const px = X(gx);
      const py = Y(gy);
      crosses.push(
        <g key={`x${gx.toString()}-${gy.toString()}`} stroke="var(--accent-holo)" strokeWidth={1} strokeOpacity={0.7}>
          <line x1={px - c} y1={py} x2={px + c} y2={py} />
          <line x1={px} y1={py - c} x2={px} y2={py + c} />
        </g>,
      );
    }
  }
  return (
    <g>
      {lines}
      {crosses}
      <rect
        x={X(0)}
        y={Y(0)}
        width={size}
        height={size}
        fill="none"
        stroke="var(--accent-holo-bright)"
        strokeWidth={2}
        strokeOpacity={1}
        filter="url(#mm-glow)"
      />
    </g>
  );
}

/**
 * Diegetic readout chrome drawn in the SVG margin: corner registration
 * brackets hugging the board, tick-scale rulers down every edge, and two
 * faint mono corner labels. Pure instrument framing — no gameplay meaning —
 * so it reads as a holoprojector display rather than a bare diagram.
 */
function Frame({ geo }: { geo: Geo }) {
  const { grid, X, Y } = geo;
  const f = (n: number) => n.toFixed(1);
  const off = 8; // sit just outside the board border
  const x0 = X(0) - off;
  const x1 = X(grid) + off;
  const y0 = Y(0) - off;
  const y1 = Y(grid) + off;

  // L-shaped registration bracket at each board corner.
  const arm = 22;
  const bracket = (cx: number, cy: number, sx: number, sy: number, key: string) => (
    <path
      key={key}
      d={`M ${f(cx + sx * arm)} ${f(cy)} L ${f(cx)} ${f(cy)} L ${f(cx)} ${f(cy + sy * arm)}`}
      fill="none"
      stroke="var(--accent-holo-bright)"
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  );

  // Tick-scale rulers: a short tick at every cell boundary on all four edges,
  // a longer tick at the major thirds. Dim, so they frame without competing.
  const ticks: ReactElement[] = [];
  const minorLen = 4;
  const majorLen = 9;
  const third = grid / 3;
  const twoThird = (2 * grid) / 3;
  for (let i = 0; i <= grid; i++) {
    const major = i === 0 || i === grid || i === third || i === twoThird;
    const len = major ? majorLen : minorLen;
    const opacity = major ? 1 : 0.55;
    const tickProps = { stroke: 'var(--accent-holo)', strokeWidth: 1, strokeOpacity: opacity } as const;
    const gx = X(i);
    const gy = Y(i);
    // top + bottom (vertical ticks)
    ticks.push(<line key={`tt${i.toString()}`} x1={gx} y1={y0} x2={gx} y2={y0 - len} {...tickProps} />);
    ticks.push(<line key={`tb${i.toString()}`} x1={gx} y1={y1} x2={gx} y2={y1 + len} {...tickProps} />);
    // left + right (horizontal ticks)
    ticks.push(<line key={`tl${i.toString()}`} x1={x0} y1={gy} x2={x0 - len} y2={gy} {...tickProps} />);
    ticks.push(<line key={`tr${i.toString()}`} x1={x1} y1={gy} x2={x1 + len} y2={gy} {...tickProps} />);
  }

  const labelProps = {
    fill: 'var(--accent-holo-dim, rgba(90,200,255,0.45))',
    fontFamily: 'var(--mono, monospace)',
    fontSize: 11,
    letterSpacing: '0.18em',
  } as const;

  return (
    <g aria-hidden="true">
      <g filter="url(#mm-glow)">
        {bracket(x0, y0, 1, 1, 'tl')}
        {bracket(x1, y0, -1, 1, 'tr')}
        {bracket(x0, y1, 1, -1, 'bl')}
        {bracket(x1, y1, -1, -1, 'br')}
      </g>
      {ticks}
      <text x={x0 - 2} y={y0 - 18} textAnchor="start" {...labelProps}>
        {`GRID ${grid.toString()}·${grid.toString()}`}
      </text>
      <text x={x1 + 2} y={y1 + 26} textAnchor="end" {...labelProps}>
        {'· REBEL TACNET ·'}
      </text>
    </g>
  );
}

/* Decorative fake-Aurebesh glyphs (geometric, not transcribed) — each drawn in
 * a ~10×13 cell starting at x=0. Same idiom as the squad card's Aurebesh strip. */
const AUREBESH_GLYPHS = [
  'M0 13 L5 1 L10 13 M2 9 L8 9',
  'M0 1 L0 13 M0 2 L5 2 L5 6 L0 6 M0 8 L5 8 L5 12 L0 12',
  'M0 1 L6 1 L6 7 L0 7 L6 13 L0 13',
  'M0 1 L0 13 L6 13 M0 1 L6 1 M0 7 L4 7',
  'M0 1 L0 13 M0 1 L6 4 L0 7 M0 13 L6 10',
  'M0 1 L6 1 L6 13 L0 13 M0 7 L6 7',
  'M0 13 L5 1 L10 13',
  'M0 1 L0 13 M6 1 L6 13 M0 7 L6 7',
  'M0 1 L6 1 L6 13 M0 1 L0 13 L6 13',
  'M0 1 L6 1 L6 7 L0 7 L0 13 L6 13',
] as const;

/** A short row of decorative Aurebesh glyphs (a "data label"). */
function AurebeshStrip({ x, y, count, scale = 1, col, seed = 7, opacity = 0.55 }: { x: number; y: number; count: number; scale?: number; col: string; seed?: number; opacity?: number }) {
  return (
    <g
      aria-hidden="true"
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(3)})`}
      fill="none"
      stroke={col}
      strokeWidth={1.1 / scale}
      strokeOpacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {Array.from({ length: count }, (_, i) => (
        <path key={i} transform={`translate(${(i * 13).toString()} 0)`} d={AUREBESH_GLYPHS[(seed + i * 7) % AUREBESH_GLYPHS.length]} />
      ))}
    </g>
  );
}

/** A small radial instrument bezel — concentric ring, degree ticks, and a
 * filled reading wedge. Pure decoration; evokes the nav-plot dials (swtfa11/14). */
function DialGauge({ cx, cy, r, col }: { cx: number; cy: number; r: number; col: string }) {
  const f = (n: number) => n.toFixed(1);
  const ticks: ReactElement[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const major = i % 6 === 0;
    const ri = major ? r - 5 : r - 2.5;
    ticks.push(
      <line key={i} x1={f(cx + Math.cos(a) * ri)} y1={f(cy + Math.sin(a) * ri)} x2={f(cx + Math.cos(a) * r)} y2={f(cy + Math.sin(a) * r)} strokeWidth={major ? 1.1 : 0.6} strokeOpacity={0.7} />,
    );
  }
  const a0 = -Math.PI / 2;
  const a1 = a0 + (95 * Math.PI) / 180;
  const rr = r - 4;
  const wedge = `M ${f(cx)} ${f(cy)} L ${f(cx + Math.cos(a0) * rr)} ${f(cy + Math.sin(a0) * rr)} A ${f(rr)} ${f(rr)} 0 0 1 ${f(cx + Math.cos(a1) * rr)} ${f(cy + Math.sin(a1) * rr)} Z`;
  return (
    <g aria-hidden="true" stroke={col}>
      <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={1} strokeOpacity={0.55} />
      <path d={wedge} fill={col} fillOpacity={0.18} stroke="none" />
      {ticks}
      <circle cx={cx} cy={cy} r={r * 0.4} fill="none" strokeWidth={0.7} strokeOpacity={0.5} />
      <circle cx={cx} cy={cy} r={1.6} fill={col} stroke="none" />
    </g>
  );
}

/** A tiny bar-graph readout — a row of vertical bars on a baseline. */
function BarReadout({ x, y, col }: { x: number; y: number; col: string }) {
  const bars = [6, 11, 8, 14, 5, 9];
  return (
    <g aria-hidden="true" stroke={col} strokeOpacity={0.6}>
      {bars.map((v, i) => (
        <line key={i} x1={x + i * 5} y1={y} x2={x + i * 5} y2={y - v} strokeWidth={2.4} />
      ))}
      <line x1={x - 2} y1={y} x2={x + bars.length * 5} y2={y} strokeWidth={0.8} strokeOpacity={0.4} />
    </g>
  );
}

/** Decorative instrument cluster in the margin corners (vector-badge-free real
 * estate). Adds the dense "in-universe console" texture without touching the
 * play grid. All aria-hidden. */
function MarginInstruments({ geo }: { geo: Geo }) {
  const { vb } = geo;
  const dim = 'var(--accent-holo-dim)';
  const holo = 'var(--accent-holo)';
  return (
    <g aria-hidden="true">
      <DialGauge cx={vb - 32} cy={32} r={16} col={holo} />
      <AurebeshStrip x={12} y={42} count={4} scale={0.95} col={dim} seed={2} />
      <BarReadout x={16} y={vb - 24} col={dim} />
      <AurebeshStrip x={vb - 96} y={vb - 52} count={5} scale={0.85} col={dim} seed={6} />
    </g>
  );
}

const OUT_DIR: Record<MapSide, readonly [number, number]> = {
  top: [0, -1],
  bottom: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

/** Outward exit chevrons along the long axis of an escape-edge band rect. */
function ExitChevrons({ rect, side }: { rect: readonly [number, number, number, number]; side: MapSide }) {
  const [x, y, w, h] = rect;
  const [ox, oy] = OUT_DIR[side];
  const perpx = -oy;
  const perpy = ox;
  const horizontal = side === 'top' || side === 'bottom';
  const a = 7;
  const b = 8;
  const cx0 = x + w / 2;
  const cy0 = y + h / 2;
  const span = horizontal ? w : h;
  const chevrons: ReactElement[] = [];
  for (const frac of [-0.28, 0, 0.28]) {
    const px = horizontal ? cx0 + frac * span : cx0;
    const py = horizontal ? cy0 : cy0 + frac * span;
    const f = (n: number) => n.toFixed(1);
    chevrons.push(
      <polyline
        key={frac}
        points={`${f(px + perpx * a)},${f(py + perpy * a)} ${f(px + ox * b)},${f(py + oy * b)} ${f(px - perpx * a)},${f(py - perpy * a)}`}
        fill="none"
        stroke="var(--accent-warn)"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />,
    );
  }
  return <g filter="url(#mm-glow)">{chevrons}</g>;
}

type Zone = DrawableMap['zones'][number];

function Zone({ geo, zone }: { geo: Geo; zone: Zone }) {
  const { grid, X, Y } = geo;
  const col = HUE[zone.hue];
  // Danger zones read as a diagonal-hatched region with a solid bright edge;
  // everything else (holo/warn) reads as a faint tint enclosed by corner
  // brackets / solid edge — no interrupted/dashed borders anywhere. Hatch is
  // reserved for real threats so it keeps its "stay out" meaning.
  const isHazard = zone.hue === 'danger';
  const hatch = 'url(#mm-hatch-danger)';
  let body: ReactElement | null = null;
  let bx = 0;
  let by = 0;

  if (zone.band) {
    const { side, depth, span } = zone.band;
    const [a, b] = span ?? [0, grid];
    const d = depth * CELL;
    let x = 0;
    let y = 0;
    let w = 0;
    let h = 0;
    if (side === 'bottom') {
      x = X(a);
      y = Y(grid) - d;
      w = X(b) - X(a);
      h = d;
      bx = (X(a) + X(b)) / 2;
      by = Y(grid) - d / 2;
    } else if (side === 'top') {
      x = X(a);
      y = Y(0);
      w = X(b) - X(a);
      h = d;
      bx = (X(a) + X(b)) / 2;
      by = Y(0) + d / 2;
    } else if (side === 'left') {
      x = X(0);
      y = Y(a);
      w = d;
      h = Y(b) - Y(a);
      bx = X(0) + d / 2;
      by = (Y(a) + Y(b)) / 2;
    } else {
      x = X(grid) - d;
      y = Y(a);
      w = d;
      h = Y(b) - Y(a);
      bx = X(grid) - d / 2;
      by = (Y(a) + Y(b)) / 2;
    }
    const clip = clippedRectPoints(x, y, w, h, Math.min(10, w / 3, h / 3));
    body = isHazard ? (
      <>
        <polygon points={clip} fill={hatch} />
        <polygon points={clip} fill="none" stroke={col} strokeWidth={1.6} strokeOpacity={0.95} />
        {zone.exit ? <ExitChevrons rect={[x, y, w, h]} side={zone.exit} /> : null}
      </>
    ) : (
      <>
        <polygon points={clip} fill={col} fillOpacity={0.1} />
        <CornerBrackets x={x} y={y} w={w} h={h} col={col} />
        {zone.exit ? <ExitChevrons rect={[x, y, w, h]} side={zone.exit} /> : null}
      </>
    );
  } else if (zone.rect) {
    const [rx0, ry0, rx1, ry1] = zone.rect;
    const x = X(rx0);
    const y = Y(ry0);
    const w = X(rx1) - X(rx0);
    const h = Y(ry1) - Y(ry0);
    const showEdge = zone.border !== false;
    const clip = clippedRectPoints(x, y, w, h, Math.min(10, w / 3, h / 3));
    body = isHazard ? (
      <>
        <polygon points={clip} fill={hatch} />
        {showEdge ? <polygon points={clip} fill="none" stroke={col} strokeWidth={1.6} strokeOpacity={0.95} /> : null}
      </>
    ) : (
      <>
        <polygon points={clip} fill={col} fillOpacity={0.08} />
        {showEdge ? <CornerBrackets x={x} y={y} w={w} h={h} col={col} /> : null}
      </>
    );
    bx = X(rx0) + 20;
    by = Y(ry0) + 20;
  } else if (zone.disc) {
    const [x0, y0, x1, y1] = zoneRect(zone, grid);
    const cx = (X(x0) + X(x1)) / 2;
    const cy = (Y(y0) + Y(y1)) / 2;
    const r = ((X(x1) - X(x0)) / 2);
    body = (
      <>
        <circle cx={cx} cy={cy} r={r} fill={isHazard ? hatch : col} fillOpacity={isHazard ? 1 : 0.1} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={1.5} strokeOpacity={0.92} />
      </>
    );
    bx = cx;
    by = cy;
  } else if (zone.corner) {
    const { corner, radius } = zone.corner;
    const R = radius * CELL;
    const dirX = corner.includes('l') ? 1 : -1;
    const dirY = corner.includes('t') ? 1 : -1;
    const cx = corner.includes('l') ? X(0) : X(grid);
    const cy = corner.includes('t') ? Y(0) : Y(grid);
    // Quarter-disc tucked into the corner: from the corner, out along one edge,
    // a 90° arc, back in along the other edge. `sweep` is chosen so the arc
    // bulges into the board.
    const ex = cx + dirX * R;
    const ey = cy + dirY * R;
    const sweep = dirX * dirY > 0 ? 1 : 0;
    const d = `M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${ex.toFixed(1)} ${cy.toFixed(1)} A ${R.toFixed(1)} ${R.toFixed(1)} 0 0 ${sweep.toString()} ${cx.toFixed(1)} ${ey.toFixed(1)} Z`;
    body = (
      <>
        <path d={d} fill={isHazard ? hatch : col} fillOpacity={isHazard ? 1 : 0.1} />
        <path d={d} fill="none" stroke={col} strokeWidth={1.5} strokeOpacity={0.92} />
      </>
    );
    bx = cx + dirX * R * 0.5;
    by = cy + dirY * R * 0.5;
  } else if (zone.tri) {
    const pts = zone.tri.map((p) => (p === 'center' ? ([grid / 2, grid / 2] as const) : p));
    const pointsAttr = pts.map(([gx, gy]) => `${X(gx).toFixed(1)},${Y(gy).toFixed(1)}`).join(' ');
    body = (
      <>
        <polygon points={pointsAttr} fill={isHazard ? hatch : col} fillOpacity={isHazard ? 1 : 0.08} />
        <polygon points={pointsAttr} fill="none" stroke={col} strokeWidth={1.5} strokeOpacity={0.92} />
      </>
    );
    bx = X((pts[0][0] + pts[1][0] + pts[2][0]) / 3);
    by = Y((pts[0][1] + pts[1][1] + pts[2][1]) / 3);
  } else {
    const p = zone.point ?? [grid / 2, grid / 2];
    bx = X(p[0]);
    by = Y(p[1]);
  }

  if (zone.labelAt) {
    bx = X(zone.labelAt[0]);
    by = Y(zone.labelAt[1]);
  }

  return (
    <g>
      {zone.tip ? <title>{zone.tip}</title> : null}
      {body}
      {zone.label ? <LabelBadge cx={bx} cy={by} text={zone.label} hue={zone.hue} /> : null}
    </g>
  );
}

function AsteroidPolygon({
  cx,
  cy,
  base,
  rng,
  stroke,
}: {
  cx: number;
  cy: number;
  base: number;
  rng: () => number;
  stroke: string;
}) {
  const n = 8 + Math.floor(rng() * 3);
  const verts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const rad = base * (0.6 + rng() * 0.5);
    verts.push([cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad * 0.82]);
  }
  const pts = verts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  // Two internal facet lines across the body → a low-poly "scanned rock"
  // rather than a hollow blob (cf. the faceted Falcon wireframe, swtfa13).
  const seg = (a: number, b: number) =>
    `M ${verts[a][0].toFixed(1)} ${verts[a][1].toFixed(1)} L ${verts[b][0].toFixed(1)} ${verts[b][1].toFixed(1)}`;
  const facets = `${seg(0, Math.floor(n / 2))} ${seg(Math.floor(n / 3), Math.floor((2 * n) / 3))}`;
  return (
    <g stroke={stroke} strokeLinejoin="round">
      <polygon points={pts} fill="#6f8598" fillOpacity={0.18} strokeWidth={1.7} strokeOpacity={0.8} />
      <path d={facets} fill="none" strokeWidth={0.9} strokeOpacity={0.4} />
    </g>
  );
}

/** Small filled chip of debris — visually distinct from a full asteroid so a
 * "field of junk" doesn't read like a cluster of rocks. */
function DebrisChip({ cx, cy, rng, stroke }: { cx: number; cy: number; rng: () => number; stroke: string }) {
  const s = 3 + rng() * 3;
  const n = 3 + Math.floor(rng() * 2);
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng();
    const r = s * (0.7 + rng() * 0.6);
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return <polygon points={pts.join(' ')} fill={stroke} fillOpacity={0.3} stroke={stroke} strokeWidth={0.8} strokeOpacity={0.7} />;
}

function SensorBeacon({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g filter="url(#mm-glow)">
      <line x1={cx} y1={cy - 13} x2={cx} y2={cy - 6} stroke="var(--accent-holo)" strokeWidth={1.4} />
      <circle cx={cx} cy={cy} r={6} fill="var(--accent-holo)" fillOpacity={0.85} stroke="#eaffff" strokeWidth={1.2} />
      <line x1={cx - 9} y1={cy - 9} x2={cx + 9} y2={cy + 9} stroke="var(--accent-holo)" strokeWidth={1.2} strokeOpacity={0.8} />
      <line x1={cx + 9} y1={cy - 9} x2={cx - 9} y2={cy + 9} stroke="var(--accent-holo)" strokeWidth={1.2} strokeOpacity={0.8} />
    </g>
  );
}

function AsteroidField({ geo, field }: { geo: Geo; field: DrawableAsteroids }) {
  const rng = mulberry32(((field.seed >>> 0) ^ 0x9e3779b9) >>> 0);
  return (
    <g>
      {field.tip ? <title>{field.tip}</title> : null}
      {field.rocks.map(([gx, gy], i) => (
        <AsteroidPolygon
          key={`a${i.toString()}`}
          cx={geo.X(gx)}
          cy={geo.Y(gy)}
          base={12 + rng() * 8}
          rng={rng}
          stroke="var(--accent-warn)"
        />
      ))}
      {field.debris.map(([gx, gy], i) => (
        <DebrisChip
          key={`d${i.toString()}`}
          cx={geo.X(gx)}
          cy={geo.Y(gy)}
          rng={rng}
          stroke="var(--accent-danger)"
        />
      ))}
      {field.beacons.map(([gx, gy], i) => (
        <SensorBeacon key={`b${i.toString()}`} cx={geo.X(gx)} cy={geo.Y(gy)} />
      ))}
    </g>
  );
}

function Mine({ cx, cy, rng }: { cx: number; cy: number; rng: () => number }) {
  // Proximity mine: a red ring with a small cluster of triangular spikes,
  // echoing the printed minefield tokens.
  const spin = rng() * 60;
  const spikes: ReactElement[] = [];
  for (let k = 0; k < 3; k++) {
    const ang = ((spin + k * 120) * Math.PI) / 180;
    const ax = Math.cos(ang);
    const ay = Math.sin(ang);
    const px = -ay;
    const py = ax;
    const tip = 22;
    const base = 9;
    spikes.push(
      <polygon
        key={k}
        points={[
          `${(cx + ax * tip).toFixed(1)},${(cy + ay * tip).toFixed(1)}`,
          `${(cx + px * base).toFixed(1)},${(cy + py * base).toFixed(1)}`,
          `${(cx - px * base).toFixed(1)},${(cy - py * base).toFixed(1)}`,
        ].join(' ')}
        fill="var(--accent-danger)"
        fillOpacity={0.85}
      />,
    );
  }
  return (
    <g filter="url(#mm-glow)">
      <circle
        cx={cx}
        cy={cy}
        r={13}
        fill="var(--accent-danger)"
        fillOpacity={0.08}
        stroke="var(--accent-danger)"
        strokeWidth={2}
      />
      {spikes}
      <circle cx={cx} cy={cy} r={3} fill="var(--accent-danger)" />
    </g>
  );
}

function MineField({ geo, field }: { geo: Geo; field: DrawableMines }) {
  const rng = mulberry32(((field.seed >>> 0) ^ 0x85ebca6b) >>> 0);
  return (
    <g>
      {field.tip ? <title>{field.tip}</title> : null}
      {field.mines.map(([gx, gy], i) => (
        <Mine key={`m${i.toString()}`} cx={geo.X(gx)} cy={geo.Y(gy)} rng={rng} />
      ))}
    </g>
  );
}

// Build a smooth closed outline through `pts` using a Catmull-Rom spline
// converted to cubic Béziers. Rounds off the corners so a jittered ring of
// points reads as a soft billow rather than a spiky polygon.
function smoothClosedPath(pts: readonly (readonly [number, number])[]): string {
  const n = pts.length;
  if (n < 3) return '';
  const p = (i: number) => pts[((i % n) + n) % n];
  let d = `M ${p(0)[0].toFixed(1)},${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

function IonStorm({ cx, cy, r, rng }: { cx: number; cy: number; r: number; rng: () => number }) {
  // A billowing nebula: a few overlapping irregular lobes layered translucently
  // so they read as one soft ion cloud (much larger than an asteroid rock).
  // Each lobe is a Catmull-Rom-smoothed ring with gentle radial jitter, so the
  // edges curve softly instead of forming sharp polygon corners.
  //
  // Per-cloud character varies to match the reference art: clouds differ in
  // overall size and are gently elongated along a random axis (area-preserving
  // stretch), so the field mixes round blobs with kidney/oblong shapes rather
  // than uniform circles.
  const sizeMul = 0.68 + rng() * 0.3;
  const phi = rng() * Math.PI;
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);
  const sx = Math.sqrt(1 + rng() * 0.4); // long axis (kept modest so clouds stay ~2×2)
  const sy = 1 / sx; // short axis (keeps overall area roughly constant)
  const baseR = r * sizeMul;
  const lobes: ReactElement[] = [];
  for (let l = 0; l < 3; l++) {
    const ox = (rng() - 0.5) * baseR * 0.45;
    const oy = (rng() - 0.5) * baseR * 0.45;
    const lr = baseR * (0.6 + rng() * 0.32);
    const n = 9 + Math.floor(rng() * 3);
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      const rad = lr * (0.84 + rng() * 0.2);
      // build the point in the cloud's local frame, elongate, then rotate by phi
      const lx = (ox + Math.cos(ang) * rad) * sx;
      const ly = (oy + Math.sin(ang) * rad) * sy;
      pts.push([cx + lx * cosP - ly * sinP, cy + lx * sinP + ly * cosP]);
    }
    lobes.push(
      <path
        key={l}
        d={smoothClosedPath(pts)}
        fill="var(--accent-holo)"
        fillOpacity={0.1}
        stroke="var(--accent-holo)"
        strokeWidth={1.4}
        strokeOpacity={0.45}
        strokeLinejoin="round"
      />,
    );
  }
  return <g filter="url(#mm-glow)">{lobes}</g>;
}

function IonStormField({ geo, field }: { geo: Geo; field: DrawableIonStorms }) {
  const rng = mulberry32(((field.seed >>> 0) ^ 0xc2b2ae35) >>> 0);
  return (
    <g>
      {field.tip ? <title>{field.tip}</title> : null}
      {field.clouds.map(([gx, gy], i) => (
        <IonStorm key={`i${i.toString()}`} cx={geo.X(gx)} cy={geo.Y(gy)} r={field.size * CELL} rng={rng} />
      ))}
    </g>
  );
}

function StationTriHub({ cx, cy, label, tip }: { cx: number; cy: number; label?: string; tip?: string }) {
  const arms: ReactElement[] = [];
  for (let k = 0; k < 3; k++) {
    const ang = ((-90 + k * 120) * Math.PI) / 180;
    const ax = Math.cos(ang);
    const ay = Math.sin(ang);
    const pxr = -ay;
    const pyr = ax;
    const d = 26;
    const bx = cx + ax * d;
    const by = cy + ay * d;
    const panel = [
      `${(bx + pxr * 13).toFixed(1)},${(by + pyr * 13).toFixed(1)}`,
      `${(bx - pxr * 13).toFixed(1)},${(by - pyr * 13).toFixed(1)}`,
      `${(bx - pxr * 10 + ax * 18).toFixed(1)},${(by - pyr * 10 + ay * 18).toFixed(1)}`,
      `${(bx + pxr * 10 + ax * 18).toFixed(1)},${(by + pyr * 10 + ay * 18).toFixed(1)}`,
    ].join(' ');
    arms.push(
      <polygon
        key={k}
        points={panel}
        fill="var(--accent-holo)"
        fillOpacity={0.08}
        stroke="var(--accent-holo)"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />,
    );
  }
  return (
    <>
      <g filter="url(#mm-glow)">
        {tip ? <title>{tip}</title> : null}
        {arms}
        <circle
          cx={cx}
          cy={cy}
          r={13}
          fill="var(--accent-holo)"
          fillOpacity={0.12}
          stroke="var(--accent-holo)"
          strokeWidth={1.8}
        />
      </g>
      {label ? <LabelBadge cx={cx} cy={cy + 44} text={label} hue="holo" /> : null}
    </>
  );
}

function StationBar({ cx, cy, label, tip }: { cx: number; cy: number; label?: string; tip?: string }) {
  const w = 78;
  const h = 30;
  const ticks = [-w / 4, 0, w / 4];
  return (
    <>
      <g filter="url(#mm-glow)">
        {tip ? <title>{tip}</title> : null}
        <rect
          x={cx - w / 2}
          y={cy - h / 2}
          width={w}
          height={h}
          rx={6}
          fill="var(--accent-holo)"
          fillOpacity={0.08}
          stroke="var(--accent-holo)"
          strokeWidth={1.8}
        />
        {ticks.map((dx, i) => (
          <line
            key={i}
            x1={cx + dx}
            y1={cy - h / 2}
            x2={cx + dx}
            y2={cy + h / 2}
            stroke="var(--accent-holo)"
            strokeWidth={1}
            strokeOpacity={0.6}
          />
        ))}
      </g>
      {label ? <LabelBadge cx={cx} cy={cy + h} text={label} hue="holo" /> : null}
    </>
  );
}

function Station({ geo, station }: { geo: Geo; station: DrawableStation }) {
  const cx = geo.X(station.at[0]);
  const cy = geo.Y(station.at[1]);
  return station.preset === 'bar' ? (
    <StationBar cx={cx} cy={cy} label={station.label} tip={station.tip} />
  ) : (
    <StationTriHub cx={cx} cy={cy} label={station.label} tip={station.tip} />
  );
}

function Hull({ geo, hull }: { geo: Geo; hull: DrawableHull }) {
  const f = (n: number) => n.toFixed(1);
  return (
    <g filter="url(#mm-glow)">
      {hull.tip ? <title>{hull.tip}</title> : null}
      {hull.polys.map((poly, i) => (
        <polygon
          key={`hp${i.toString()}`}
          points={poly.map(([gx, gy]) => `${f(geo.X(gx))},${f(geo.Y(gy))}`).join(' ')}
          fill="var(--accent-holo)"
          fillOpacity={0.05}
          stroke="var(--accent-holo)"
          strokeWidth={1.6}
          strokeOpacity={0.7}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}

function FighterChevron({ cx, cy, s, color }: { cx: number; cy: number; s: number; color: string }) {
  const f = (n: number) => n.toFixed(1);
  return (
    <path
      d={`M ${f(cx)} ${f(cy - 8 * s)} L ${f(cx + 7 * s)} ${f(cy + 6 * s)} L ${f(cx)} ${f(cy + 2 * s)} L ${f(cx - 7 * s)} ${f(cy + 6 * s)} Z`}
      fill={color}
      stroke="#04121b"
      strokeWidth={0.6}
    />
  );
}

function Token({ geo, token }: { geo: Geo; token: ResolvedToken }) {
  const cx = geo.X(token.at[0]);
  const cy = geo.Y(token.at[1]);
  let body: ReactElement;
  if (token.kind === 'playerStart') {
    body = (
      <>
        <circle
          cx={cx}
          cy={cy}
          r={22}
          fill="none"
          stroke="var(--accent-warn)"
          strokeWidth={2.2}
          filter="url(#mm-glow)"
        />
        <FighterChevron cx={cx} cy={cy + 1} s={1.1} color="#f2f6f8" />
      </>
    );
  } else if (token.kind === 'objective') {
    body = (
      <g filter="url(#mm-glow)">
        <rect
          x={cx - 11}
          y={cy - 11}
          width={22}
          height={22}
          transform={`rotate(45 ${cx.toFixed(1)} ${cy.toFixed(1)})`}
          fill="var(--accent-holo)"
          fillOpacity={0.1}
          stroke="var(--accent-holo)"
          strokeWidth={1.8}
        />
        <circle cx={cx} cy={cy} r={3} fill="var(--accent-holo)" />
      </g>
    );
  } else if (token.kind === 'relay') {
    // Simplified satellite-relay buoy: a small core on landing legs, a broadcast
    // antenna with a beacon, and two signal arcs — reads as a transmitter even
    // at radar scale, distinct from rocks/mines/ships.
    const f = (n: number) => n.toFixed(1);
    body = (
      <>
        <g filter="url(#mm-glow)">
          {/* core body */}
          <circle
            cx={cx}
            cy={cy + 5}
            r={6.5}
            fill="var(--accent-holo)"
            fillOpacity={0.12}
            stroke="var(--accent-holo)"
            strokeWidth={1.6}
          />
          {/* landing legs */}
          <line x1={cx - 4} y1={cy + 9.5} x2={cx - 7} y2={cy + 15} stroke="var(--accent-holo)" strokeWidth={1.4} />
          <line x1={cx + 4} y1={cy + 9.5} x2={cx + 7} y2={cy + 15} stroke="var(--accent-holo)" strokeWidth={1.4} />
          {/* antenna mast + dish crossbar */}
          <line x1={cx} y1={cy - 1} x2={cx} y2={cy - 14} stroke="var(--accent-holo)" strokeWidth={1.6} />
          <line x1={cx - 5} y1={cy - 8} x2={cx + 5} y2={cy - 8} stroke="var(--accent-holo)" strokeWidth={1.4} />
          {/* beacon */}
          <circle cx={cx} cy={cy - 16} r={2.6} fill="var(--accent-holo)" />
          {/* broadcast arcs */}
          <path
            d={`M ${f(cx + 4.5)} ${f(cy - 20)} A 6 6 0 0 1 ${f(cx + 4.5)} ${f(cy - 12)}`}
            fill="none"
            stroke="var(--accent-holo)"
            strokeWidth={1.3}
            strokeOpacity={0.7}
          />
          <path
            d={`M ${f(cx - 4.5)} ${f(cy - 20)} A 6 6 0 0 0 ${f(cx - 4.5)} ${f(cy - 12)}`}
            fill="none"
            stroke="var(--accent-holo)"
            strokeWidth={1.3}
            strokeOpacity={0.7}
          />
        </g>
        {token.label ? <LabelBadge cx={cx + 18} cy={cy - 14} text={token.label} hue="holo" /> : null}
      </>
    );
  } else if (token.kind === 'ship') {
    const hue = token.hue ?? 'holo';
    // Bright fill + two-tier bloom mirrors the squad card's ship silhouette.
    const fill = SHIP_FILL[hue];
    const glyph = SHIP_GLYPH_CHAR[token.ship];
    const hostile = hue === 'danger';
    // Hostile craft get a corner reticle so "tracked contact" reads at a glance.
    const hw = 22;
    const a = 7;
    const f = (n: number) => n.toFixed(1);
    const reticleCorner = (sx: number, sy: number, key: string) => (
      <path
        key={key}
        d={`M ${f(cx + sx * hw - sx * a)} ${f(cy + sy * hw)} L ${f(cx + sx * hw)} ${f(cy + sy * hw)} L ${f(cx + sx * hw)} ${f(cy + sy * hw - sy * a)}`}
        fill="none"
        stroke={fill}
        strokeWidth={1.4}
        strokeOpacity={0.8}
        strokeLinecap="round"
      />
    );
    body = (
      <>
        {hostile ? (
          <g filter="url(#mm-glow)">
            {reticleCorner(-1, -1, 'rtl')}
            {reticleCorner(1, -1, 'rtr')}
            {reticleCorner(-1, 1, 'rbl')}
            {reticleCorner(1, 1, 'rbr')}
          </g>
        ) : null}
        <text
          x={cx}
          y={cy}
          fill={fill}
          fontFamily="XWingShip"
          fontSize={40}
          textAnchor="middle"
          dominantBaseline="central"
          filter="url(#mm-bloom)"
        >
          {glyph}
        </text>
        {token.label ? <LabelBadge cx={cx + 22} cy={cy - 20} text={token.label} hue={hue} /> : null}
      </>
    );
  } else if (token.kind === 'transport') {
    // GR-75 supply transport: a tapered hull silhouette (blunt wide bow at +x,
    // narrowing to the stern at -x), echoing the top-down view. Rotated about
    // its centre by `angle`.
    const L = (token.length ?? GR75_LENGTH) * CELL;
    const W = (token.width ?? GR75_WIDTH) * CELL;
    const rot = token.angle ?? 0;
    const hl = L / 2;
    const hw = W / 2;
    // Half-hull profile from bow (+x) to stern (-x); mirrored across the spine.
    const profile: readonly [number, number][] = [
      [hl, 0.5],
      [hl * 0.55, 1],
      [-hl * 0.2, 0.85],
      [-hl * 0.8, 0.42],
      [-hl, 0.26],
    ];
    const pts: string[] = [];
    for (const [px, ky] of profile) pts.push(`${(cx + px).toFixed(1)},${(cy - hw * ky).toFixed(1)}`);
    for (let i = profile.length - 1; i >= 0; i--) {
      const [px, ky] = profile[i];
      pts.push(`${(cx + px).toFixed(1)},${(cy + hw * ky).toFixed(1)}`);
    }
    body = (
      <>
        <g filter="url(#mm-glow)" transform={`rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`}>
          <polygon
            points={pts.join(' ')}
            fill="var(--accent-holo)"
            fillOpacity={0.12}
            stroke="var(--accent-holo)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <line
            x1={cx - hl * 0.8}
            y1={cy}
            x2={cx + hl * 0.9}
            y2={cy}
            stroke="var(--accent-holo)"
            strokeWidth={1.2}
            strokeOpacity={0.6}
          />
        </g>
        {token.label ? <LabelBadge cx={cx} cy={cy - W * 0.9} text={token.label} hue="holo" /> : null}
      </>
    );
  } else {
    body = (
      <g filter="url(#mm-glow)">
        <rect
          x={cx - 12}
          y={cy - 12}
          width={24}
          height={24}
          rx={4}
          fill="var(--accent-holo)"
          fillOpacity={0.08}
          stroke="var(--accent-holo)"
          strokeWidth={1.6}
        />
        {token.label ? (
          <text
            x={cx}
            y={cy + 1}
            fill="var(--accent-holo)"
            fontSize={14}
            fontWeight={800}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {token.label}
          </text>
        ) : null}
      </g>
    );
  }
  return (
    <g>
      {token.tip ? <title>{token.tip}</title> : null}
      {body}
    </g>
  );
}

const VEC_DIR: Record<MapSide, readonly [number, number]> = {
  top: [0, 1],
  bottom: [0, -1],
  left: [1, 0],
  right: [-1, 0],
};

// Board-corner anchors and their inward (toward-centre) unit directions.
const CORNER_ANCHOR: Record<'bl' | 'tl' | 'tr' | 'br', readonly [number, number]> = {
  bl: [0, 1],
  tl: [0, 0],
  tr: [1, 0],
  br: [1, 1],
};
const CORNER_INWARD: Record<'bl' | 'tl' | 'tr' | 'br', readonly [number, number]> = {
  bl: [Math.SQRT1_2, -Math.SQRT1_2],
  tl: [Math.SQRT1_2, Math.SQRT1_2],
  tr: [-Math.SQRT1_2, Math.SQRT1_2],
  br: [-Math.SQRT1_2, -Math.SQRT1_2],
};

// Direction an interior approach chevron points (tip unit vector). Diagonals
// reuse CORNER_INWARD; cardinals follow SVG axes (y grows downward → south).
const APPROACH_DIR: Record<ApproachDir, readonly [number, number]> = {
  ...CORNER_INWARD,
  n: [0, -1],
  s: [0, 1],
  e: [1, 0],
  w: [-1, 0],
};

function VectorBadge({ geo, vector }: { geo: Geo; vector: DrawableVector }) {
  const { size } = geo;
  const pos = vector.t * size + MARGIN;
  let cx = 0;
  let cy = 0;
  let ax: number;
  let ay: number;
  if (vector.at) {
    // Interior approach vector: sit on an inner intersection, chevron aimed
    // along the given direction (diagonal or cardinal).
    [ax, ay] = APPROACH_DIR[vector.dir ?? 'tl'];
    cx = geo.X(vector.at[0]);
    cy = geo.Y(vector.at[1]);
  } else if (vector.corner) {
    // Sit on the board corner, offset diagonally outward, chevron aimed at centre.
    [ax, ay] = CORNER_INWARD[vector.corner];
    const [gx, gy] = CORNER_ANCHOR[vector.corner];
    const anchorX = MARGIN + gx * size;
    const anchorY = MARGIN + gy * size;
    cx = anchorX - ax * 30;
    cy = anchorY - ay * 30;
  } else {
    if (vector.side === 'top') {
      cx = pos;
      cy = MARGIN - 28;
    } else if (vector.side === 'bottom') {
      cx = pos;
      cy = MARGIN + size + 28;
    } else if (vector.side === 'left') {
      cx = MARGIN - 28;
      cy = pos;
    } else {
      cx = MARGIN + size + 28;
      cy = pos;
    }
    [ax, ay] = VEC_DIR[vector.side];
  }
  const w = 20;
  const h = 16;
  const tipL = 11;
  const px = -ay;
  const py = ax;
  const p = (sx: number, sy: number) => `${(cx + sx).toFixed(1)},${(cy + sy).toFixed(1)}`;
  const pts = [
    p(px * w - ax * h, py * w - ay * h),
    p(-px * w - ax * h, -py * w - ay * h),
    p(-px * w + ax * h * 0.2, -py * w + ay * h * 0.2),
    p(ax * (h + tipL), ay * (h + tipL)),
    p(px * w + ax * h * 0.2, py * w + ay * h * 0.2),
  ].join(' ');
  return (
    <g filter="url(#mm-glow)">
      <title>Approach vector {vector.label ?? vector.n}</title>
      <polygon points={pts} fill="#1f6f94" stroke="var(--accent-holo)" strokeWidth={1.2} />
      <text
        x={cx}
        y={cy + 1}
        fill="#eaffff"
        fontSize={16}
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {vector.label ?? vector.n}
      </text>
    </g>
  );
}

export function MissionMap({ scenario, playerCount }: { scenario: Scenario; playerCount?: number }) {
  const map = resolveMissionMap(scenario, playerCount);
  const geo = makeGeo(map.grid);
  return (
    <div className="holoframe">
    <svg
      className="missionMap"
      viewBox={`0 0 ${geo.vb.toString()} ${geo.vb.toString()}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${scenario.title} mission map`}
    >
      <Defs />
      <Starfield geo={geo} seed={map.seed} />
      {map.zones.map((z, i) => (
        <Zone key={`z${i.toString()}`} geo={geo} zone={z} />
      ))}
      <Grid geo={geo} />
      <Frame geo={geo} />
      <MarginInstruments geo={geo} />
      {map.asteroids.map((f, i) => (
        <AsteroidField key={`a${i.toString()}`} geo={geo} field={f} />
      ))}
      {map.minefields.map((f, i) => (
        <MineField key={`m${i.toString()}`} geo={geo} field={f} />
      ))}
      {map.ionStorms.map((f, i) => (
        <IonStormField key={`i${i.toString()}`} geo={geo} field={f} />
      ))}
      {map.hulls.map((h, i) => (
        <Hull key={`h${i.toString()}`} geo={geo} hull={h} />
      ))}
      {map.stations.map((s, i) => (
        <Station key={`s${i.toString()}`} geo={geo} station={s} />
      ))}
      {map.tokens.map((t, i) => (
        <Token key={`t${i.toString()}`} geo={geo} token={t} />
      ))}
      {map.vectors.map((v) => (
        <VectorBadge key={`vec${v.n.toString()}`} geo={geo} vector={v} />
      ))}
    </svg>
    </div>
  );
}
