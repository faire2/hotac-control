/**
 * Mission-issued upgrade cards for rebel allies.
 *
 * Allies don't roll from FGA / Anderson pools — their loadout is fixed by
 * the mission text. Each card here is a canonical, frozen `Upgrade` that
 * scenarios reference directly via `AllySetup.upgrades`.
 *
 * Keep this list short — only add cards a mission actually equips.
 */

import type { Upgrade } from './shared/coreUpgrades';
import { WEAPON_RANGE } from './shared/coreUpgrades';

export const ION_CANNON_TURRET: Upgrade = Object.freeze({
  skillName: 'Ion Cannon Turret',
  description:
    'Attack (:front-arc: or :rear-arc:): If this attack hits, spend 1 :hit: or :crit: result to cause the defender to suffer 1 :hit: damage. All remaining :hit: / :crit: results inflict ion tokens instead of damage.',
  attack: 3,
  range: WEAPON_RANGE.R12,
});

/* --- GR-75 transport upgrades (energy-fuelled support cards) ------------- */

// Bright Hope (Chasing Phantoms II).
export const TARGETING_COORDINATOR: Upgrade = Object.freeze({
  skillName: 'Targeting Coordinator',
  description:
    'Spend 1 Energy to choose 1 friendly ship at Range 0-2. Acquire a :lock:, then pass the lock on to that friendly ship.',
});

export const REPAIR_TEAM: Upgrade = Object.freeze({
  skillName: 'Repair Team',
  description: 'Spend 1 or more Energy to repair that many face-up damage cards.',
});

export const COMMS_BOOSTER: Upgrade = Object.freeze({
  skillName: 'Comms Booster',
  description:
    'Spend 1 Energy to remove all stress tokens from a friendly ship at Range 0-1.',
});

// Quantum Storm (Mine Fields III).
export const DAMAGE_CONTROL_TEAM: Upgrade = Object.freeze({
  skillName: 'Damage Control Team',
  description:
    'Before you engage, you may spend 1 or more Energy to flip that many of your Offline upgrade cards. Action: Spend 1 or more Energy to repair that many of your face-up Ship damage cards.',
});

export const COMMS_TEAM: Upgrade = Object.freeze({
  skillName: 'Comms Team',
  description:
    'After you perform a :coordinate: Coordinate action, you may spend up to 2 Energy to coordinate that many additional ships at Range 0-1 of the ship you coordinated.',
});

export const TIBANNA_RESERVES: Upgrade = Object.freeze({
  skillName: 'Tibanna Reserves',
  description: 'Action: Spend 1 :charge: to recover 2 Energy.',
  charge: 3,
});
