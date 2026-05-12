/**
 * Canonical Hull Upgrade and Shield Upgrade objects.
 *
 * Why this file exists: previously the same upgrade was defined twice in
 * separate engine modules, forcing `App.jsx` to compare via
 * `upgrade === A || upgrade === B`. Hoisting the identity here lets every
 * engine reference the same canonical object so a single
 * `upgrade === HULL_UPGRADE` check suffices regardless of source.
 */

/** Weapon ranges as canonical strings. */
export const WEAPON_RANGE = Object.freeze({
  R1: '1',
  R12: '1-2',
  R23: '2-3',
  R13: '1-3',
} as const);

export type WeaponRange = (typeof WEAPON_RANGE)[keyof typeof WEAPON_RANGE];

export interface Upgrade {
  /** Display name on the upgrade card. */
  skillName: string;
  /** Plain-text description with `:icon-name:` shortcodes for inline icons. */
  description: string;
  /** Charge token economy. */
  charge?: number;
  recharge?: number;
  /** Weapon-specific upgrades (torpedoes, missiles, cannons). */
  attack?: number;
  range?: WeaponRange;
  bullseye?: boolean;
  /**
   * Anderson Force-capacity contribution. Sith Infiltrator + TIE Advanced v1
   * elite upgrades that print "[Adds N :force:]" on the card add to a
   * squad-level force-token pool. The UI tracks the running pool as a
   * violet "focus-like" counter with +/- controls — see
   * `docs/anderson/TRANSCRIPTION_NOTES.md` for the deferred UI work.
   */
  addsForce?: number;
}

export const HULL_UPGRADE: Upgrade = Object.freeze({
  skillName: 'Hull Upgrade',
  description: 'Increases your hull by 1. Already included in ship hull value.',
});

export const SHIELD_UPGRADE: Upgrade = Object.freeze({
  skillName: 'Shield Upgrade',
  description: 'Increases your shields by 1. Already included in ship shield value.',
});

/** Returns true if the upgrade is the canonical Hull or Shield Upgrade. */
export function isHullShieldUpgrade(u: Upgrade): boolean {
  return u === HULL_UPGRADE || u === SHIELD_UPGRADE;
}

/** Counts how many extra hull and shields a list of upgrades grants. */
export function countExtraHullAndShield(
  upgrades: readonly Upgrade[],
): { extraHull: number; extraShield: number } {
  let extraHull = 0;
  let extraShield = 0;
  for (const u of upgrades) {
    if (u === HULL_UPGRADE) extraHull += 1;
    if (u === SHIELD_UPGRADE) extraShield += 1;
  }
  return { extraHull, extraShield };
}
