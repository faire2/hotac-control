import type { ReactNode } from 'react';
import { AI } from '../../../data/Ships';
import type { AiEngine, ShipId } from '../../../data/Ships';
import hinnyAttack from '../../../data/hinny/HinnyAttack';
import fgaAttack from '../../../data/fga/FgaAttack';

interface Props {
  aiEngine: AiEngine;
  shipType: ShipId;
}

export default function SquadAttack(props: Props): ReactNode {
  switch (props.aiEngine) {
    case AI.HINNY:
      return (hinnyAttack as (p: Props) => ReactNode)(props);
    case AI.FGA:
      return (fgaAttack as (p: Props) => ReactNode)(props);
    default:
      console.log(
        'Ai engine not recognized in component SquadAttack: ' + String(props.aiEngine),
      );
      return null;
  }
}
