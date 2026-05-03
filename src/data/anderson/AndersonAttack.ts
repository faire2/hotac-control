import type { ShipId } from '../Ships';

/**
 * Anderson "Attack Target" priority lists per ship.
 */

const TIELN: readonly string[] = ['Nearest enemy'];

export const andersonAttackByShip: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
  TIELN,
});
