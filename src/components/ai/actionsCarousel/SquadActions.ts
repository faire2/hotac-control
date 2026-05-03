import type { ReactNode } from 'react';
import { AI } from '../../../data/Ships';
import type { AiEngine, ShipId } from '../../../data/Ships';
import hinnyShipActions from '../../../data/hinny/HinnyShipActions';
import fgaShipActions from '../../../data/fga/FgaShipActions';

interface Props {
  aiEngine: AiEngine;
  shipType: ShipId;
}

export default function SquadActions(props: Props): ReactNode {
  switch (props.aiEngine) {
    case AI.HINNY:
      return (hinnyShipActions as (p: Props) => ReactNode)(props);
    case AI.FGA:
      return (fgaShipActions as (p: Props) => ReactNode)(props);
    default:
      console.log(
        'Ai engine not recognized in component SquadActions: ' + String(props.aiEngine),
      );
      return null;
  }
}
