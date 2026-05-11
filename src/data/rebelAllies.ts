/**
 * Rebel-ally (NPC) ships that appear in HotAC missions: Outer Rim Smuggler,
 * HWK-290, GR-75 and similar. Players plan their dial collectively but
 * they're tracked as squadrons in the app for hull/shield bookkeeping and
 * Protect-action targeting.
 *
 * These ship types are NOT in `src/data/Ships.tsx` because they don't have
 * AI maneuver tables or upgrade trees. They live here in a parallel
 * registry with just the stats the UI needs.
 */

/**
 * Stable id for a Rebel ally ship type. Distinct from `ShipId` (which
 * indexes the AI ships in `Ships.tsx`) so callers can't accidentally pass
 * one where the other is expected.
 */
export type AllyShipId = 'HWK290' | 'GR75' | 'OUTER_RIM_SMUGGLER';

export interface AllyShipDef {
  /**
   * Display name in the UI — also serves as the physical-model identity
   * for ownership/gating purposes.
   */
  name: string;
  /** Base hull. */
  hull: number;
  /** Base shields. */
  shields: number;
  /** Base agility (display only). */
  agility: number;
}

export const REBEL_ALLIES: Readonly<Record<AllyShipId, AllyShipDef>> = Object.freeze({
  HWK290: {
    name: 'HWK-290',
    hull: 4,
    shields: 1,
    agility: 2,
  },
  GR75: {
    name: 'GR-75 Transport',
    hull: 12,
    shields: 4,
    agility: 0,
  },
  OUTER_RIM_SMUGGLER: {
    name: 'Outer Rim Smuggler',
    hull: 6,
    shields: 4,
    agility: 1,
  },
});

/**
 * Per-mission ally setup, declared on `Scenario.allies`. Each entry creates
 * one ally squadron at scenario start.
 *
 * `displayName` overrides the default ship name (e.g. "Quantum Storm" for
 * the Care Package GR-75). `startingHull` / `startingShields` override the
 * base stats when a mission starts the ally damaged or boosted.
 *
 * Per-mission upgrade lists, AI rules (e.g. "team-controlled dial"), and
 * energy systems (GR-75 huge-ship) are out of scope for the MVP — they're
 * documented in the mission's `specialRules` and tracked by players.
 */
export interface AllySetup {
  ship: AllyShipId;
  displayName?: string;
  startingHull?: number;
  startingShields?: number;
}
