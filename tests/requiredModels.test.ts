import { describe, expect, it } from 'vitest';
import { requiredModelsFor } from '../src/data/scenarios/requiredModels';
import { findScenario } from '../src/data/scenarios';
import type { Scenario } from '../src/data/scenarios/types';

function scenarioOrThrow(id: string): Scenario {
  const s = findScenario(id);
  if (!s) throw new Error(`scenario ${id} not found`);
  return s;
}

describe('requiredModelsFor', () => {
  it('captures specific ships referenced via add/replace/addElite', () => {
    const required = requiredModelsFor(scenarioOrThrow('capture-officer-2'));
    expect(required).toContain('Lambda-class T-4A Shuttle');
    expect(required).toContain('TIE/in Interceptor');
  });

  it('excludes TIE/ln (alwaysOwned)', () => {
    const required = requiredModelsFor(scenarioOrThrow('capture-officer-2'));
    expect(required).not.toContain('TIE/ln Starfighter');
  });

  it('includes ally ships from scenario.allies', () => {
    const required = requiredModelsFor(scenarioOrThrow('refueling-station-1'));
    expect(required).toContain('HWK-290');
  });

  it('returns deduped names even when a ship appears in multiple squads', () => {
    const required = requiredModelsFor(scenarioOrThrow('capture-officer-2'));
    const counts = new Map<string, number>();
    for (const name of required) counts.set(name, (counts.get(name) ?? 0) + 1);
    for (const [, count] of counts) expect(count).toBe(1);
  });
});
