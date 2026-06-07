/**
 * Rebel-ally (NPC) ships that appear in HotAC missions: Outer Rim Smuggler,
 * HWK-290, GR-75 and similar. Players plan their dial collectively but
 * they're tracked as squadrons in the app for hull/shield bookkeeping and
 * Protect-action targeting.
 *
 * Ship stats live in `src/data/Ships.tsx` (folded in 2026-05-11) — ally
 * entries there carry `ai: []` and `upgrades: []` to signal "no AI dispatch,
 * no upgrade tree." This file keeps the narrow `AllyShipId` alias used by
 * `Scenario.allies` for type-safe data authoring, and the per-mission
 * `AllySetup` shape.
 */

import type { Upgrade } from './shared/coreUpgrades';
import type { DialMod } from './allyDials';
import type { AllyActionId } from './allyActions';

/**
 * Subset of `ShipId` covering rebel-ally ship types. Distinct alias so
 * scenario data can't accidentally put an Imperial ship in `allies[]`.
 *
 * `TIEDEF` is allowed here for the Defector mission (defection-2): the
 * Imperial prototype that defects mid-mission joins the Rebels as an
 * ally. Stats reuse `Ships.TIEDEF`; the per-ally dial lives in
 * `allyDials.ts`.
 */
export type AllyShipId = 'HWK290' | 'GR75' | 'OUTER_RIM_SMUGGLER' | 'TIEDEF';

/**
 * Per-mission ally setup, declared on `Scenario.allies`. Each entry creates
 * one ally squadron at scenario start.
 *
 * `displayName` overrides the default ship name (e.g. "Quantum Storm" for
 * the Care Package GR-75). `startingHull` / `startingShields` /
 * `startingEnergy` override base stats when a mission starts the ally
 * damaged or boosted. `initiative` and `upgrades` override the ship's
 * printed loadout when a mission equips the ally with a specific pilot
 * skill and/or upgrade cards (e.g. Slicer Techs HWK-290 in
 * "Secure the Holonet": Init 2 + Ion Cannon Turret).
 */
export interface AllySetup {
  ship: AllyShipId;
  displayName?: string;
  startingHull?: number;
  startingShields?: number;
  /** GR-75 only — initial energy when the scenario starts. */
  startingEnergy?: number;
  /** Mission-fixed pilot initiative. Overrides `Ships[ship].initiative`. */
  initiative?: number;
  /** Mission-issued upgrade cards equipped by this ally. */
  upgrades?: readonly Upgrade[];
  /**
   * Bonus shields scaled by player count: "+1 shield per N players".
   * Computed as `floor(playerCount / N)` and added on top of the base
   * (or `startingShields` if set). E.g. `bonusShieldsPerPlayers: 2` →
   * +1 at 2-3 players, +2 at 4 players.
   */
  bonusShieldsPerPlayers?: number;
  /**
   * Mission dial modifiers — recolour matching maneuver-dial entries. E.g.
   * the damaged HWK-290 whose "Speed 4 maneuvers are treated as red":
   * `dialMods: [{ speed: 4, difficulty: 'red' }]`.
   */
  dialMods?: readonly DialMod[];
  /**
   * Action-bar ids to strip for this mission. E.g. the damaged HWK-290 that
   * "is unable to perform the Boost action": `removeActions: ['boost']`.
   */
  removeActions?: readonly AllyActionId[];
}
