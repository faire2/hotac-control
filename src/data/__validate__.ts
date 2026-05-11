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
import type { ShipId } from './Ships';
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
import { hasTag } from './scenarios/types';
import { REBEL_ALLIES } from './rebelAllies';

const KNOWN_MANEUVERS = new Set<string>(Object.values(MVRS));
const KNOWN_POSITIONS = new Set<string>(Object.values(PSN));
const KNOWN_MODEL_NAMES = new Set<string>([
  ...Object.values(Ships).map((s) => s.name.toLowerCase()),
  ...Object.values(REBEL_ALLIES).map((a) => a.name.toLowerCase()),
]);

type ManeuverTablesByShip = Record<string, Partial<Record<Position, readonly unknown[]>> | undefined>;

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
          detail: `${engine}.${shipId} missing required position "${position}"`,
        });
        continue;
      }
      if (row.length !== 6) {
        failures.push({
          rule: 'Length-6 maneuver arrays',
          detail: `${engine}.${shipId}["${position}"] has length ${row.length.toString()}, expected 6`,
        });
      }
      for (let i = 0; i < row.length; i++) {
        const code = row[i];
        if (typeof code !== 'string' || !KNOWN_MANEUVERS.has(code)) {
          failures.push({
            rule: 'Resolved maneuver references',
            detail: `${engine}.${shipId}["${position}"][${i.toString()}] = ${typeof code === 'string' ? code : String(code)} is not a known MVRS code`,
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
  for (const ship of Object.values(Ships)) {
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
    andersonManeuvers,
    FGA_REQUIRED_POSITIONS,
    failures,
  );
}

function checkUpgradeSourceCoverage(failures: ValidationFailure[]): void {
  const knownSources = new Set<string>(Object.values(UPGRADES));
  for (const ship of Object.values(Ships)) {
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
  if (op.kind === 'addElite' && op.ship !== undefined && !(op.ship in Ships)) {
    failures.push({
      rule: 'Scenario ship references',
      detail: `${scope}: addElite references unknown ship "${op.ship}"`,
    });
  }
  if (op.kind === 'addShields' && op.count <= 0) {
    failures.push({
      rule: 'Scenario addShields count',
      detail: `${scope}: addShields count must be > 0, got ${op.count.toString()}`,
    });
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
    if (!hasTag(squad, 'dynamicSpawn')) {
      failures.push({
        rule: 'Scenario squad composition',
        detail: `${scope}: composition is empty (add a 'dynamicSpawn' tag if intentional)`,
      });
    }
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
    if (ops.length === 0) continue;
    ops.forEach((op, idx) => {
      checkSetupOp(`${scope}.${pcKey}p[${idx.toString()}]`, op, failures);
    });
  }
}

const VECTOR_LETTERS = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);

function checkOutcome(
  scope: string,
  outcome: Scenario['victory'],
  scenarioIds: ReadonlySet<string>,
  failures: ValidationFailure[],
): void {
  if (outcome.next.kind === 'arcLink') {
    if (!scenarioIds.has(outcome.next.missionId)) {
      // Soft warning — bulk-parsing the mission pack lands missions
      // incrementally and forward references are expected during authoring.
      // Once the pack is complete, promote this back to a hard failure.
      console.warn(
        `[scenario validator] ${scope}: outcome.next references mission "${outcome.next.missionId}" which is not yet registered`,
      );
    }
  }
  if (outcome.rebelPoints !== undefined && outcome.rebelPoints < 0) {
    failures.push({
      rule: 'Scenario outcome points',
      detail: `${scope}: rebelPoints must be >= 0`,
    });
  }
  if (outcome.imperialPoints !== undefined && outcome.imperialPoints < 0) {
    failures.push({
      rule: 'Scenario outcome points',
      detail: `${scope}: imperialPoints must be >= 0`,
    });
  }
  checkShortcodes(`${scope}.text`, outcome.text, failures);
}

function checkScenario(
  scenario: Scenario,
  scenarioIds: ReadonlySet<string>,
  failures: ValidationFailure[],
): void {
  const scope = `scenario.${scenario.id}`;

  if (scenario.turnLimit < 1) {
    failures.push({
      rule: 'Scenario turn limit',
      detail: `${scope}: turnLimit must be >= 1`,
    });
  }

  checkShortcodes(`${scope}.briefing`, scenario.briefing, failures);
  scenario.objectives.forEach((obj, i) => {
    checkShortcodes(`${scope}.objectives[${i.toString()}]`, obj.text, failures);
  });
  scenario.specialRules?.forEach((rule, i) => {
    checkShortcodes(`${scope}.specialRules[${i.toString()}].body`, rule.body, failures);
  });
  checkOutcome(`${scope}.victory`, scenario.victory, scenarioIds, failures);
  checkOutcome(`${scope}.defeat`, scenario.defeat, scenarioIds, failures);

  scenario.requiredModels?.forEach((model, i) => {
    if (!KNOWN_MODEL_NAMES.has(model.toLowerCase())) {
      failures.push({
        rule: 'Scenario requiredModels',
        detail: `${scope}.requiredModels[${i.toString()}]: "${model}" doesn't match any Ship.name or REBEL_ALLIES name`,
      });
    }
  });

  scenario.allies?.forEach((ally, i) => {
    if (!(ally.ship in REBEL_ALLIES)) {
      failures.push({
        rule: 'Scenario ally references',
        detail: `${scope}.allies[${i.toString()}]: unknown ally ship "${ally.ship}"`,
      });
    }
    if (ally.startingHull !== undefined && ally.startingHull < 0) {
      failures.push({
        rule: 'Scenario ally starting hull',
        detail: `${scope}.allies[${i.toString()}]: startingHull must be >= 0`,
      });
    }
    if (ally.startingShields !== undefined && ally.startingShields < 0) {
      failures.push({
        rule: 'Scenario ally starting shields',
        detail: `${scope}.allies[${i.toString()}]: startingShields must be >= 0`,
      });
    }
  });

  scenario.squads.forEach((squad) => {
    const sqScope = `${scope}.squad.${squad.name}`;

    const vec = squad.vector;
    if (typeof vec === 'object' && !Array.isArray(vec) && 'kind' in vec) {
      // oppositeOf reference — must point to a sibling squad in this scenario.
      const target = vec.squadName;
      if (!scenario.squads.some((s) => s.name === target)) {
        failures.push({
          rule: 'Scenario oppositeOf reference',
          detail: `${sqScope}: vector.oppositeOf "${target}" — no sibling squad with that name`,
        });
      }
    } else {
      const vectors = Array.isArray(squad.vector)
        ? (squad.vector as readonly (number | string)[])
        : [squad.vector as number | string];
      if (vectors.length === 0) {
        failures.push({
          rule: 'Scenario vector kind',
          detail: `${sqScope}: vector tuple is empty`,
        });
      }
      const KNOWN_DICE = new Set(['1d6', '1d12', '1d6+6']);
      for (const v of vectors) {
        if (typeof v === 'number') {
          if (!Number.isInteger(v) || v < 1 || v > 12) {
            failures.push({
              rule: 'Scenario vector range',
              detail: `${sqScope}: vector ${v.toString()} is outside 1..12`,
            });
          }
        } else if (!KNOWN_DICE.has(v) && !VECTOR_LETTERS.has(v)) {
          failures.push({
            rule: 'Scenario vector kind',
            detail: `${sqScope}: vector "${v}" must be 1..12, a known dice form (1d6/1d12/1d6+6), or a map letter`,
          });
        }
      }
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
  const allIds = new Set<string>(SCENARIOS.map((s) => s.id));
  for (const scenario of SCENARIOS) {
    if (seen.has(scenario.id)) {
      failures.push({
        rule: 'Scenario id uniqueness',
        detail: `duplicate scenario id "${scenario.id}"`,
      });
    }
    seen.add(scenario.id);
    checkScenario(scenario, allIds, failures);
  }
}

export function runValidator(): void {
  const failures: ValidationFailure[] = [];

  checkManeuverTables('fga', fgaManeuvers, FGA_REQUIRED_POSITIONS, failures);
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
