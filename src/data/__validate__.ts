/**
 * Runtime validator for the data layer.
 *
 * Asserts the invariants documented in `docs/DATA-LAYER.md`.
 *
 * Imported as a side-effect from `App.jsx` in dev so issues surface immediately.
 * Run as a Vitest test in CI to gate the build (see `tests/dataLayer.test.ts`).
 *
 * Coverage today: FGA path is fully validated; Anderson path is shape-checked
 * against the (still partial) andersonManeuvers table. Hinny has been removed.
 */

import { Ships, AI, UPGRADES } from './Ships';
import type { Ship, ShipId } from './Ships';
import { PSN, MVRS } from './Maneuvers';
import type { Position, Maneuver } from './Maneuvers';

import { fgaManeuvers } from './fga/Maneuvers';
import { andersonManeuvers } from './anderson/Maneuvers';
import { FgaUpgradePool } from './fga/FgaUpgradePool';
import { CommunityUpgrades } from './fga/CommunityUpgrades';
import { fgaTargetSelectionByShip } from './fga/FgaTargetSelection';
import { fgaShipActionsByShip } from './fga/FgaShipActions';
import { fgaAttackByShip } from './fga/FgaAttack';
import { isIconKey } from './icons';
import { extractShortcodes } from './shortcodes';
import type { Upgrade } from './shared/coreUpgrades';
import { SCENARIOS } from './scenarios';
import type { Scenario, ScenarioSquad, SetupOp } from './scenarios/types';

const KNOWN_MANEUVERS = new Set<string>(Object.values(MVRS));
const KNOWN_POSITIONS = new Set<string>(Object.values(PSN));

interface ManeuverTablesByShip {
  [shipId: string]: Partial<Record<Position, readonly unknown[]>> | undefined;
}

interface ValidationFailure {
  rule: string;
  detail: string;
}

const FGA_REQUIRED_POSITIONS: readonly Position[] = [
  PSN.R4BULL,
  PSN.R4FRONT,
  PSN.R4FRONTSIDE,
  PSN.R4REARSIDE,
  PSN.R4REAR,
  PSN.R3BULL,
  PSN.R3FRONT,
  PSN.R3FRONTSIDE,
  PSN.R3REARSIDE,
  PSN.R3REAR,
  PSN.R1BULL,
  PSN.R1FRONT,
  PSN.R1FRONTSIDE,
  PSN.R1REARSIDE,
  PSN.R1REAR,
  PSN.STRSBULL,
  PSN.STRSFRONT,
  PSN.STRSFRONTSIDE,
  PSN.STRSREARSIDE,
  PSN.STRSREAR,
];

function checkManeuverTables(
  engine: string,
  tables: ManeuverTablesByShip,
  requiredPositions: readonly Position[],
  failures: ValidationFailure[],
): void {
  for (const [shipId, byPosition] of Object.entries(tables)) {
    if (!byPosition) continue;

    if (!(shipId in Ships)) {
      failures.push({
        rule: 'AI coverage',
        detail: `${engine} has a maneuver table for unknown shipId="${shipId}"`,
      });
      continue;
    }

    for (const position of requiredPositions) {
      const row = byPosition[position];
      if (!row) {
        failures.push({
          rule: 'Position coverage',
          detail: `${engine}.${shipId} missing required position "${String(position)}"`,
        });
        continue;
      }
      if (row.length !== 6) {
        failures.push({
          rule: 'Length-6 maneuver arrays',
          detail: `${engine}.${shipId}["${String(position)}"] has length ${row.length.toString()}, expected 6`,
        });
      }
      for (let i = 0; i < row.length; i++) {
        const code = row[i];
        if (typeof code !== 'string' || !KNOWN_MANEUVERS.has(code)) {
          failures.push({
            rule: 'Resolved maneuver references',
            detail: `${engine}.${shipId}["${String(position)}"][${i.toString()}] = ${String(code)} is not a known MVRS code`,
          });
        }
      }
    }

    for (const positionKey of Object.keys(byPosition)) {
      if (!KNOWN_POSITIONS.has(positionKey)) {
        failures.push({
          rule: 'Position keys exist in PSN',
          detail: `${engine}.${shipId} uses unknown position key "${positionKey}"`,
        });
      }
    }
  }
}

function checkAiCoverage(failures: ValidationFailure[]): void {
  for (const ship of Object.values(Ships) as Ship[]) {
    for (const engine of ship.ai) {
      if (engine === AI.FGA) {
        if (!(ship.id in fgaManeuvers)) {
          failures.push({
            rule: 'AI coverage',
            detail: `Ships.${ship.id}.ai includes "${engine}" but no fgaManeuvers entry exists`,
          });
        }
      }
      // AI.ANDERSON coverage is checked separately in checkAndersonCoverage with phase-aware
      // expectations (Phase 5a tolerates missing maneuver tables; Phase 5b will require them).
    }
  }
}

function checkAndersonCoverage(failures: ValidationFailure[]): void {
  // Validate the *shape* of every Anderson maneuver table that exists.
  // Phase 5a: most ships have no entry yet, which is OK.
  // Phase 5b: missing entries become hard errors via checkAiCoverage.
  checkManeuverTables(
    'anderson',
    andersonManeuvers as ManeuverTablesByShip,
    FGA_REQUIRED_POSITIONS,
    failures,
  );
}

function checkUpgradeSourceCoverage(failures: ValidationFailure[]): void {
  const knownSources = new Set<string>(Object.values(UPGRADES));
  for (const ship of Object.values(Ships) as Ship[]) {
    for (const source of ship.upgrades) {
      if (!knownSources.has(source)) {
        failures.push({
          rule: 'Upgrade source enum',
          detail: `Ships.${ship.id}.upgrades references unknown source "${source}"`,
        });
      }
    }
  }
}

