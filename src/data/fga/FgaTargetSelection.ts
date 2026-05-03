/**
 * FGA "Select Target" priority lists per ship.
 * Plain-string priorities with `:icon-name:` shortcodes; rendered by `<PriorityList>`.
 */

import type { ShipId } from '../Ships';

const TIELN: readonly string[] = [
  'Nearest enemy in :front-arc:',
  'Nearest enemy',
];

const TIEIN: readonly string[] = [
  'Nearest enemy in :front-arc:',
  'Nearest enemy',
];

const TIEADVX: readonly string[] = [
  'Locked enemy within range 3',
  'Nearest enemy with lower initiative in :front-arc:',
  'Nearest enemy in :front-arc:',
  'Nearest enemy',
];

const TIESA: readonly string[] = [
  'Locked enemy within range 3',
  'Nearest enemy in :front-arc:',
  'Nearest enemy',
];

const TIEDEF: readonly string[] = [
  'Locked enemy within range 3',
  'Nearest enemy with lower initiative in :front-arc:',
  'Nearest enemy in :front-arc:',
  'Nearest enemy',
];

const TIEPH: readonly string[] = [
  'Nearest enemy in :front-arc:',
  'Nearest enemy',
];

const LAMBDA: readonly string[] = [
  'Nearest enemy in :front-arc:',
  'Nearest enemy',
];

const VT49: readonly string[] = [
  'Locked enemy within range 3',
  'Nearest enemy in :front-arc:',
  'Nearest enemy',
];

export const fgaTargetSelectionByShip: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
  TIELN, TIEIN, TIEADVX, TIESA, TIEDEF, TIEPH, LAMBDA, VT49,
});
