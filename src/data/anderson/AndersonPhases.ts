/**
 * System Phase / End Phase descriptions for Anderson cards that have them.
 * Display-only — the player executes manually.
 *
 * Per page survey, the following ships have a System Phase or End Phase:
 *   TIESA  System: "Device Logic Check"
 *   TIEPH  System: "Roll to Decloak (reroll if blocked)" + Perform action
 *          End: "Spend 1 Evade token to gain 1 Cloak token" (Strypium Array)
 *   TIESK  System: "Use Adaptive Ailerons. Execute the maneuver that brings
 *          you closest to an enemy ship. If the maneuver would take you off
 *          the board, skip this step."
 *   TIERP  System: same Adaptive Ailerons step as TIESK
 *   TIECP  System: "Device Logic Check"
 *   SITH   System: "Roll to Decloak (reroll if blocked, discard cloak token
 *          if all are locked)"
 *
 * Phase 5b: transcribe verbatim text.
 */

import type { ShipId } from '../Ships';

export interface PhaseDescription {
  name: string;
  steps: readonly string[];
}

export interface AndersonPhases {
  systemPhase?: PhaseDescription;
  endPhase?: PhaseDescription;
}

// TODO(phase-5b): transcribe phase boxes from PDF.
export const andersonPhases: Readonly<Partial<Record<ShipId, AndersonPhases>>> = Object.freeze({});
