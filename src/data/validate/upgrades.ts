import { Ships, UPGRADES } from '../Ships';
import { FgaUpgradePool } from '../fga/FgaUpgradePool';
import { CommunityUpgrades } from '../fga/CommunityUpgrades';
import { fgaTargetSelectionByShip } from '../fga/FgaTargetSelection';
import { fgaShipActionsByShip } from '../fga/FgaShipActions';
import { fgaAttackByShip } from '../fga/FgaAttack';
import { AndersonUpgradePool } from '../anderson/AndersonUpgradePool';
import {
  checkUpgradeShortcodes,
  checkPriorityShortcodes,
} from './shortcodes';
import type { ValidationFailure } from './types';

export function checkUpgradeSourceCoverage(failures: ValidationFailure[]): void {
  const knownSources = new Set<string>(Object.values(UPGRADES));
  for (const ship of Object.values(Ships)) {
    for (const source of ship.upgrades) {
      if (!knownSources.has(source)) {
        failures.push({
          rule: 'Upgrade source enum',
          detail: `Ships.${ship.id}.upgrades references unknown source "${source}"`,
        });
      }
    }
  }
}

export function checkFgaContentShortcodes(failures: ValidationFailure[]): void {
  checkUpgradeShortcodes('FgaUpgradePool', FgaUpgradePool, failures);
  checkUpgradeShortcodes('CommunityUpgrades', CommunityUpgrades, failures);
  checkPriorityShortcodes('fga.target', fgaTargetSelectionByShip, failures);
  checkPriorityShortcodes('fga.action', fgaShipActionsByShip, failures);
  checkPriorityShortcodes('fga.attack', fgaAttackByShip, failures);
}

export function checkAndersonContentShortcodes(failures: ValidationFailure[]): void {
  checkUpgradeShortcodes('AndersonUpgradePool', AndersonUpgradePool, failures);
}
