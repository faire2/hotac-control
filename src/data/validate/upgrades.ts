import { Ships, UPGRADES } from '../Ships';
import { FgaUpgradePool } from '../fga/FgaUpgradePool';
import { CommunityUpgrades } from '../fga/CommunityUpgrades';
import { CommunityUpgradeTree } from '../fga/CommunityUpgradeTree';
import type { Upgrade } from '../shared/coreUpgrades';
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

/**
 * Every upgrade referenced by `CommunityUpgradeTree` must resolve to a defined
 * `CommunityUpgrades` entry. `tsc` cannot catch a typo'd or missing key here
 * because the pool is typed `Record<string, Upgrade>` — any `C.foo` access is
 * assumed present — so a bad key silently becomes `upgrade: undefined` at
 * runtime. This guards that gap (it once let `majorRhymer`/`ruthless`/
 * `kirKanos`/`lieutenantColzet` ship as undefined rows).
 */
export function checkCommunityTreeResolution(failures: ValidationFailure[]): void {
  const defined = new Set<Upgrade>(Object.values(CommunityUpgrades));
  for (const [shipId, variants] of Object.entries(CommunityUpgradeTree)) {
    variants.forEach((variant, variantIndex) => {
      variant.forEach((row, rowIndex) => {
        if (!defined.has(row.upgrade)) {
          failures.push({
            rule: 'Community upgrade resolution',
            detail: `CommunityUpgradeTree.${shipId} variant ${String(variantIndex)}, row ${String(rowIndex)}: upgrade does not resolve to a CommunityUpgrades entry (likely a typo'd or missing key).`,
          });
        }
      });
    });
  }
}
