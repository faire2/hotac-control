import type { Scenario } from './types';
import { localTrouble } from './localTrouble';

export const SCENARIOS: readonly Scenario[] = Object.freeze([localTrouble]);

export function findScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export type { Scenario, ScenarioSquad, SetupOp, ArrivalTrigger, Vector, Territory } from './types';
export { resolveSquad, summarizeSquad } from './resolve';
export type { ResolvedSquad, ResolveContext } from './resolve';
