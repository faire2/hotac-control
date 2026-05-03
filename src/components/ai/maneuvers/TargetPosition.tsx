import { useContext } from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { AI, Ships } from '../../../data/Ships';
import { TargetPositionContext } from '../../../context/Contexts';
import TargetPositionDiagram from './TargetPositionDiagram';
import SquadManeuverGenerator from './SquadManeuverGenerator';

export function TargetPosition() {
  const ctx = useContext(TargetPositionContext);
  if (!ctx) return null;
  const ship = Ships[ctx.shipType];

  return (
    <div className="d-flex flex-column justify-content-center">
      <h3>Maneuvers:</h3>
      <ToggleButtonGroup
        type="radio"
        name="ai-engine"
        value={ctx.aiEngine}
        onChange={(value) => ctx.setAiEngine(value)}
      >
        {ship.ai.includes(AI.FGA) && <ToggleButton value={AI.FGA}>{AI.FGA}</ToggleButton>}
        {ship.ai.includes(AI.ANDERSON) && <ToggleButton value={AI.ANDERSON}>{AI.ANDERSON}</ToggleButton>}
      </ToggleButtonGroup>
      {(ctx.aiEngine === AI.FGA || ctx.aiEngine === AI.ANDERSON) && (
        <label>
          <input type="checkbox" checked={ctx.stressed} onChange={() => ctx.handleStress()} />
          {' '}Is ship stressed?
        </label>
      )}
      <TargetPositionDiagram />
      <SquadManeuverGenerator />
    </div>
  );
}
