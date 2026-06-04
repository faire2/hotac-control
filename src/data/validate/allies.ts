/**
 * Ally-profile invariants: every rebel-ally ship-type has a non-empty action
 * bar with unique action ids. Action icons are typed `IconKey` on
 * `AllyAction`, so tsc already guarantees they resolve — no runtime icon
 * check needed here. Mirrors the dial/AI coverage philosophy in maneuvers.ts.
 */

import { Ships } from '../Ships';
import type { ShipId } from '../Ships';
import { ALLY_ACTIONS } from '../allyActions';
import type { ValidationFailure } from './types';

/** Rebel-ally ship-types are those with no AI engine (`ai: []`). */
function allyShipIds(): ShipId[] {
  return (Object.keys(Ships) as ShipId[]).filter((id) => Ships[id].ai.length === 0);
}

export function checkAllyActions(failures: ValidationFailure[]): void {
  for (const id of allyShipIds()) {
    const bar = ALLY_ACTIONS[id];
    if (!bar || bar.length === 0) {
      failures.push({
        rule: 'Ally action coverage',
        detail: `ally "${id}" has no action bar in ALLY_ACTIONS`,
      });
      continue;
    }
    const seen = new Set<string>();
    for (const action of bar) {
      if (seen.has(action.id)) {
        failures.push({
          rule: 'Ally action id uniqueness',
          detail: `ally "${id}" has duplicate action id "${action.id}"`,
        });
      }
      seen.add(action.id);
    }
  }
}
