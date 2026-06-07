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

/**
 * Baseline pilot abilities — the named ability printed on the shipcard
 * of each Imperial AI ship that *every* pilot of that ship type carries
 * for free. Sourced from the FGA-7.3 shipcards PDF; consumed as a
 * canonical singleton by FGA / Community / Anderson upgrade trees so
 * identity comparisons work across engines.
 *
 * Convention: each tree prepends the relevant baseline as the first
 * basic-slot row (init 1 / tier 1 / xpCost 0) on every variant of the
 * matching ship.
 */
export const AUTOTHRUSTERS: Upgrade = Object.freeze({
  skillName: 'Autothrusters',
  description: 'After you perform an action, you may perform a red :barrelroll: or a red :boost: action.',
});

export const ADVANCED_TARGETING_COMPUTER: Upgrade = Object.freeze({
  skillName: 'Advanced Targeting Computer',
  description: 'While you perform a primary attack against a defender you have locked, roll 1 additional die and change 1 :hit: result into a :crit: result.',
});

export const NIMBLE_BOMBER: Upgrade = Object.freeze({
  skillName: 'Nimble Bomber',
  description: 'If you would drop a device using a :straight: template, you may use a :bank-left: or :bank-right: template of the same speed instead.',
});

export const STYGIUM_ARRAY: Upgrade = Object.freeze({
  skillName: 'Stygium Array',
  description: 'After you decloak, you may perform a :barrelroll: action. At the start of the End Phase, you may spend 1 evade token to gain 1 cloak token.',
});

export const FULL_THROTTLE: Upgrade = Object.freeze({
  skillName: 'Full Throttle',
  description: 'After you fully execute a speed 3-5 maneuver, you may perform an :evade: action.',
});

export const INSTINCTIVE_AIM: Upgrade = Object.freeze({
  skillName: 'Instinctive Aim',
  description: 'While you perform a special attack, spend 1 :force: to ignore the :focus: or :lock: requirement.',
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
