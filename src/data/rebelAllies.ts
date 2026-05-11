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

/**
 * Subset of `ShipId` covering rebel-ally ship types. Distinct alias so
 * scenario data can't accidentally put an Imperial ship in `allies[]`.
 */
export type AllyShipId = 'HWK290' | 'GR75' | 'OUTER_RIM_SMUGGLER';

/**
 * Per-mission ally setup, declared on `Scenario.allies`. Each entry creates
 * one ally squadron at scenario start.
 *
 * `displayName` overrides the default ship name (e.g. "Quantum Storm" for
 * the Care Package GR-75). `startingHull` / `startingShields` /
 * `startingEnergy` override base stats when a mission starts the ally
 * damaged or boosted.
 *
 * Per-mission upgrade lists, AI rules (e.g. "team-controlled dial"), and
 * energy systems beyond the count itself are out of scope — they're
 * documented in the mission's `specialRules` and tracked by players.
 */
export interface AllySetup {
  ship: AllyShipId;
  displayName?: string;
  startingHull?: number;
  startingShields?: number;
  /** GR-75 only — initial energy when the scenario starts. */
  startingEnergy?: number;
}
