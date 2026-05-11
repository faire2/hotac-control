/**
 * Derives the physical-model prerequisites for a scenario from its squad
 * composition + allies. Replaces the legacy hand-maintained
 * `Scenario.requiredModels` field (dropped in Phase 10 step D, 2026-05-11).
 *
 * A model is "required" if the scenario references it by id in:
 *   - any setup op carrying a specific `ship: ShipId` (`add`, `replace`,
 *     `addElite` with `ship` set)
 *   - any `allies[].ship` entry
 *
 * `alwaysOwned` ships (just TIE/ln today) are filtered out — every player
 * is assumed to own them. Random ops (`addRandom`, `replaceRandom`,
 * `addElite` without `ship`) don't contribute: they draw from the player's
 * existing pool, so they don't gate ownership.
 */

import { Ships } from '../Ships';
import type { ShipId } from '../Ships';
import { REBEL_ALLIES } from '../rebelAllies';
import type { AllyShipId } from '../rebelAllies';
import type { Scenario, SetupOp } from './types';

function shipIdFromOp(op: SetupOp): ShipId | undefined {
  switch (op.kind) {
    case 'add':
    case 'replace':
      return op.ship;
    case 'addElite':
      return op.ship;
    default:
      return undefined;
  }
}

export function requiredModelsFor(scenario: Scenario): readonly string[] {
  const shipIds = new Set<ShipId>();
  const allyIds = new Set<AllyShipId>();

  for (const squad of scenario.squads) {
    for (const ops of Object.values(squad.composition)) {
      for (const op of ops) {
        const id = shipIdFromOp(op);
        if (id !== undefined) shipIds.add(id);
      }
    }
  }

  for (const ally of scenario.allies ?? []) {
    allyIds.add(ally.ship);
  }

  const names: string[] = [];
  for (const id of shipIds) {
    const ship = Ships[id];
    if (ship.alwaysOwned) continue;
    names.push(ship.name);
  }
  for (const id of allyIds) {
    names.push(REBEL_ALLIES[id].name);
  }

  return Array.from(new Set(names));
}
