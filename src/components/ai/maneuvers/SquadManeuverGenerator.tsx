import { useContext } from 'react';
import { AI } from '../../../data/Ships';
import { fgaManeuvers } from '../../../data/fga/Maneuvers';
import { andersonManeuvers } from '../../../data/anderson/Maneuvers';
import { TargetPositionContext } from '../../../context/Contexts';
import { renderManeuverGlyph } from '../../shared/maneuverGlyph';

export default function SquadManeuverGenerator() {
  const ctx = useContext(TargetPositionContext);
  if (!ctx) return null;

  // Special-AI ships with a fixed maneuver list ignore the position table:
  // the dial roll just picks one entry (any click → a random maneuver).
  if (ctx.maneuverOverride && ctx.maneuverOverride.length > 0) {
    const list = ctx.maneuverOverride;
    const idx = Math.floor((ctx.maneuverRandNum / 6) * list.length);
    return renderManeuverGlyph(list[Math.min(idx, list.length - 1)]);
  }

  const tables = ctx.aiEngine === AI.FGA ? fgaManeuvers : andersonManeuvers;
  const targetPos = ctx.targetPosition;
  const positionKey: string = typeof targetPos === 'string' ? targetPos : targetPos[0];
  const shipTable = tables[ctx.shipType];
  const row = shipTable && positionKey ? shipTable[positionKey as keyof typeof shipTable] : undefined;
  if (!row) {
    return <div className="xw-man"><span className="red">TODO (phase 5b)</span></div>;
  }
  const maneuver = row[ctx.maneuverRandNum];
  return renderManeuverGlyph(maneuver);
}
