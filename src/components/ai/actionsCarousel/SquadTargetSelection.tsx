import type { JSX } from 'react';
import { AI } from '../../../data/Ships';
import type { AiEngine, ShipId } from '../../../data/Ships';
import { PriorityList, Rule } from '../../Rule';
import { fgaTargetSelectionByShip } from '../../../data/fga/FgaTargetSelection';
import {
  andersonTargetSelectionByShip,
  andersonTargetSelectionByShipElite,
} from '../../../data/anderson/AndersonTargetSelection';

interface Props {
  aiEngine: AiEngine;
  shipType: ShipId;
  isElite: boolean;
  aiTag?: string;
  behaviorDescription?: string;
}

export default function SquadTargetSelection({
  aiEngine,
  shipType,
  isElite,
  aiTag,
  behaviorDescription,
}: Props): JSX.Element {
  const items = pickList(aiEngine, shipType, isElite);
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

function pickList(engine: AiEngine, shipType: ShipId, isElite: boolean): readonly string[] | undefined {
  if (engine === AI.FGA) return fgaTargetSelectionByShip[shipType];
  if (isElite && andersonTargetSelectionByShipElite[shipType]) {
    return andersonTargetSelectionByShipElite[shipType];
  }
  return andersonTargetSelectionByShip[shipType];
}
