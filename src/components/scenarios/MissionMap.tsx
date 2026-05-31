/**
 * <MissionMap> — renders a scenario's `map` spec as a stylized holo SVG board,
 * replacing the ASCII `mapDiagram` in the briefing. All geometry comes from the
 * pure resolver in `missionMapModel`; this file is just the SVG/JSX drawing of
 * the resolved `DrawableMap`. Colors map to the app's `--accent-*` tokens.
 */

import type { ReactElement } from 'react';
import type { MapHue, MapSide, Scenario } from '../../data/scenarios/types';
import {
  resolveMissionMap,
  zoneRect,
  type DrawableAsteroids,
  type DrawableMap,
  type DrawableStation,
  type DrawableVector,
  type ResolvedToken,
} from './missionMapModel';
import './MissionMap.css';

const CELL = 66;
const MARGIN = 60;

const HUE: Record<MapHue, string> = {
  holo: 'var(--accent-holo)',
  warn: 'var(--accent-warn)',
  danger: 'var(--accent-danger)',
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
    lines.push(<line key={`v${i}`} x1={X(i)} y1={Y(0)} x2={X(i)} y2={Y(grid)} {...common} />);
    lines.push(<line key={`h${i}`} x1={X(0)} y1={Y(i)} x2={X(grid)} y2={Y(i)} {...common} />);
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
    bx = X(rx1);
    by = (Y(ry0) + Y(ry1)) / 2;
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
    const cx = corner.includes('l') ? X(0) : X(grid);
    const cy = corner.includes('t') ? Y(0) : Y(grid);
    body = (
      <>
        <circle cx={cx} cy={cy} r={R} fill={col} fillOpacity={0.1} />
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={col}
          strokeWidth={1.4}
          strokeDasharray="6 7"
          strokeOpacity={0.7}
        />
      </>
    );
    bx = cx + (corner.includes('l') ? R * 0.55 : -R * 0.55);
    by = cy + (corner.includes('t') ? R * 0.55 : -R * 0.55);
  } else {
    const p = zone.point ?? [grid / 2, grid / 2];
    bx = X(p[0]);
    by = Y(p[1]);
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
}: {
  cx: number;
  cy: number;
  base: number;
  rng: () => number;
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
      stroke="var(--accent-warn)"
      strokeWidth={1.8}
      strokeOpacity={0.7}
      strokeLinejoin="round"
    />
  );
}

function AsteroidField({ geo, field }: { geo: Geo; field: DrawableAsteroids }) {
  const rng = mulberry32(((field.seed >>> 0) ^ 0x9e3779b9) >>> 0);
  return (
    <g>
      {field.tip ? <title>{field.tip}</title> : null}
      {field.rocks.map(([gx, gy], i) => (
        <AsteroidPolygon
          key={i}
          cx={geo.X(gx)}
          cy={geo.Y(gy)}
          base={12 + rng() * 8}
          rng={rng}
        />
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

function FighterChevron({ cx, cy, s, color }: { cx: number; cy: number; s: number; color: string }) {
  return (
    <path
      d={`M ${cx} ${cy - 8 * s} L ${cx + 7 * s} ${cy + 6 * s} L ${cx} ${cy + 2 * s} L ${cx - 7 * s} ${cy + 6 * s} Z`}
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
        {token.playerCount ? (
          <text x={cx - 19} y={cy - 16} fill="var(--accent-warn)" fontSize={14} fontWeight={800}>
            {token.playerCount}p
          </text>
        ) : null}
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
          transform={`rotate(45 ${cx} ${cy})`}
          fill="var(--accent-holo)"
          fillOpacity={0.1}
          stroke="var(--accent-holo)"
          strokeWidth={1.8}
        />
        <circle cx={cx} cy={cy} r={3} fill="var(--accent-holo)" />
      </g>
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
        {token.playerCount ? (
          <text x={cx + 16} y={cy - 10} fill="var(--accent-warn)" fontSize={13} fontWeight={800}>
            {token.playerCount}p
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

export function MissionMap({ scenario }: { scenario: Scenario }) {
  const map = resolveMissionMap(scenario);
  const geo = makeGeo(map.grid);
  return (
    <svg
      className="missionMap"
      viewBox={`0 0 ${geo.vb} ${geo.vb}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${scenario.title} mission map`}
    >
      <Defs />
      <Starfield geo={geo} seed={map.seed} />
      {map.zones.map((z, i) => (
        <Zone key={`z${i}`} geo={geo} zone={z} />
      ))}
      <Grid geo={geo} />
      {map.asteroids.map((f, i) => (
        <AsteroidField key={`a${i}`} geo={geo} field={f} />
      ))}
      {map.stations.map((s, i) => (
        <Station key={`s${i}`} geo={geo} station={s} />
      ))}
      {map.tokens.map((t, i) => (
        <Token key={`t${i}`} geo={geo} token={t} />
      ))}
      {map.vectors.map((v) => (
        <VectorBadge key={`vec${v.n}`} geo={geo} vector={v} />
      ))}
    </svg>
  );
}
