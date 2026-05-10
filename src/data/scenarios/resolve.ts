/**
 * Squad-composition resolver.
 *
 * Given a scenario squad, a player count, and the rebel-init context,
 * produce the concrete list of ships that squad will field.
 *
 * Op semantics (see types.ts for the full legend):
 *   - add              push a specific ship type
 *   - addRandom        push the squad's random type (resolved on first use)
 *   - replace          upgrade the most recent ship to a specific type
 *   - replaceRandom    upgrade the most recent ship to the squad's random type
 *   - addElite         push the squad's random type, marked as Elite
 *   - addShields       add N shields to the most recent ship
 *
 * "Squad-consistent random" — the first random/elite op in a squad picks
 * one ship type from the random pool; every subsequent random op in that
 * same squad reuses that same type. The pick is driven by
 * `ResolveContext.randomShipRoll` (a 1-based index into the pool); when
 * absent, defaults to `pool[0]` for deterministic resolution in tests +
 * the dev path before the dice UI is wired up.
 */

import type { ShipId } from '../Ships';
import type {
  PlayerCount,
  ScenarioSquad,
  SetupOp,
  SimpleVector,
  Vector,
} from './types';
import { DEFAULT_RANDOM_SHIP_POOL, rollD20RandomShip } from './randomShipPool';

/**
 * Opposite-vector pairs for the 1-12 fine-grained approach ring.
 * Used to resolve `{ kind: 'oppositeOf' }` vectors (e.g. Bait's Support B
 * spawns opposite Support A).
 */
export const OPPOSITE_VECTOR: Readonly<Partial<Record<number, number>>> = Object.freeze({
  1: 7, 7: 1,
  2: 9, 9: 2,
  3: 8, 8: 3,
  4: 10, 10: 4,
  5: 12, 12: 5,
  6: 11, 11: 6,
});

/**
 * Resolve a possibly-random vector to a concrete edge/letter.
 *
 * - `roll` is the dice result for a dice vector (1d6/1d12/1d6+6); if absent,
 *   a uniformly random integer is generated.
 * - Tuples pick one option; `roll` (1-based) selects, or random if absent.
 * - `{ kind: 'oppositeOf' }` is NOT handled here — it requires sibling-squad
 *   context. Use `resolveSquadVector` from the spawn pipeline for that.
 */
export function resolveVector(vector: Vector, roll?: number): SimpleVector {
  if (typeof vector === 'object' && !Array.isArray(vector)) {
    throw new Error(
      `resolveVector: oppositeOf vector requires sibling context — use resolveSquadVector instead.`,
    );
  }

  let picked: SimpleVector;
  if (Array.isArray(vector)) {
    const opts = vector as readonly SimpleVector[];
    if (opts.length === 0) {
      throw new Error('resolveVector: empty vector tuple');
    }
    const idx = roll !== undefined
      ? Math.min(Math.max(roll, 1), opts.length) - 1
      : Math.floor(Math.random() * opts.length);
    picked = opts[idx];
  } else {
    picked = vector;
  }
  if (picked === '1d6') {
    const r = roll ?? (Math.floor(Math.random() * 6) + 1);
    return Math.min(Math.max(r, 1), 6);
  }
  if (picked === '1d12') {
    const r = roll ?? (Math.floor(Math.random() * 12) + 1);
    return Math.min(Math.max(r, 1), 12);
  }
  if (picked === '1d6+6') {
    const r = roll ?? (Math.floor(Math.random() * 6) + 1);
    return Math.min(Math.max(r, 1), 6) + 6;
  }
  return picked;
}

/**
 * Resolve a squad's vector with access to previously-resolved sibling
 * vectors (for `oppositeOf` references).
 */
export function resolveSquadVector(
  vector: Vector,
  priorVectors: ReadonlyMap<string, SimpleVector>,
  roll?: number,
): SimpleVector {
  if (typeof vector === 'object' && !Array.isArray(vector) && 'kind' in vector) {
    const ref = priorVectors.get(vector.squadName);
    if (ref === undefined) {
      throw new Error(
        `resolveSquadVector: oppositeOf "${vector.squadName}" — referenced squad has not been resolved yet.`,
      );
    }
    if (typeof ref !== 'number') {
      throw new Error(
        `resolveSquadVector: oppositeOf "${vector.squadName}" — referenced squad's vector "${ref}" is not numeric and has no opposite.`,
      );
    }
    const opp = OPPOSITE_VECTOR[ref];
    if (opp === undefined) {
      throw new Error(
        `resolveSquadVector: no opposite defined for vector ${ref.toString()}`,
      );
    }
    return opp;
  }
  return resolveVector(vector, roll);
}

export interface ResolvedSquad {
  name: string;
  ships: readonly ShipId[];
  /** Per-ship shield bonus (parallel to `ships`). */
  bonusShields: readonly number[];
  /** Random ops resolve to this concrete ShipId once rolled (squad-wide consistent). */
  randomShipType?: ShipId;
  /** Indices into `ships` for which the ship is an Elite. */
  eliteIndices: readonly number[];
}

