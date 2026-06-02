/**
 * <MissionMap> — renders a scenario's `map` spec as a stylized holo SVG board,
 * replacing the ASCII `mapDiagram` in the briefing. All geometry comes from the
 * pure resolver in `missionMapModel`; this file is just the SVG/JSX drawing of
 * the resolved `DrawableMap`. Colors map to the app's `--accent-*` tokens.
 */

import type { ReactElement } from 'react';
import type { ShipId } from '../../data/Ships';
import type { MapHue, MapSide, Scenario } from '../../data/scenarios/types';
import {
  resolveMissionMap,
  zoneRect,
  type DrawableAsteroids,
  type DrawableHull,
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
      <filter id="mm-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
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
    const common = major
      ? { stroke: 'var(--accent-holo-dim)', strokeWidth: 1.3, strokeOpacity: 0.65 }
      : {
          stroke: 'var(--accent-holo-dim)',
          strokeWidth: 1,
          strokeDasharray: '7 9',
          strokeOpacity: 0.5,
        };
    lines.push(<line key={`v${i.toString()}`} x1={X(i)} y1={Y(0)} x2={X(i)} y2={Y(grid)} {...common} />);
    lines.push(<line key={`h${i.toString()}`} x1={X(0)} y1={Y(i)} x2={X(grid)} y2={Y(i)} {...common} />);
  }
  return (
    <g>
      {lines}
      <rect
        x={X(0)}
        y={Y(0)}
        width={size}
        height={size}
        fill="none"
        stroke="var(--accent-holo)"
        strokeWidth={2}
        strokeOpacity={0.8}
        filter="url(#mm-glow)"
      />
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
    body = (
      <>
        <rect x={x} y={y} width={w} height={h} fill={col} fillOpacity={0.1} />
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="none"
          stroke={col}
          strokeWidth={1.4}
          strokeDasharray="6 7"
          strokeOpacity={0.7}
        />
        {zone.exit ? <ExitChevrons rect={[x, y, w, h]} side={zone.exit} /> : null}
      </>
    );
  } else if (zone.rect) {
    const [rx0, ry0, rx1, ry1] = zone.rect;
    const x = X(rx0);
    const y = Y(ry0);
    const w = X(rx1) - X(rx0);
    const h = Y(ry1) - Y(ry0);
    body = (
      <>
        <rect x={x} y={y} width={w} height={h} fill={col} fillOpacity={0.07} />
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="none"
          stroke={col}
          strokeWidth={1.4}
          strokeDasharray="6 7"
          strokeOpacity={0.7}
        />
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
        <circle cx={cx} cy={cy} r={r} fill={col} fillOpacity={0.1} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={col}
          strokeWidth={1.4}
          strokeDasharray="6 7"
          strokeOpacity={0.7}
        />
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
        <path d={d} fill={col} fillOpacity={0.1} />
        <path
          d={d}
          fill="none"
          stroke={col}
          strokeWidth={1.4}
          strokeDasharray="6 7"
          strokeOpacity={0.7}
        />
      </>
    );
    bx = cx + dirX * R * 0.5;
    by = cy + dirY * R * 0.5;
  } else if (zone.tri) {
    const pts = zone.tri.map((p) => (p === 'center' ? ([grid / 2, grid / 2] as const) : p));
    const pointsAttr = pts.map(([gx, gy]) => `${X(gx).toFixed(1)},${Y(gy).toFixed(1)}`).join(' ');
    body = (
      <>
        <polygon points={pointsAttr} fill={col} fillOpacity={0.07} />
        <polygon
          points={pointsAttr}
          fill="none"
          stroke={col}
          strokeWidth={1.4}
          strokeDasharray="6 7"
          strokeOpacity={0.7}
        />
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
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const rad = base * (0.6 + rng() * 0.5);
    pts.push(
      `${(cx + Math.cos(ang) * rad).toFixed(1)},${(cy + Math.sin(ang) * rad * 0.82).toFixed(1)}`,
    );
  }
  return (
    <polygon
      points={pts.join(' ')}
      fill="#7f93a6"
      fillOpacity={0.12}
      stroke={stroke}
      strokeWidth={1.8}
      strokeOpacity={0.7}
      strokeLinejoin="round"
    />
  );
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
        <AsteroidPolygon
          key={`d${i.toString()}`}
          cx={geo.X(gx)}
          cy={geo.Y(gy)}
          base={10 + rng() * 6}
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
  } else if (token.kind === 'ship') {
    const col = HUE[token.hue ?? 'holo'];
    const glyph = SHIP_GLYPH_CHAR[token.ship];
    body = (
      <>
        <text
          x={cx}
          y={cy}
          fill={col}
          fontFamily="XWingShip"
          fontSize={40}
          textAnchor="middle"
          dominantBaseline="central"
          filter="url(#mm-glow)"
        >
          {glyph}
        </text>
        {token.label ? <LabelBadge cx={cx + 22} cy={cy - 20} text={token.label} hue={token.hue ?? 'holo'} /> : null}
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

function VectorBadge({ geo, vector }: { geo: Geo; vector: DrawableVector }) {
  const { size } = geo;
  const pos = vector.t * size + MARGIN;
  let cx = 0;
  let cy = 0;
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
  const [ax, ay] = VEC_DIR[vector.side];
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
      <title>Approach vector {vector.n}</title>
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
        {vector.n}
      </text>
    </g>
  );
}

export function MissionMap({ scenario, playerCount }: { scenario: Scenario; playerCount?: number }) {
  const map = resolveMissionMap(scenario, playerCount);
  const geo = makeGeo(map.grid);
  return (
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
      {map.asteroids.map((f, i) => (
        <AsteroidField key={`a${i.toString()}`} geo={geo} field={f} />
      ))}
      {map.minefields.map((f, i) => (
        <MineField key={`m${i.toString()}`} geo={geo} field={f} />
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
  );
}
