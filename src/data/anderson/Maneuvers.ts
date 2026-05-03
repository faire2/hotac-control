/**
 * Anderson AI maneuver tables.
 *
 * Phase 5a (this file at present): infrastructure only — empty table.
 * Phase 5b: transcribe each ship's maneuver dial from
 * `docs/anderson/pages/p-NN.png`. Each entry is a 6-tuple (1d6 roll) per
 * Position key.
 *
 * Anderson reuses the FGA `Position` enum keys (R4_*, R3_*, R1_*, STRS_*).
 * The R2 split is a UI concern: the position selector decides whether
 * R2-Closing maps to R1_* and R2-Fleeing maps to R3_*. See DATA-LAYER.md §4.
 */

import type { ShipId } from '../Ships';
import type { ManeuverTuple, Position } from '../Maneuvers';

export type AndersonManeuverTable = Readonly<Partial<Record<Position, ManeuverTuple>>>;
export type AndersonManeuversByShip = Readonly<Partial<Record<ShipId, AndersonManeuverTable>>>;

// TODO(phase-5b): transcribe maneuver dials from docs/anderson/pages/p-NN.png.
// Each entry must have all 20 PSN keys (15 active + 5 STRS_*) with 6-tuple values.
export const andersonManeuvers: AndersonManeuversByShip = Object.freeze({});
