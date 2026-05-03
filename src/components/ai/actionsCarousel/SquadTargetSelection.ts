import type { ReactNode } from 'react';
import { AI } from '../../../data/Ships';
import type { AiEngine, ShipId } from '../../../data/Ships';
import hinnyTargetSelection from '../../../data/hinny/HinnyTargetSelection';
import fgaTargetSelection from '../../../data/fga/FgaTargetSelection';

interface Props {
  aiEngine: AiEngine;
  shipType: ShipId;
}

export default function SquadTargetSelection(props: Props): ReactNode {
  switch (props.aiEngine) {
    case AI.HINNY:
      return (hinnyTargetSelection as (p: Props) => ReactNode)(props);
    case AI.FGA:
      return (fgaTargetSelection as (p: Props) => ReactNode)(props);
    default:
      console.log(
        'Ai engine not recognized in component SquadTargetSelection: ' + String(props.aiEngine),
      );
      return null;
  }
}
