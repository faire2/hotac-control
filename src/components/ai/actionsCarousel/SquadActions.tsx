import { AI } from '../../../data/Ships';
import type { AiEngine, ShipId } from '../../../data/Ships';
import { PriorityList } from '../../Rule';
import { fgaShipActionsByShip } from '../../../data/fga/FgaShipActions';
import { andersonShipActionsByShip } from '../../../data/anderson/AndersonShipActions';

interface Props {
  aiEngine: AiEngine;
  shipType: ShipId;
}

export default function SquadActions({ aiEngine, shipType }: Props): JSX.Element {
  const items = sourceFor(aiEngine)[shipType];
  if (!items) return <ol><li>No data for {shipType} on {aiEngine}.</li></ol>;
  return <PriorityList items={items} />;
}

function sourceFor(engine: AiEngine): Readonly<Partial<Record<ShipId, readonly string[]>>> {
  switch (engine) {
    case AI.FGA:
      return fgaShipActionsByShip;
    case AI.ANDERSON:
      return andersonShipActionsByShip;
  }
}
