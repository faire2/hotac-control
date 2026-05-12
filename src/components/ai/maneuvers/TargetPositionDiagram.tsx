import { useContext, useState } from 'react';
import { AI } from '../../../data/Ships';
import { PSN } from '../../../data/Maneuvers';
import type { Position } from '../../../data/Maneuvers';
import { TargetPositionContext } from '../../../context/Contexts';

type SectorIndex = 0 | 1 | 2 | 3 | 'B';

const RANGE_BUCKET: Record<1 | 3 | 4, Record<Exclude<SectorIndex, 'B'>, Position> & { B: Position }> = {
  1: { 0: PSN.R1FRONT, 1: PSN.R1FRONTSIDE, 2: PSN.R1REARSIDE, 3: PSN.R1REAR, B: PSN.R1BULL },
  3: { 0: PSN.R3FRONT, 1: PSN.R3FRONTSIDE, 2: PSN.R3REARSIDE, 3: PSN.R3REAR, B: PSN.R3BULL },
  4: { 0: PSN.R4FRONT, 1: PSN.R4FRONTSIDE, 2: PSN.R4REARSIDE, 3: PSN.R4REAR, B: PSN.R4BULL },
};

const STRESSED_BUCKET: Record<SectorIndex, Position> = {
  0: PSN.STRSFRONT,
  1: PSN.STRSFRONTSIDE,
  2: PSN.STRSREARSIDE,
  3: PSN.STRSREAR,
  B: PSN.STRSBULL,
};

