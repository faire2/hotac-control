/**
 * Dynamic-spawn handler registry.
 *
 * Squads tagged `{ kind: 'dynamicSpawn', handler: '<key>' }` defer their
 * arrival to a runtime decision the player resolves at end-of-round. This
 * registry maps each handler key to:
 *
 *   - `title`    — section heading rendered in the popup
 *   - `prompts`  — input fields the player fills in (typed)
 *   - `decide`   — pure function: input → spawn outcome
 *   - `recurring`— if true, the handler re-runs every round; otherwise the
 *                  popup hides it after a successful spawn (one-shot)
 *
 * Concrete handlers are registered below. New ones go in the same map.
 */

import type { ShipId } from '../Ships';

export type PromptValue = boolean | number | string;

export type DynamicSpawnPrompt =
  | { id: string; kind: 'confirm'; label: string; defaultValue?: boolean }
  | { id: string; kind: 'count'; label: string; min: number; max: number; defaultValue?: number };

export interface DynamicSpawnDecision {
  /** True if the squad should spawn this round. */
  spawn: boolean;
  /**
   * Optional override for the count of base ships to emit (used by
   * sensorCheckPatrol — N TIE Interceptors per critical hit, max 4).
   * When provided, the spawn pipeline emits exactly this many ships of the
   * specified type instead of evaluating the squad's composition.
   */
  shipsOverride?: { ship: ShipId; count: number };
}

export interface DynamicSpawnHandler {
  key: string;
  title: string;
  prompts: readonly DynamicSpawnPrompt[];
  recurring: boolean;
  decide(input: Readonly<Record<string, PromptValue>>): DynamicSpawnDecision;
}

const sensorCheckPatrol: DynamicSpawnHandler = {
  key: 'sensorCheckPatrol',
  title: 'Sensor check (Disable Sensor Net)',
  recurring: true,
  prompts: [
    {
      id: 'criticals',
      kind: 'count',
      label: 'Critical hits scored on the sensor check this round',
      min: 0,
      max: 8,
      defaultValue: 0,
    },
  ],
  decide(input) {
    const raw = input.criticals;
    const crits = typeof raw === 'number' ? raw : 0;
    if (crits <= 0) return { spawn: false };
    const count = Math.min(crits, 4);
    return {
      spawn: true,
      shipsOverride: { ship: 'TIEIN', count },
    };
  },
};

const inspectionSquadOnIdentify: DynamicSpawnHandler = {
  key: 'inspectionSquadOnIdentify',
  title: 'Holonet channel identification (Secure the Holonet)',
  recurring: false,
  prompts: [
    {
      id: 'identified',
      kind: 'confirm',
      label: "Was the spy's channel identified this round?",
      defaultValue: false,
    },
  ],
  decide(input) {
    return { spawn: input.identified === true };
  },
};

const escapePodPlaced: DynamicSpawnHandler = {
  key: 'escapePodPlaced',
  title: 'Escape Pod revealed (Needle in a Hay Stack)',
  recurring: false,
  prompts: [
    {
      id: 'placed',
      kind: 'confirm',
      label: 'Was the Escape Pod token (signal 12) placed this round?',
      defaultValue: false,
    },
  ],
  decide(input) {
    return { spawn: input.placed === true };
  },
};

const dockingPortRevealed: DynamicSpawnHandler = {
  key: 'dockingPortRevealed',
  title: 'Docking Port revealed (Cloak and Dagger)',
  recurring: true,
  prompts: [
    {
      id: 'revealed',
      kind: 'confirm',
      label:
        'Did you reveal a Docking Port this round? (signal 1/2/3 at 4/5/6 players respectively — adds 1 TIE Phantom)',
      defaultValue: false,
    },
  ],
  decide(input) {
    return { spawn: input.revealed === true };
  },
};

export const DYNAMIC_SPAWN_HANDLERS: Readonly<Record<string, DynamicSpawnHandler>> =
  Object.freeze({
    sensorCheckPatrol,
    inspectionSquadOnIdentify,
    escapePodPlaced,
    dockingPortRevealed,
  });

export function findHandler(key: string): DynamicSpawnHandler | undefined {
  return DYNAMIC_SPAWN_HANDLERS[key];
}
