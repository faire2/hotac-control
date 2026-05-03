import { useState } from 'react';
import Select from 'react-select';
import { AI, Ships } from '../../data/Ships';
import type { AiEngine } from '../../data/Ships';
import { PSN } from '../../data/Maneuvers';
import type { Position } from '../../data/Maneuvers';
import { ShipsVariables } from './variables/ShipsVariables';
import { SquadStats } from './SquadStats';
import SquadActionsCarousel from './actionsCarousel/SquadActionsCarousel';
import { TargetPosition } from './maneuvers/TargetPosition';
import UpgradesCard from './upgrades/UpgradesCard';
import { TargetPositionContext } from '../../context/Contexts';
import type { Squadron } from '../../context/Contexts';

interface Props {
  squad: Squadron;
  squadId: number;
}

const SQUAD_NAMES = [
  { value: 'Alpha', label: 'Alpha' },
  { value: 'Beta', label: 'Beta' },
  { value: 'Gamma', label: 'Gamma' },
  { value: 'Delta', label: 'Delta' },
  { value: 'Epsilon', label: 'Epsilon' },
  { value: 'Omega', label: 'Omega' },
];

export function Squad({ squad, squadId }: Props) {
  const shipType = squad.shipType;

  const [targetPosition, setTargetPosition] = useState<Position | readonly Position[]>([PSN.R3FRONT]);
  const [maneuverRandNum, setManeuverRandNum] = useState(1);
  const [aiEngine, setAiEngine] = useState<AiEngine>(AI.FGA);
  const [stressed, setStressed] = useState(false);

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
    setAiEngine(ai);
  }

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
        <div className="row">
          <div className="col-8">
            <h3>Ship type: {Ships[shipType].name}</h3>
            <SquadStats shipType={shipType} upgrades={squad.upgrades} />
            <ShipsVariables squadId={squadId} />
            <SquadActionsCarousel aiEngine={aiEngine} shipType={shipType} />
          </div>
          <div className="col-4">
            <Select
              options={SQUAD_NAMES}
              defaultValue={{ value: 'Squadron designation', label: 'Squadron designation' }}
            />
            <TargetPosition />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <UpgradesCard squadId={squadId} />
          </div>
        </div>
      </div>
    </TargetPositionContext.Provider>
  );
}
