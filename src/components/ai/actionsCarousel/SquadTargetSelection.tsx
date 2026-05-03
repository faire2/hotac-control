import { AI } from '../../../data/Ships';
import type { AiEngine, ShipId } from '../../../data/Ships';
import { PriorityList } from '../../Rule';
import { fgaTargetSelectionByShip } from '../../../data/fga/FgaTargetSelection';
import { andersonTargetSelectionByShip } from '../../../data/anderson/AndersonTargetSelection';

interface Props {
  aiEngine: AiEngine;
  shipType: ShipId;
}

export default function SquadTargetSelection({ aiEngine, shipType }: Props): JSX.Element {
  const items = sourceFor(aiEngine)[shipType];
  if (!items) return <ol><li>No data for {shipType} on {aiEngine}.</li></ol>;
  return <PriorityList items={items} />;
}

function sourceFor(engine: AiEngine): Readonly<Partial<Record<ShipId, readonly string[]>>> {
  switch (engine) {
    case AI.FGA:
      return fgaTargetSelectionByShip;
    case AI.ANDERSON:
      return andersonTargetSelectionByShip;
  }
}
