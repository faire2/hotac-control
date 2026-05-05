/**
 * Squad-composition resolver.
 *
 * Given a scenario squad, a player count, and the rebel-init context,
 * produce the concrete list of ships that squad will field.
 *
 * Random / replace / elite ops are stubbed: they are not used by the
 * Local Trouble intro mission. They throw with a clear message so that
 * adding a later mission that uses them surfaces the gap immediately
 * instead of silently producing a wrong list.
 */

import type { ShipId } from '../Ships';
import type {
  PlayerCount,
  ScenarioSquad,
  SetupOp,
} from './types';

export interface ResolvedSquad {
  name: string;
  ships: readonly ShipId[];
  /** Random ops resolve to this concrete ShipId once rolled (squad-wide consistent). */
  randomShipType?: ShipId;
  /** Elites are tracked positionally — `eliteIndices[i]` true means `ships[i]` is an Elite. */
  eliteIndices: readonly number[];
}

export interface ResolveContext {
  playerCount: PlayerCount;
  avgRebelInit: number;
}

function gateAllows(op: SetupOp, ctx: ResolveContext): boolean {
  if (!op.gate) return true;
  return ctx.avgRebelInit >= op.gate.rebelInitGte;
}

export function resolveSquad(
  squad: ScenarioSquad,
  ctx: ResolveContext,
): ResolvedSquad {
  const ships: ShipId[] = [];
  const elites: number[] = [];

  for (let pc = 1; pc <= ctx.playerCount; pc++) {
    const ops = squad.composition[pc as PlayerCount] ?? [];
    for (const op of ops) {
      if (!gateAllows(op, ctx)) continue;
      switch (op.kind) {
        case 'add':
          ships.push(op.ship);
          break;
        case 'replace':
          for (let i = 0; i < ships.length; i++) ships[i] = op.ship;
          break;
        case 'addRandom':
        case 'replaceRandom':
        case 'addElite':
          throw new Error(
            `Squad "${squad.name}": op kind "${op.kind}" is not yet supported by the resolver. ` +
              `Add support when authoring a scenario that uses it.`,
          );
      }
    }
  }

  return { name: squad.name, ships, eliteIndices: elites };
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
