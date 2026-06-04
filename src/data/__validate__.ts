/**
 * Runtime validator for the data layer.
 *
 * Asserts the invariants documented in `docs/DATA-LAYER.md`.
 *
 * Imported as a side-effect from `App.tsx` in dev so issues surface immediately.
 * Run as a Vitest test in CI to gate the build (see `tests/dataLayer.test.ts`).
 *
 * Per-concern checks live in `./validate/`; this file is the orchestrator.
 */

import type { Maneuver, Position } from './Maneuvers';
import type { ShipId } from './Ships';
import { checkManeuvers, checkAiCoverage } from './validate/maneuvers';
import {
  checkUpgradeSourceCoverage,
  checkFgaContentShortcodes,
  checkAndersonContentShortcodes,
} from './validate/upgrades';
import { checkScenarios } from './validate/scenarios';
import { checkAllyActions } from './validate/allies';
import type { ValidationFailure } from './validate/types';

export function runValidator(): void {
  const failures: ValidationFailure[] = [];

  checkManeuvers(failures);
  checkAiCoverage(failures);
  checkUpgradeSourceCoverage(failures);
  checkFgaContentShortcodes(failures);
  checkAndersonContentShortcodes(failures);
  checkScenarios(failures);
  checkAllyActions(failures);

  if (failures.length > 0) {
    const lines = failures.map((f) => `  [${f.rule}] ${f.detail}`).join('\n');
    throw new Error(`Data layer validation failed:\n${lines}`);
  }
}

// Re-exports so the validator can be referenced as a barrel.
export type { Maneuver, Position, ShipId };
