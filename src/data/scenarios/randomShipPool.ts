/**
 * Random Imperial ship pool.
 *
 * The X-Wing icon legend's `⚙` (cog) glyph means "a random ship type from
 * the imperial pool". Used by the `addRandom`, `replaceRandom`, and
 * `addElite` SetupOps. Within a single squad, all `⚙` references resolve
 * to the SAME ship type ("squad-consistent random").
 *
 * The default pool below mirrors the standard HotAC mission pack contents.
 * The campaign-settings "ownedModels" list filters which ships are
 * available; the optional "Less random ships" mode replaces uniform pool
 * draw with a 1d20 weighted table (see `pickFromD20Table`).
 */

import { Ships, type ShipId } from '../Ships';
import { SCENARIOS } from './registry';

export const DEFAULT_RANDOM_SHIP_POOL: readonly ShipId[] = Object.freeze([
  'TIEIN',    // TIE/in Interceptor
  'TIEADVX',  // TIE Advanced x1
  'TIEDEF',   // TIE/d Defender
  'TIEPH',    // TIE/ph Phantom
  'LAMBDA',   // Lambda-class T-4A Shuttle
  'VT49',     // VT-49 Decimator
]);

/**
 * Ships gated by prior-mission introduction. Derived from every scenario's
 * `unlocksShipTypes` (victory + defeat) — declaring an unlock automatically
 * gates the ship in the random pool until a mission introduces it.
 *
 * Computed lazily (and memoized) on first call so the SCENARIOS read happens
 * after the registry module has finished initializing. Reading at module-load
 * time here triggers an ESM circular-import TDZ error in Vite dev mode.
 */
let _requiresIntro: ReadonlySet<ShipId> | undefined;
function requiresIntro(): ReadonlySet<ShipId> {
  return _requiresIntro ??= new Set(
    SCENARIOS.flatMap((s) => [
      ...(s.victory.unlocksShipTypes ?? []),
      ...(s.defeat.unlocksShipTypes ?? []),
    ]),
  );
}

/**
 * Filter `pool` down to ships the player owns and (for exotic types) has
 * already had introduced by a prior mission. Returns ships that pass.
 * Ownership matches `Ships[id].name` against `ownedModels`; ships flagged
 * `alwaysOwned` skip the ownership check.
 */
export function eligibleShipsFromPool(
  pool: readonly ShipId[],
  ownedModels: readonly string[],
  introducedShipTypes: readonly ShipId[],
): readonly ShipId[] {
  const owned = new Set(ownedModels.map((m) => m.toLowerCase()));
  const introduced = new Set(introducedShipTypes);
  const gated = requiresIntro();
  return pool.filter((s) => {
    const ship = Ships[s];
    if (!ship.alwaysOwned && !owned.has(ship.name.toLowerCase())) return false;
    if (gated.has(s) && !introduced.has(s)) return false;
    return true;
  });
}

/**
 * "Less random ships" 1d20 weighted table. Resolves a roll (1-20) to a
 * ShipId, applying:
 *   1-5   → TIE Interceptor
 *   6-9   → TIE Advanced
 *   10-13 → TIE Bomber  (TIESA)
 *   14-16 → TIE Phantom (fallback: Interceptor if not introduced)
 *   17-18 → TIE Defender (fallback: Advanced if not introduced)
 *   19    → Lambda
 *   20    → Decimator (fallback: Lambda if not owned)
 *
 * Returns `null` when the resolved ship still isn't in the eligible pool
 * (caller should reroll).
 */
export function pickFromD20Table(
  roll: number,
  options: {
    introduced: ReadonlySet<ShipId>;
    eligible: ReadonlySet<ShipId>;
  },
): ShipId | null {
  let pick: ShipId;
  if (roll <= 5) pick = 'TIEIN';
  else if (roll <= 9) pick = 'TIEADVX';
  else if (roll <= 13) pick = 'TIESA';
  else if (roll <= 16) pick = options.introduced.has('TIEPH') ? 'TIEPH' : 'TIEIN';
  else if (roll <= 18) pick = options.introduced.has('TIEDEF') ? 'TIEDEF' : 'TIEADVX';
  else if (roll === 19) pick = 'LAMBDA';
  else pick = options.eligible.has('VT49') ? 'VT49' : 'LAMBDA';
  return options.eligible.has(pick) ? pick : null;
}

/**
 * Roll the d20 table until a ship in the eligible set is produced.
 * Throws if no ship can be resolved after 100 attempts.
 */
export function rollD20RandomShip(
  introduced: readonly ShipId[],
  eligible: readonly ShipId[],
): ShipId {
  const introducedSet = new Set(introduced);
  const eligibleSet = new Set(eligible);
  for (let i = 0; i < 100; i++) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const pick = pickFromD20Table(roll, {
      introduced: introducedSet,
      eligible: eligibleSet,
    });
    if (pick !== null) return pick;
  }
  throw new Error('rollD20RandomShip: no eligible ship after 100 rolls.');
}
