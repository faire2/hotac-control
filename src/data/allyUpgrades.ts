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