export default function TargetPositionDiagram() {
  const ctx = useContext(TargetPositionContext);
  const [activeId, setActiveId] = useState('');
  if (!ctx) return null;

  const strokeWidth = 2;
  let bullseyeWidth = 20;
  let arc1Width = 0;
  let arc23Width = 0;
  let arc4Width = 0;

  switch (ctx.aiEngine) {
    case AI.FGA:
    case AI.ANDERSON:
      if (ctx.stressed) {
        arc1Width = 120;
      } else {
        arc1Width = arc23Width = arc4Width = 40;
      }
      break;
    default:
      bullseyeWidth = 0;
  }

  function handleSetPosition(range: 1 | 3 | 4, sector: SectorIndex, id: string) {
    setActiveId(id);
    const target = ctx?.stressed
      ? STRESSED_BUCKET[sector]
      : sector === 'B'
        ? RANGE_BUCKET[range].B
        : RANGE_BUCKET[range][sector];
    ctx?.setTargetPosition(target);
  }

  function opacityClass(id: string) {
    return id === activeId ? 'active-segment' : 'segmentOpacity';
  }

  const totalRadius = arc1Width + arc23Width + arc4Width;
  // Range fills use CSS variables so a parent .squad-mfd-scope can swap
  // them per theme. Translucent so the underlying black + tick overlay
  // read through — this is a radar scope, not a coloured pie chart.
  const arc1Color = 'var(--scope-r1, rgba(90,200,255,0.32))';
  const arc23Color = 'var(--scope-r3, rgba(90,200,255,0.18))';
  const arc4Color = 'var(--scope-r4, rgba(90,200,255,0.08))';
  const stroke = 'var(--scope-stroke, #5ac8ff)';

  function buildArcs() {
    const arcs = [];
    for (let i = 0; i < 4; i++) {
      const transform = i * 45;
      const id = `R1${i.toString()}`;
      arcs.push(
        <path
          key={id}
          id={id}
          d={getSegment(arc1Width, arc23Width + arc4Width)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={arc1Color}
          className={opacityClass(id)}
          onClick={() => { handleSetPosition(1, i as Exclude<SectorIndex, 'B'>, id); }}
          transform={`rotate(${transform.toString()}, 0, ${totalRadius.toString()})`}
        />,
      );
    }
    for (let i = 0; i < 4; i++) {
      const transform = i * 45;
      const id = `R3${i.toString()}`;
      arcs.push(
        <path
          key={id}
          id={id}
          d={getArc(arc23Width, arc1Width, arc4Width)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={arc23Color}
          className={opacityClass(id)}
          onClick={() => { handleSetPosition(3, i as Exclude<SectorIndex, 'B'>, id); }}
          transform={`rotate(${transform.toString()}, 0, ${totalRadius.toString()})`}
        />,
      );
    }
    for (let i = 0; i < 4; i++) {
      const transform = i * 45;
      const id = `R4${i.toString()}`;
      arcs.push(
        <path
          key={id}
          id={id}
          d={getArc(arc4Width, arc1Width + arc23Width, 0)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={arc4Color}
          className={opacityClass(id)}
          onClick={() => { handleSetPosition(4, i as Exclude<SectorIndex, 'B'>, id); }}
          transform={`rotate(${transform.toString()}, 0, ${totalRadius.toString()})`}
        />,
      );
    }
    return arcs;
  }

  const scopeHeight = (totalRadius + strokeWidth) * 2;

  return (
    <div id="svg_container" className="squad-mfd-scope">
      <svg
        width={bullseyeWidth}
        height={totalRadius + strokeWidth}
        className="align-top squad-mfd-scope-bullseye"
      >
        <rect
          x="0"
          y={arc23Width + arc4Width}
          width={bullseyeWidth}
          height={arc1Width}
          fill={arc1Color}
          stroke={stroke}
          strokeWidth={strokeWidth}
          id="B1"
          className={opacityClass('B1')}
          onClick={() => { handleSetPosition(1, 'B', 'B1'); }}
        />
        <rect
          x="0"
          y={arc4Width}
          width={bullseyeWidth}
          height={arc23Width}
          fill={arc23Color}
          stroke={stroke}
          strokeWidth={strokeWidth}
          id="B3"
          className={opacityClass('B3')}
          onClick={() => { handleSetPosition(3, 'B', 'B3'); }}
        />
        <rect
          x="0"
          y="0"
          width={bullseyeWidth}
          height={arc4Width}
          fill={arc4Color}
          stroke={stroke}
          strokeWidth={strokeWidth}
          id="B4"
          className={opacityClass('B4')}
          onClick={() => { handleSetPosition(4, 'B', 'B4'); }}
        />
      </svg>
      <svg
        width={totalRadius}
        height={scopeHeight}
        className="squad-mfd-scope-arcs"
      >
        {buildArcs()}
        <ScopeChrome
          radius={totalRadius}
          scopeHeight={scopeHeight}
          arc1Width={arc1Width}
          arc23Width={arc23Width}
          arc4Width={arc4Width}
        />
      </svg>
    </div>
  );
}

/**
 * Decorative scope chrome — tick-mark ring, crosshair, and range labels.
 * Sits on top of the clickable arcs (pointer-events: none) so it never
 * intercepts clicks. Hidden when the scope is collapsed (totalRadius=0).
 */
function ScopeChrome({
  radius,
  scopeHeight,
  arc1Width,
  arc23Width,
  arc4Width,
}: {
  radius: number;
  scopeHeight: number;
  arc1Width: number;
  arc23Width: number;
  arc4Width: number;
}) {
  if (radius <= 0) return null;
  const cx = 0;
  const cy = scopeHeight / 2;
  const tickInner = radius - 2;
  const tickOuter = radius + 4;
  const tickMajorOuter = radius + 8;

  // Ticks every 11.25° across the right hemisphere (-90°..+90° == ship
  // forward to ship aft via the right side). Every 4th is a major tick.
  const ticks: Array<{ angle: number; major: boolean }> = [];
  for (let i = -8; i <= 8; i++) {
    ticks.push({ angle: (i * 90) / 8, major: i % 2 === 0 });
  }

  return (
    <g
      className="squad-mfd-scope-chrome"
      pointerEvents="none"
      fill="none"
      stroke="var(--scope-chrome, rgba(90,200,255,0.55))"
    >
      {/* tick ring */}
      {ticks.map(({ angle, major }) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * tickInner;
        const y1 = cy + Math.sin(rad) * tickInner;
        const x2 = cx + Math.cos(rad) * (major ? tickMajorOuter : tickOuter);
        const y2 = cy + Math.sin(rad) * (major ? tickMajorOuter : tickOuter);
        return (
          <line
            key={`t${angle.toString()}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            strokeWidth={major ? 1.2 : 0.7}
          />
        );
      })}
      {/* centerline (ship axis) */}
      <line x1={cx} y1={cy - radius - 6} x2={cx} y2={cy + radius + 6} strokeWidth="0.8" strokeDasharray="2 3" />
      {/* horizontal axis through the ship */}
      <line x1={cx - 6} y1={cy} x2={cx + radius + 6} y2={cy} strokeWidth="0.8" strokeDasharray="2 3" />
      {/* range labels positioned at the radial mid of each visible ring,
       *  along the front-side bisector (~ -22.5°) so they don't sit on
       *  the cardinal axis lines. */}
      <g
        fill="var(--scope-label, rgba(90,200,255,0.85))"
        stroke="none"
        fontFamily="Consolas, Menlo, monospace"
        fontSize="9"
        letterSpacing="0.1em"
      >
        {arc1Width > 0 && (
          <text x={Math.cos((-22.5 * Math.PI) / 180) * (arc1Width / 2) - 12} y={cy + Math.sin((-22.5 * Math.PI) / 180) * (arc1Width / 2) - 2}>R1-R2</text>
        )}
        {arc23Width > 0 && (
          <text x={Math.cos((-22.5 * Math.PI) / 180) * (arc1Width + arc23Width / 2) - 12} y={cy + Math.sin((-22.5 * Math.PI) / 180) * (arc1Width + arc23Width / 2) - 2}>R2-R3</text>
        )}
        {arc4Width > 0 && (
          <text x={Math.cos((-22.5 * Math.PI) / 180) * (arc1Width + arc23Width + arc4Width / 2) - 8} y={cy + Math.sin((-22.5 * Math.PI) / 180) * (arc1Width + arc23Width + arc4Width / 2) - 2}>R3+</text>
        )}
      </g>
    </g>
  );
}

function getSegment(radius: number, offset: number): string {
  const x = Math.sqrt((radius * radius) / 2);
  const y = radius - x;
  return ['M', 0, offset, 'A', radius, radius, 0, 0, 1, x, y + offset, 'L', 0, radius + offset, 'Z'].join(' ');
}

function getArc(currentWidth: number, previousWidth: number, nextWidth: number): string {
  const firstArcEnd = [
    Math.sqrt((previousWidth * previousWidth) / 2),
    nextWidth + currentWidth + previousWidth - Math.sqrt((previousWidth * previousWidth) / 2),
  ];
  const lineEnd = [
    Math.sqrt(((currentWidth + previousWidth) * (currentWidth + previousWidth)) / 2),
    nextWidth + previousWidth + currentWidth - Math.sqrt(((currentWidth + previousWidth) * (currentWidth + previousWidth)) / 2),
  ];
  return [
    'M', 0, currentWidth + nextWidth,
    'A', previousWidth, previousWidth, 0, 0, 1, firstArcEnd[0], firstArcEnd[1],
    'L', lineEnd[0], lineEnd[1],
    'A', currentWidth + previousWidth, currentWidth + previousWidth, 0, 0, 0, 0, 0 + nextWidth,
  ].join(' ');
}
