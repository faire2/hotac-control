import type { ShipId } from '../Ships';

/**
 * Anderson "Select Target" priority lists per ship.
 * Plain-string priorities with `:icon-name:` shortcodes; rendered by `<PriorityList>`.
 */

const TIELN: readonly string[] = [
  'Nearest enemy in :front-arc:',
  'Nearest enemy',
];

export const andersonTargetSelectionByShip: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
  TIELN,
});
