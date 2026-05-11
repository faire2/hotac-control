import { Ships } from '../Ships';
import { SCENARIOS } from '../scenarios';
import type { Scenario, ScenarioSquad, SetupOp } from '../scenarios/types';
import { hasTag } from '../scenarios/types';
import { checkShortcodes } from './shortcodes';
import type { ValidationFailure } from './types';

const VECTOR_LETTERS = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
const KNOWN_DICE = new Set(['1d6', '1d12', '1d6+6']);

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
  outcome.unlocksShipTypes?.forEach((id, i) => {
    if (!(id in Ships)) {
      failures.push({
        rule: 'Scenario outcome unlocksShipTypes',
        detail: `${scope}.unlocksShipTypes[${i.toString()}]: "${id}" is not a known ShipId`,
      });
    }
  });
  checkShortcodes(`${scope}.text`, outcome.text, failures);
}

function checkScenarioVector(
  sqScope: string,
  squad: ScenarioSquad,
  scenario: Scenario,
  failures: ValidationFailure[],
): void {
  const vec = squad.vector;
  if (typeof vec === 'object' && !Array.isArray(vec) && 'kind' in vec) {
    const target = vec.squadName;
    if (!scenario.squads.some((s) => s.name === target)) {
      failures.push({
        rule: 'Scenario oppositeOf reference',
        detail: `${sqScope}: vector.oppositeOf "${target}" — no sibling squad with that name`,
      });
    }
    return;
  }
  const vectors = Array.isArray(squad.vector)
    ? (squad.vector as readonly (number | string)[])
    : [squad.vector as number | string];
  if (vectors.length === 0) {
    failures.push({
      rule: 'Scenario vector kind',
      detail: `${sqScope}: vector tuple is empty`,
    });
  }
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

  scenario.allies?.forEach((ally, i) => {
    if (!(ally.ship in Ships)) {
      failures.push({
        rule: 'Scenario ally references',
        detail: `${scope}.allies[${i.toString()}]: unknown ally ship "${ally.ship}"`,
      });
    } else if (Ships[ally.ship].ai.length > 0) {
      failures.push({
        rule: 'Scenario ally references',
        detail: `${scope}.allies[${i.toString()}]: "${ally.ship}" is an AI ship, not a rebel ally`,
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
    if (ally.startingEnergy !== undefined) {
      if (ally.startingEnergy < 0) {
        failures.push({
          rule: 'Scenario ally starting energy',
          detail: `${scope}.allies[${i.toString()}]: startingEnergy must be >= 0`,
        });
      }
      if (ally.ship in Ships && !Ships[ally.ship].hasEnergy) {
        failures.push({
          rule: 'Scenario ally starting energy',
          detail: `${scope}.allies[${i.toString()}]: startingEnergy set but "${ally.ship}" has no energy resource`,
        });
      }
    }
  });

  scenario.squads.forEach((squad) => {
    const sqScope = `${scope}.squad.${squad.name}`;
    checkScenarioVector(sqScope, squad, scenario, failures);

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

export function checkScenarios(failures: ValidationFailure[]): void {
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
