/**
 * Pilot abilities (display-only) for each Anderson AI card.
 *
 * The bottom panel of each Anderson card has a named ability with
 * descriptive text. The player executes it manually; the app just renders.
 *
 * Phase 5b: transcribe from docs/anderson/pages/p-NN.png.
 */

import type { ShipId } from '../Ships';

export interface PilotAbility {
  name: string;
  description: string;
}

// TODO(phase-5b): transcribe from PDF. Known names per page survey:
//   TIESK  → "Adaptive Ailerons"
//   TIERP  → "Adaptive Ailerons" (variant)
//   TIESA  → "Nimble Bomber"
//   TIEPH  → "Strypium Array"
//   TIEDEF → "Full Throttle"
//   TIEADVX → "Advanced Targeting Computer"
//   TIEADVV1 → "Instinctive Aim"
//   TIEIN  → "Sensitive Controls"
//   TIERBH → "Rotating Cannons"
//   TIERBA → "Agile Gunner"
//   TIECP  → "Flying Fortress"
//   SITH   → (Decloak / cloak token mechanics)
//   STARWING → (TBD)
//   TIELN  → (no special ability)
//   LAMBDA, VT49 → (TBD)
export const andersonAbilities: Readonly<Partial<Record<ShipId, PilotAbility>>> = Object.freeze({});
