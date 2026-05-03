import { useContext } from 'react';
import { AI } from '../../../data/Ships';
import { TargetPositionContext } from '../../../context/Contexts';
import TargetPositionDiagram from './TargetPositionDiagram';
import SquadManeuverGenerator from './SquadManeuverGenerator';

export function TargetPosition() {
  const ctx = useContext(TargetPositionContext);
  if (!ctx) return null;

  return (
    <div className="d-flex flex-column">
      <h3 className="squadSectionHeader">Maneuvers</h3>
      {(ctx.aiEngine === AI.FGA || ctx.aiEngine === AI.ANDERSON) && (
        <label className="mb-1">
          <input type="checkbox" checked={ctx.stressed} onChange={() => ctx.handleStress()} />
          {' '}Is ship stressed?
        </label>
      )}
      <TargetPositionDiagram />
      <SquadManeuverGenerator />
    </div>
  );
}
