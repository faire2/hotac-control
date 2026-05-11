import { describe, expect, it } from 'vitest';
import {
  opsForShipsOverride,
  priorVectorsFromSquadrons,
  spawnFromScenarioSquad,
  type SpawnContext,
} from '../src/data/scenarios/spawn';
import { localTrouble } from '../src/data/scenarios/localTrouble';
import { DEFAULT_SPAWN_SETTINGS } from '../src/data/campaigns/settings';
import { UPGRADES } from '../src/data/Ships';
import type { Squadron } from '../src/context/Contexts';
import type { SimpleVector } from '../src/data/scenarios/types';

function ctxFor(
  round: number,
  priorVectors = new Map<string, SimpleVector>(),
): SpawnContext {
  return {
    scenario: localTrouble,
    playerCount: 2,
    avgRebelInit: 2,
    playersRank: 2,
    upgradesSource: UPGRADES.FGA,
    round,
    priorVectors,
    settings: DEFAULT_SPAWN_SETTINGS,
  };
}

describe('spawnFromScenarioSquad', () => {
  it('groups resolved ships of the same type into one Squadron', () => {
    const alpha = localTrouble.squads.find((s) => s.name === 'Alpha');
    if (!alpha) throw new Error('test setup: Alpha squad not found');
    const out = spawnFromScenarioSquad(alpha, ctxFor(1));
    // At 2p, Alpha composition has TIELN at 1p and 2p — single group.
    expect(out).toHaveLength(1);
    expect(out[0].shipType).toBe('TIELN');
    expect(out[0].ships).toHaveLength(2);
    expect(out[0].scenarioMeta?.squadName).toBe('Alpha');
    expect(out[0].scenarioMeta?.arrivedAtRound).toBe(1);
    expect(out[0].scenarioMeta?.fromVector).toBe(3);
  });

  it('records a vector even for empty-resolved squads (oppositeOf reachability)', () => {
    const alpha = localTrouble.squads.find((s) => s.name === 'Alpha');
    if (!alpha) throw new Error('test setup: Alpha squad not found');
    // Use playerCount that doesn't trigger any cells — but Alpha at 1p has TIELN.
    // Build a fake squad with empty composition for an honest test:
    const empty = { ...alpha, name: 'Ghost', composition: {} };
    const priorVectors = new Map<string, SimpleVector>();
    const ctx: SpawnContext = { ...ctxFor(1, priorVectors) };
    const out = spawnFromScenarioSquad(empty, ctx);
    expect(out).toHaveLength(0);
    expect(priorVectors.has('Ghost')).toBe(true);
  });

  it('respects compositionOverride for dynamic-spawn handlers', () => {
    const gamma = localTrouble.squads.find((s) => s.name === 'Gamma');
    if (!gamma) throw new Error('test setup: Gamma squad not found');
    // Gamma normally adds TIE Interceptors. Override: 3 TIELNs.
    const override = opsForShipsOverride('TIELN', 3);
    const out = spawnFromScenarioSquad(gamma, ctxFor(4), override);
    expect(out).toHaveLength(1);
    expect(out[0].shipType).toBe('TIELN');
    expect(out[0].ships).toHaveLength(3);
  });
});

describe('priorVectorsFromSquadrons', () => {
  it('seeds the map from squadrons with scenario metadata', () => {
    const squadrons: readonly Squadron[] = [
      {
        id: 'a',
        shipType: 'TIELN',
        isElite: false,
        upgradesSource: UPGRADES.FGA,
        upgrades: [],
        ships: [],
        scenarioMeta: { squadName: 'Alpha', fromVector: 3, arrivedAtRound: 1 },
      },
      {
        id: 'b',
        shipType: 'TIELN',
        isElite: false,
        upgradesSource: UPGRADES.FGA,
        upgrades: [],
        ships: [],
        // No scenarioMeta — should be skipped.
      },
    ];
    const map = priorVectorsFromSquadrons(squadrons);
    expect(map.size).toBe(1);
    expect(map.get('Alpha')).toBe(3);
  });
});

describe('opsForShipsOverride', () => {
  it('produces N add ops for the same ship type', () => {
    const ops = opsForShipsOverride('TIEIN', 4);
    expect(ops).toHaveLength(4);
    expect(ops.every((o) => o.kind === 'add' && o.ship === 'TIEIN')).toBe(true);
  });

  it('returns empty for count 0', () => {
    expect(opsForShipsOverride('TIELN', 0)).toHaveLength(0);
  });
});
