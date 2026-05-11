/**
 * Spawn pipeline — turns a `ScenarioSquad` into one or more `Squadron`s.
 *
 * Pure data-layer code: no React. Consumers (currently `App.tsx`'s
 * `performRoundAdvance`) supply the runtime context (player count, settings,
 * priorVectors map) and receive a `Squadron[]`.
 *
 * Two paths:
 *   - **default** — group resolved ships by ship type into one Squadron each.
 *   - **per-ship split** — when the squad has `uniqueApproach` or
 *     `huntsPlayer` tag, emit one Squadron per ship with its own approach
 *     vector and (optionally) assigned player.
 *
 * Dynamic-spawn handlers can pass a `compositionOverride` (already shaped as
 * SetupOp[]) instead of running the squad's normal composition. The result
 * goes through the same Squadron stamping path — no separate code branch.
 */

import { Ships } from '../Ships';
import type { ShipId, UpgradeSource } from '../Ships';
import { countExtraHullAndShield } from '../shared/coreUpgrades';
import type { UpgradeRow } from '../UpgradeRow';
import getUpgrades from '../upgrades/getUpgrades';
import type { Squadron, ShipInstance } from '../../context/Contexts';
import type { SpawnSettings } from '../campaigns/settings';
import { resolveSquad, resolveSquadVector } from './resolve';
import { hasTag } from './types';
import type {
  PlayerCount,
  Scenario,
  ScenarioSquad,
  SetupOp,
  SimpleVector,
} from './types';

export interface SpawnContext {
  scenario: Scenario;
  playerCount: PlayerCount;
  /** Equal to `playersRank` today; kept separate so the avg-rebel-init dial
   * for gates and the cosmetic "rank" can diverge later if needed. */
  avgRebelInit: number;
  playersRank: number;
  upgradesSource: UpgradeSource;
  round: number;
  /** Mutable map of squad-name → resolved vector, threaded across spawn
   * calls within a single round so `oppositeOf` can look back. */
  priorVectors: Map<string, SimpleVector>;
  settings: SpawnSettings;
}

/**
 * Spawn squadrons for one scenario squad.
 *
 * The optional `compositionOverride` replaces the squad's per-player-count
 * cells with a single ops list — used by dynamic-spawn handlers.
 */
