import type { ShipId } from '../Ships';
import { isIconKey } from '../icons';
import { extractShortcodes } from '../shortcodes';
import type { Upgrade } from '../shared/coreUpgrades';
import type { ValidationFailure } from './types';

export function checkShortcodes(
  scope: string,
  text: string,
  failures: ValidationFailure[],
): void {
  for (const key of extractShortcodes(text)) {
    if (!isIconKey(key)) {
      failures.push({
        rule: 'Resolved icon shortcodes',
        detail: `${scope}: ":${key}:" is not a known IconKey`,
      });
    }
  }
}

export function checkUpgradeShortcodes(
  scope: string,
  pool: Readonly<Record<string, Upgrade>>,
  failures: ValidationFailure[],
): void {
  for (const [key, upgrade] of Object.entries(pool)) {
    checkShortcodes(`${scope}.${key}`, upgrade.description, failures);
  }
}

export function checkPriorityShortcodes(
  scope: string,
  byShip: Readonly<Partial<Record<ShipId, readonly string[]>>>,
  failures: ValidationFailure[],
): void {
  for (const [shipId, items] of Object.entries(byShip)) {
    items.forEach((text, idx) => {
      checkShortcodes(`${scope}.${shipId}[${idx.toString()}]`, text, failures);
    });
  }
}
