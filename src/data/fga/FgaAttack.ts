/**
 * FGA "Attack Target" priority lists per ship.
 * Plain-string priorities with `:icon-name:` shortcodes.
 */

import type { ShipId } from '../Ships';

const TIELN: readonly string[] = ['Nearest enemy'];
const TIEIN: readonly string[] = ['Nearest enemy'];
const TIEPH: readonly string[] = ['Nearest enemy'];

const TIEADVX: readonly string[] = [
  'Ship that is locked (prio: :missile:, :front-arc:)',
  'Nearest enemy',
];

const TIESA: readonly string[] = [
  'Ship that is locked (prio: :torpedo:, :missile:, :front-arc:)',
  'Nearest enemy (prio: :missile:, :front-arc:)',
];

const TIEDEF: readonly string[] = [
  'Ship that is locked (prio: :missile:, :cannon:, :front-arc:)',
  'Nearest enemy (prio: :missile:, :cannon:, :front-arc:)',
];

const LAMBDA: readonly string[] = [
  'Nearest enemy (prio: :cannon:, :front-arc:, :rear-arc:)',
  'If allowed by :gunner:, nearest enemy (prio: :rear-arc:)',
];

const VT49: readonly string[] = [
  'Ship that is locked (prio: :torpedo:, :turret:)',
  'Nearest enemy',
];

export const fgaAttackByShip: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
  TIELN, TIEIN, TIEADVX, TIESA, TIEDEF, TIEPH, LAMBDA, VT49,
});
