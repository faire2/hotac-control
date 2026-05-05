import { useContext, useState } from 'react';
import Select from 'react-select';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { AI, Ships } from '../../data/Ships';
import type { AiEngine } from '../../data/Ships';
import { PSN } from '../../data/Maneuvers';
import type { Position } from '../../data/Maneuvers';
import { ShipsVariables } from './variables/ShipsVariables';
import { SquadStats } from './SquadStats';
import SquadActionsCarousel from './actionsCarousel/SquadActionsCarousel';
import { TargetPosition } from './maneuvers/TargetPosition';
import UpgradesCard from './upgrades/UpgradesCard';
import { GlobalSquadsValuesContext, TargetPositionContext } from '../../context/Contexts';
import type { Squadron } from '../../context/Contexts';

interface Props {
  squad: Squadron;
  squadId: number;
}

const SQUAD_NAMES = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
  'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi',
  'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
].map((n) => ({ value: n, label: n }));

const SQUAD_NAME_FALLBACK = { value: 'Squadron designation', label: 'Squadron designation' };

export function Squad({ squad, squadId }: Props) {
  const shipType = squad.shipType;
  const ship = Ships[shipType];
  const globalValues = useContext(GlobalSquadsValuesContext);
  const scenarioAiEngine = globalValues?.scenarioAiEngine;

  const [targetPosition, setTargetPosition] = useState<Position | readonly Position[]>([PSN.R3FRONT]);
  const [maneuverRandNum, setManeuverRandNum] = useState(1);
  const [localAiEngine, setLocalAiEngine] = useState<AiEngine>(AI.FGA);
  const [stressed, setStressed] = useState(false);

  const aiEngine = scenarioAiEngine ?? localAiEngine;

  function handleSetTargetPosition(position: Position | readonly Position[]) {
    setManeuverRandNum(Math.floor(Math.random() * 6));
    setTargetPosition(position);
  }

  function handleStress() {
    setStressed((s) => !s);
  }

  function handleSetAi(ai: AiEngine) {
    setTargetPosition(PSN.R1FRONT);
    setStressed(false);
    setLocalAiEngine(ai);
  }

  const aiToggle = scenarioAiEngine ? null : (
    <ToggleButtonGroup
      type="radio"
      name={`ai-engine-${String(squadId)}`}
      value={aiEngine}
      size="sm"
      onChange={(value) => handleSetAi(value)}
    >
      {ship.ai.includes(AI.FGA) && <ToggleButton value={AI.FGA}>{AI.FGA}</ToggleButton>}
      {ship.ai.includes(AI.ANDERSON) && <ToggleButton value={AI.ANDERSON}>{AI.ANDERSON}</ToggleButton>}
    </ToggleButtonGroup>
  );

  return (
    <TargetPositionContext.Provider
      value={{
        shipType,
        maneuverRandNum,
        aiEngine,
        setAiEngine: handleSetAi,
        targetPosition,
        setTargetPosition: handleSetTargetPosition,
        stressed,
        handleStress,
      }}
    >
      <div className="squadContainer">
        <div className="row align-items-center">
          <div className="col-5">
            <h3 className="squadTitle">{ship.name}</h3>
          </div>
          <div className="col-7">
            <Select
              options={SQUAD_NAMES}
              defaultValue={SQUAD_NAMES[squadId] ?? SQUAD_NAME_FALLBACK}
            />
          </div>
        </div>
        <SquadStats shipType={shipType} upgrades={squad.upgrades} headerExtra={aiToggle} />
        <ShipsVariables squadId={squadId} />
        <div className="row no-gutters align-items-stretch">
          <div className="col-6 pr-1 d-flex flex-column">
            <TargetPosition />
          </div>
          <div className="col-6 pl-1 d-flex flex-column">
            <SquadActionsCarousel aiEngine={aiEngine} shipType={shipType} />
          </div>
        </div>
        <UpgradesCard squadId={squadId} />
      </div>
    </TargetPositionContext.Provider>
  );
}
