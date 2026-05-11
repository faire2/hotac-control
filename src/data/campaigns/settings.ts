/**
 * Static settings constants + helpers.
 *
 * The legacy `CampaignSettings` slot (per-player localStorage record) was
 * retired in 2026-05-06's Phase 10 cleanup — all settings now live on the
 * active `Campaign` record. Free play / scenario-only modes use
 * `defaultSpawnSettings()` (own everything, less-random off, no
 * introductions).
 */

import { Ships } from '../Ships';
import type { ShipId } from '../Ships';

/**
 * Names of physical X-Wing models the player can own. Derived from the
 * Ship registry (excluding `alwaysOwned` types). Rebel ally ships are
 * included since they're regular Ship entries with `ai: []`.
 * Used to gate mission availability via `requiredModelsFor(scenario)` and
 * to drive the campaign-setup checklist.
 *
 * Lazy + memoized: the read of `Ships` happens on first call, not at
 * module-load time, so this stays safe even if `Ships.tsx`'s dependency
 * graph ever loops back through `settings.ts`. See AGENTS.md "Module
 * structure".
 */
let _standardModels: readonly string[] | undefined;
export function standardModels(): readonly string[] {
  return _standardModels ??= Object.freeze(
    Object.values(Ships)
      .filter((s) => !s.alwaysOwned)
      .map((s) => s.name),
  );
}

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
let _defaultSpawnSettings: SpawnSettings | undefined;
export function defaultSpawnSettings(): SpawnSettings {
  return _defaultSpawnSettings ??= Object.freeze({
    ownedModels: standardModels(),
    lessRandomShips: false,
    introducedShipTypes: [],
  });
}

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