export function spawnFromScenarioSquad(
  squad: ScenarioSquad,
  ctx: SpawnContext,
  compositionOverride?: readonly SetupOp[],
): Squadron[] {
  const resolved = resolveSquad(squad, {
    playerCount: ctx.playerCount,
    avgRebelInit: ctx.avgRebelInit,
    randomPoolExclusions: ctx.scenario.randomPoolExclusions,
    lessRandomShips: ctx.settings.lessRandomShips,
    introducedShipTypes: ctx.settings.introducedShipTypes,
    compositionOverride,
  });
  if (resolved.ships.length === 0) {
    // Still record a squad-level vector for any future oppositeOf reference.
    if (!ctx.priorVectors.has(squad.name)) {
      ctx.priorVectors.set(squad.name, resolveSquadVector(squad.vector, ctx.priorVectors));
    }
    return [];
  }

  const skipUpgrades = hasTag(squad, 'noUpgrades') !== undefined;
  const wantUniqueApproach = hasTag(squad, 'uniqueApproach') !== undefined;
  const wantHuntsPlayer = hasTag(squad, 'huntsPlayer') !== undefined;
  const splitPerShip = wantUniqueApproach || wantHuntsPlayer;

  function upgradesFor(shipType: ShipId): readonly UpgradeRow[] {
    return skipUpgrades
      ? []
      : getUpgrades(shipType, ctx.playersRank, ctx.upgradesSource, false);
  }
  function shipInstance(
    shipType: ShipId,
    upgrades: readonly UpgradeRow[],
    bonusShield: number,
  ): ShipInstance {
    const extras = countExtraHullAndShield(upgrades.map((r) => r.upgrade));
    const baseStats = Ships[shipType];
    return {
      tokenId: 0,
      hull: baseStats.hull + extras.extraHull,
      shields: baseStats.shields + extras.extraShield + bonusShield,
    };
  }

  const eliteSet = new Set(resolved.eliteIndices);

  if (splitPerShip) {
    if (wantHuntsPlayer && resolved.ships.length > ctx.playerCount) {
      throw new Error(
        `Squad "${squad.name}": huntsPlayer with ${resolved.ships.length.toString()} ships exceeds playerCount ${ctx.playerCount.toString()}.`,
      );
    }
    const playerIndices = wantHuntsPlayer ? shufflePlayerIndices(ctx.playerCount) : [];
    const usedVectors = new Set<SimpleVector>();
    const squadrons = resolved.ships.map((shipType, i) => {
      const fromVector = wantUniqueApproach
        ? rollUniqueVector(squad, ctx.priorVectors, usedVectors)
        : resolveSquadVector(squad.vector, ctx.priorVectors);
      usedVectors.add(fromVector);
      const upgrades = upgradesFor(shipType);
      const squadron: Squadron = {
        id: crypto.randomUUID(),
        shipType,
        isElite: eliteSet.has(i),
        upgradesSource: ctx.upgradesSource,
        upgrades,
        scenarioMeta: {
          squadName: squad.name,
          fromVector,
          approachLabel: squad.approachLabel,
          arrivedAtRound: ctx.round,
          ...(wantHuntsPlayer ? { huntsPlayerIndex: playerIndices[i] } : {}),
        },
        ships: [shipInstance(shipType, upgrades, resolved.bonusShields[i])],
      };
      return squadron;
    });
    if (squadrons.length > 0 && squadrons[0].scenarioMeta) {
      ctx.priorVectors.set(squad.name, squadrons[0].scenarioMeta.fromVector);
    }
    return squadrons;
  }

  // Default path: group resolved ships by (shipType, isElite) into one Squadron each.
  const fromVector = resolveSquadVector(squad.vector, ctx.priorVectors);
  ctx.priorVectors.set(squad.name, fromVector);
  const groups = new Map<
    string,
    { shipType: ShipId; isElite: boolean; count: number; bonusShield: number }
  >();
  for (let i = 0; i < resolved.ships.length; i++) {
    const shipType = resolved.ships[i];
    const isElite = eliteSet.has(i);
    const key = `${shipType}|${isElite ? '1' : '0'}`;
    const g = groups.get(key);
    if (g) {
      g.count += 1;
      g.bonusShield = Math.max(g.bonusShield, resolved.bonusShields[i]);
    } else {
      groups.set(key, { shipType, isElite, count: 1, bonusShield: resolved.bonusShields[i] });
    }
  }
  return Array.from(groups.values()).map(({ shipType, isElite, count, bonusShield }) => {
    const upgrades = upgradesFor(shipType);
    return {
      id: crypto.randomUUID(),
      shipType,
      isElite,
      upgradesSource: ctx.upgradesSource,
      upgrades,
      scenarioMeta: {
        squadName: squad.name,
        fromVector,
        approachLabel: squad.approachLabel,
        arrivedAtRound: ctx.round,
      },
      ships: Array.from({ length: count }, () => shipInstance(shipType, upgrades, bonusShield)),
    } satisfies Squadron;
  });
}

/**
 * Convert a dynamic-spawn handler's `{ ship, count }` override into the
 * `SetupOp[]` shape consumed by `spawnFromScenarioSquad`'s
 * `compositionOverride`. One `add` op per ship.
 */
export function opsForShipsOverride(ship: ShipId, count: number): readonly SetupOp[] {
  return Array.from({ length: count }, () => ({ kind: 'add', ship }) as const);
}

/** Fisher-Yates shuffle of `[1..playerCount]`. Used by `huntsPlayer`. */
export function shufflePlayerIndices(playerCount: number): number[] {
  const indices = Array.from({ length: playerCount }, (_, i) => i + 1);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

/**
 * Roll the squad's vector until it differs from any already-used value
 * in `used`. Throws after 200 attempts (defensive against pool exhaustion).
 */
export function rollUniqueVector(
  squad: ScenarioSquad,
  priorVectors: Map<string, SimpleVector>,
  used: Set<SimpleVector>,
): SimpleVector {
  for (let attempt = 0; attempt < 200; attempt++) {
    const v = resolveSquadVector(squad.vector, priorVectors);
    if (!used.has(v)) return v;
  }
  throw new Error(
    `Squad "${squad.name}": could not roll a unique approach after 200 attempts (pool exhausted).`,
  );
}

/** Reseed `priorVectors` from already-spawned squadrons before a new round
 * so cross-round `oppositeOf` references resolve. */
export function priorVectorsFromSquadrons(
  squadrons: readonly Squadron[],
): Map<string, SimpleVector> {
  const out = new Map<string, SimpleVector>();
  for (const sq of squadrons) {
    if (sq.scenarioMeta) {
      out.set(sq.scenarioMeta.squadName, sq.scenarioMeta.fromVector);
    }
  }
  return out;
}
