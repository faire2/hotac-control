/**
 * Anderson position selection UI.
 *
 * Phase 5a: re-exports FGA's polar grid as-is. The PSN keys are identical
 * between engines (Anderson reuses FGA's R1_*, R3_*, R4_*, STRS_* keys);
 * what differs is how R2 is interpreted — closing vs fleeing — and that
 * needs an extra UI toggle.
 *
 * Phase 5b: replace this re-export with a copy of the polar grid plus a
 * "target is closing / fleeing" toggle that flips R2 between R1_* and
 * R3_* keys before dispatching.
 */
import {FgaPositionSelection} from '../fga/FgaPositionSelection';

export const AndersonPositionSelection = FgaPositionSelection;