export interface ResolveContext {
  playerCount: PlayerCount;
  avgRebelInit: number;
  /**
   * Optional per-resolve random pool override (e.g. campaign-config-driven).
   * Defaults to DEFAULT_RANDOM_SHIP_POOL.
   */
  randomShipPool?: readonly ShipId[];
  /**
   * Ship types to exclude from the random pool (per-mission constraints,
   * e.g. Bait disallows LAMBDA + TIEPH from the pool).
   */
  randomPoolExclusions?: readonly ShipId[];
  /**
   * 1-based index into the random pool for this squad's random pick.
   * If absent, defaults to pool[0].
   */
  randomShipRoll?: number;
  /**
   * If true, resolve random picks via the 1d20 weighted table
   * (`rollD20RandomShip`) instead of the uniform pool.
   */
  lessRandomShips?: boolean;
  /**
   * Ship types unlocked by prior mission play. Consumed by the d20 table
   * to substitute fallbacks for not-yet-introduced exotics (TIEPH, TIEDEF).
   */
  introducedShipTypes?: readonly ShipId[];
  /**
   * If set, replace the squad's `composition[1..playerCount]` walk with
   * this single ops list. Used by dynamic-spawn handlers to inject ships
   * that aren't declared in the scenario data (e.g. sensor-check Patrol's
   * "N TIE Interceptors per crit"). The override goes through the same
   * resolver so all the squad-consistent random / addShields / addElite
   * machinery still applies.
   */
  compositionOverride?: readonly SetupOp[];
}

function gateAllows(op: SetupOp, ctx: ResolveContext): boolean {
  if (!op.gate) return true;
  return ctx.avgRebelInit >= op.gate.rebelInitGte;
}

function pickRandomFromPool(ctx: ResolveContext): ShipId {
  const basePool = ctx.randomShipPool ?? DEFAULT_RANDOM_SHIP_POOL;
  const exclusions = ctx.randomPoolExclusions;
  const pool = exclusions && exclusions.length > 0
    ? basePool.filter((s) => !exclusions.includes(s))
    : basePool;
  if (pool.length === 0) {
    throw new Error(
      'randomShipPool is empty after exclusions — cannot resolve a random ship op.',
    );
  }
  if (ctx.lessRandomShips) {
    return rollD20RandomShip(ctx.introducedShipTypes ?? [], pool);
  }
  const oneBased = ctx.randomShipRoll ?? 1;
  const idx = Math.min(Math.max(oneBased, 1), pool.length) - 1;
  return pool[idx];
}

export function resolveSquad(
  squad: ScenarioSquad,
  ctx: ResolveContext,
): ResolvedSquad {
  const ships: ShipId[] = [];
  const bonusShields: number[] = [];
  const elites: number[] = [];
  let randomShipType: ShipId | undefined;

  function ensureRandom(): ShipId {
    randomShipType ??= pickRandomFromPool(ctx);
    return randomShipType;
  }

  function lastIndexOrThrow(opKind: SetupOp['kind']): number {
    if (ships.length === 0) {
      throw new Error(
        `Squad "${squad.name}": op "${opKind}" has no preceding ship to apply to.`,
      );
    }
    return ships.length - 1;
  }

  function applyOps(ops: readonly SetupOp[]): void {
    for (const op of ops) {
      if (!gateAllows(op, ctx)) continue;
      switch (op.kind) {
        case 'add':
          ships.push(op.ship);
          bonusShields.push(0);
          break;
        case 'addRandom': {
          ships.push(ensureRandom());
          bonusShields.push(0);
          break;
        }
        case 'replace': {
          const i = lastIndexOrThrow('replace');
          ships[i] = op.ship;
          break;
        }
        case 'replaceRandom': {
          const i = lastIndexOrThrow('replaceRandom');
          ships[i] = ensureRandom();
          break;
        }
        case 'addElite': {
          ships.push(op.ship ?? ensureRandom());
          bonusShields.push(0);
          elites.push(ships.length - 1);
          break;
        }
        case 'addShields': {
          const i = lastIndexOrThrow('addShields');
          bonusShields[i] += op.count;
          break;
        }
        default: {
          const _exhaustive: never = op;
          void _exhaustive;
        }
      }
    }
  }

  if (ctx.compositionOverride) {
    applyOps(ctx.compositionOverride);
  } else {
    for (let pc = 1; pc <= ctx.playerCount; pc++) {
      applyOps(squad.composition[pc as PlayerCount] ?? []);
    }
  }

  return {
    name: squad.name,
    ships,
    bonusShields,
    randomShipType,
    eliteIndices: elites,
  };
}

export function summarizeSquad(squad: ScenarioSquad, ctx: ResolveContext): string {
  const resolved = resolveSquad(squad, ctx);
  if (resolved.ships.length === 0) return '—';
  const counts = new Map<ShipId, number>();
  for (const s of resolved.ships) counts.set(s, (counts.get(s) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([id, n]) => (n > 1 ? `${n.toString()}× ${id}` : id))
    .join(', ');
}