function checkShortcodes(scope: string, text: string, failures: ValidationFailure[]): void {
  for (const key of extractShortcodes(text)) {
    if (!isIconKey(key)) {
      failures.push({
        rule: 'Resolved icon shortcodes',
        detail: `${scope}: ":${key}:" is not a known IconKey`,
      });
    }
  }
}

function checkUpgradeShortcodes(
  scope: string,
  pool: Readonly<Record<string, Upgrade>>,
  failures: ValidationFailure[],
): void {
  for (const [key, upgrade] of Object.entries(pool)) {
    checkShortcodes(`${scope}.${key}`, upgrade.description, failures);
  }
}

function checkPriorityShortcodes(
  scope: string,
  byShip: Readonly<Partial<Record<ShipId, readonly string[]>>>,
  failures: ValidationFailure[],
): void {
  for (const [shipId, items] of Object.entries(byShip)) {
    if (!items) continue;
    items.forEach((text, idx) => {
      checkShortcodes(`${scope}.${shipId}[${idx.toString()}]`, text, failures);
    });
  }
}

function checkSetupOp(
  scope: string,
  op: SetupOp,
  failures: ValidationFailure[],
): void {
  if (op.kind === 'add' || op.kind === 'replace') {
    if (!(op.ship in Ships)) {
      failures.push({
        rule: 'Scenario ship references',
        detail: `${scope}: op "${op.kind}" references unknown ship "${op.ship}"`,
      });
    }
  }
  if (op.gate && op.gate.rebelInitGte < 1) {
    failures.push({
      rule: 'Scenario init gate',
      detail: `${scope}: rebelInitGte must be >= 1, got ${op.gate.rebelInitGte.toString()}`,
    });
  }
}

function checkSquadComposition(
  scope: string,
  squad: ScenarioSquad,
  failures: ValidationFailure[],
): void {
  const cells = Object.entries(squad.composition);
  if (cells.length === 0) {
    failures.push({
      rule: 'Scenario squad composition',
      detail: `${scope}: composition is empty`,
    });
    return;
  }
  for (const [pcKey, ops] of cells) {
    const pc = Number(pcKey);
    if (!Number.isInteger(pc) || pc < 1 || pc > 6) {
      failures.push({
        rule: 'Scenario player-count keys',
        detail: `${scope}: composition has invalid player-count key "${pcKey}"`,
      });
      continue;
    }
    if (!ops || ops.length === 0) continue;
    ops.forEach((op, idx) => {
      checkSetupOp(`${scope}.${pcKey}p[${idx.toString()}]`, op, failures);
    });
  }
}

function checkScenario(scenario: Scenario, failures: ValidationFailure[]): void {
  const scope = `scenario.${scenario.id}`;

  if (scenario.turnLimit < 1) {
    failures.push({
      rule: 'Scenario turn limit',
      detail: `${scope}: turnLimit must be >= 1`,
    });
  }

  scenario.squads.forEach((squad) => {
    const sqScope = `${scope}.squad.${squad.name}`;

    if (typeof squad.vector === 'number') {
      if (!Number.isInteger(squad.vector) || squad.vector < 1 || squad.vector > 6) {
        failures.push({
          rule: 'Scenario vector range',
          detail: `${sqScope}: vector ${squad.vector.toString()} is outside 1..6`,
        });
      }
    } else if (squad.vector !== '1d6') {
      failures.push({
        rule: 'Scenario vector kind',
        detail: `${sqScope}: vector must be 1..6 or "1d6"`,
      });
    }

    if (squad.arrival.kind === 'turn' || squad.arrival.kind === 'rolledTurn') {
      if (squad.arrival.turn < 1 || squad.arrival.turn > scenario.turnLimit) {
        failures.push({
          rule: 'Scenario arrival turn range',
          detail: `${sqScope}: arrival.turn ${squad.arrival.turn.toString()} outside 1..${scenario.turnLimit.toString()}`,
        });
      }
    }

    checkSquadComposition(sqScope, squad, failures);
  });
}

function checkScenarios(failures: ValidationFailure[]): void {
  const seen = new Set<string>();
  for (const scenario of SCENARIOS) {
    if (seen.has(scenario.id)) {
      failures.push({
        rule: 'Scenario id uniqueness',
        detail: `duplicate scenario id "${scenario.id}"`,
      });
    }
    seen.add(scenario.id);
    checkScenario(scenario, failures);
  }
}

export function runValidator(): void {
  const failures: ValidationFailure[] = [];

  checkManeuverTables('fga', fgaManeuvers as ManeuverTablesByShip, FGA_REQUIRED_POSITIONS, failures);
  checkAndersonCoverage(failures);
  checkAiCoverage(failures);
  checkUpgradeSourceCoverage(failures);

  checkUpgradeShortcodes('FgaUpgradePool', FgaUpgradePool, failures);
  checkUpgradeShortcodes('CommunityUpgrades', CommunityUpgrades, failures);
  checkPriorityShortcodes('fga.target', fgaTargetSelectionByShip, failures);
  checkPriorityShortcodes('fga.action', fgaShipActionsByShip, failures);
  checkPriorityShortcodes('fga.attack', fgaAttackByShip, failures);

  checkScenarios(failures);

  if (failures.length > 0) {
    const lines = failures.map((f) => `  [${f.rule}] ${f.detail}`).join('\n');
    throw new Error(`Data layer validation failed:\n${lines}`);
  }
}

// Re-exports so the validator can be referenced as a barrel.
export type { Maneuver, Position, ShipId };
