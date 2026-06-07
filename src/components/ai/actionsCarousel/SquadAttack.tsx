import type { JSX } from 'react';
import { AI } from '../../../data/Ships';
import type { AiEngine, ShipId } from '../../../data/Ships';
import { PriorityList } from '../../Rule';
import { fgaAttackByShip } from '../../../data/fga/FgaAttack';
import {
  andersonAttackByShip,
  andersonAttackByShipElite,
} from '../../../data/anderson/AndersonAttack';

interface Props {
  aiEngine: AiEngine;
  shipType: ShipId;
  isElite: boolean;
}

export default function SquadAttack({ aiEngine, shipType, isElite }: Props): JSX.Element {
  const items = pickList(aiEngine, shipType, isElite);
  if (!items) return <ol><li>No data for {shipType} on {aiEngine}.</li></ol>;
  return <PriorityList items={items} />;
}

function pickList(engine: AiEngine, shipType: ShipId, isElite: boolean): readonly string[] | undefined {
  if (engine === AI.FGA) return fgaAttackByShip[shipType];
  if (isElite && andersonAttackByShipElite[shipType]) {
    return andersonAttackByShipElite[shipType];
  }
  return andersonAttackByShip[shipType];
}
