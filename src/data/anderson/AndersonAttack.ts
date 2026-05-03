import type { ShipId } from '../Ships';

/**
 * Anderson "Attack Target" priority lists per ship.
 * Phase 5b: transcribe from `docs/anderson/pages/p-NN.png`.
 */
export const andersonAttackByShip: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({});
