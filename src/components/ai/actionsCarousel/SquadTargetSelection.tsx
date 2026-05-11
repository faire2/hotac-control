import type { JSX } from 'react';
import { AI } from '../../../data/Ships';
import type { AiEngine, ShipId } from '../../../data/Ships';
import { PriorityList, Rule } from '../../Rule';
import { fgaTargetSelectionByShip } from '../../../data/fga/FgaTargetSelection';
import { andersonTargetSelectionByShip } from '../../../data/anderson/AndersonTargetSelection';

interface Props {
  aiEngine: AiEngine;
  shipType: ShipId;
  aiTag?: string;
  behaviorDescription?: string;
}

export default function SquadTargetSelection({
  aiEngine,
  shipType,
  aiTag,
  behaviorDescription,
}: Props): JSX.Element {
  const items = sourceFor(aiEngine)[shipType];
  return (
    <>
      {items
        ? <PriorityList items={items} />
        : <ol><li>No data for {shipType} on {aiEngine}.</li></ol>}
      {aiTag && (
        <div className="behaviorFooter">
          Behavior: <span className="behaviorTag">{aiTag}</span>
          {behaviorDescription && (
            <div className="behaviorDescription">
              <Rule text={behaviorDescription} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

function sourceFor(engine: AiEngine): Readonly<Partial<Record<ShipId, readonly string[]>>> {
  switch (engine) {
    case AI.FGA:
      return fgaTargetSelectionByShip;
    case AI.ANDERSON:
      return andersonTargetSelectionByShip;
  }
}
