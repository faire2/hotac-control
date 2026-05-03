import type { ShipId } from '../Ships';

/**
 * Anderson "Select Action" priority lists per ship.
 * Plain-string priorities with `:icon-name:` shortcodes.
 */

const TIELN: readonly string[] = [
  'Resolve :crit:.',
  ":barrelroll: to avoid target's arc and still get a shot.",
  ':barrelroll: to get a shot.',
  ':focus: if you have a shot.',
  ":barrelroll: to avoid target's arc.",
  ':evade:.',
];

export const andersonShipActionsByShip: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
  TIELN,
});
