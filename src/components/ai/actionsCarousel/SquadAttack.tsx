import type { JSX } from 'react';
import { AI } from '../../../data/Ships';
import type { AiEngine, ShipId } from '../../../data/Ships';
import { PriorityList } from '../../Rule';
import { fgaAttackByShip } from '../../../data/fga/FgaAttack';
import { andersonAttackByShip } from '../../../data/anderson/AndersonAttack';

interface Props {
  aiEngine: AiEngine;
  shipType: ShipId;
}

export default function SquadAttack({ aiEngine, shipType }: Props): JSX.Element {
  const items = sourceFor(aiEngine)[shipType];
  if (!items) return <ol><li>No data for {shipType} on {aiEngine}.</li></ol>;
  return <PriorityList items={items} />;
}

function sourceFor(engine: AiEngine): Readonly<Partial<Record<ShipId, readonly string[]>>> {
  switch (engine) {
    case AI.FGA:
      return fgaAttackByShip;
    case AI.ANDERSON:
      return andersonAttackByShip;
  }
}
