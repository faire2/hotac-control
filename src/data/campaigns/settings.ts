/**
 * Static settings constants + helpers.
 *
 * The legacy `CampaignSettings` slot (per-player localStorage record) was
 * retired in 2026-05-06's Phase 10 cleanup — all settings now live on the
 * active `Campaign` record. Free play / scenario-only modes use
 * `DEFAULT_SPAWN_SETTINGS` (own everything, less-random off, no
 * introductions).
 */

import { Ships } from '../Ships';
import type { ShipId } from '../Ships';
import { REBEL_ALLIES } from '../rebelAllies';

/**
 * Names of physical X-Wing models the player can own. Derived from the
 * Ship registry (excluding `alwaysOwned` types) plus the ally registry.
 * Used to gate mission availability via `Scenario.requiredModels` and to
 * drive the campaign-setup checklist.
 */
export const STANDARD_MODELS: readonly string[] = Object.freeze([
  ...Object.values(Ships)
    .filter((s) => !s.alwaysOwned)
    .map((s) => s.name),
  ...Object.values(REBEL_ALLIES).map((a) => a.name),
]);

/**
 * The subset of campaign state the spawn pipeline cares about. Both
 * `Campaign` records and the free-play default expose these fields, so
 * `SpawnContext.settings` can be either.
 */
export interface SpawnSettings {
  ownedModels: readonly string[];
  lessRandomShips: boolean;
  introducedShipTypes: readonly ShipId[];
}

/** Defaults used outside of campaign mode (own everything, no introductions). */
export const DEFAULT_SPAWN_SETTINGS: SpawnSettings = Object.freeze({
  ownedModels: STANDARD_MODELS,
  lessRandomShips: false,
  introducedShipTypes: [],
});

/**
 * Returns true iff every entry in `required` is present in `owned`.
 * Case-insensitive exact match.
 */
export function ownsRequiredModels(
  required: readonly string[] | undefined,
  owned: readonly string[],
): boolean {
  if (!required || required.length === 0) return true;
  const set = new Set(owned.map((m) => m.toLowerCase()));
  return required.every((r) => set.has(r.toLowerCase()));
}
