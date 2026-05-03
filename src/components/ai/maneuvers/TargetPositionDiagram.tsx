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
  const arc1Color = '#22A3FF';
  const arc23Color = '#2777ff';
  const arc4Color = '#0f53ff';
  const stroke = '#00C1FF';

  function buildArcs() {
    const arcs = [];
    for (let i = 0; i < 4; i++) {
      const transform = i * 45;
      const id = `R1${i}`;
      arcs.push(
        <path
          key={id}
          id={id}
          d={getSegment(arc1Width, arc23Width + arc4Width)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={arc1Color}
          className={opacityClass(id)}
          onClick={() => handleSetPosition(1, i as Exclude<SectorIndex, 'B'>, id)}
          transform={`rotate(${transform}, 0, ${totalRadius})`}
        />,
      );
    }
    for (let i = 0; i < 4; i++) {
      const transform = i * 45;
      const id = `R3${i}`;
      arcs.push(
        <path
          key={id}
          id={id}
          d={getArc(arc23Width, arc1Width, arc4Width)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={arc23Color}
          className={opacityClass(id)}
          onClick={() => handleSetPosition(3, i as Exclude<SectorIndex, 'B'>, id)}
          transform={`rotate(${transform}, 0, ${totalRadius})`}
        />,
      );
    }
    for (let i = 0; i < 4; i++) {
      const transform = i * 45;
      const id = `R4${i}`;
      arcs.push(
        <path
          key={id}
          id={id}
          d={getArc(arc4Width, arc1Width + arc23Width, 0)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={arc4Color}
          className={opacityClass(id)}
          onClick={() => handleSetPosition(4, i as Exclude<SectorIndex, 'B'>, id)}
          transform={`rotate(${transform}, 0, ${totalRadius})`}
        />,
      );
    }
    return arcs;
  }

  return (
    <div id="svg_container">
      <svg width={bullseyeWidth} height={totalRadius + strokeWidth} className="align-top">
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
          onClick={() => handleSetPosition(1, 'B', 'B1')}
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
          onClick={() => handleSetPosition(3, 'B', 'B3')}
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
          onClick={() => handleSetPosition(4, 'B', 'B4')}
        />
      </svg>
      <svg width={totalRadius} height={(totalRadius + strokeWidth) * 2}>
        {buildArcs()}
      </svg>
    </div>
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
