import type { JSX } from 'react';
import { AI } from '../../../data/Ships';
import type { AiEngine, ShipId } from '../../../data/Ships';
import { PriorityList } from '../../Rule';
import { fgaShipActionsByShip } from '../../../data/fga/FgaShipActions';
import {
  andersonShipActionsByShip,
  andersonShipActionsByShipElite,
} from '../../../data/anderson/AndersonShipActions';

interface Props {
  aiEngine: AiEngine;
  shipType: ShipId;
  isElite: boolean;
}

export default function SquadActions({ aiEngine, shipType, isElite }: Props): JSX.Element {
  const items = pickList(aiEngine, shipType, isElite);
  if (!items) return <ol><li>No data for {shipType} on {aiEngine}.</li></ol>;
  return <PriorityList items={items} />;
}

function pickList(engine: AiEngine, shipType: ShipId, isElite: boolean): readonly string[] | undefined {
  if (engine === AI.FGA) return fgaShipActionsByShip[shipType];
  // Anderson: elite list wins if defined, else fall back to base.
  if (isElite && andersonShipActionsByShipElite[shipType]) {
    return andersonShipActionsByShipElite[shipType];
  }
  return andersonShipActionsByShip[shipType];
}
