/**
 * Action bars for rebel-ally ships.
 *
 * Allies are player-piloted, so unlike AI ships their squad card shows the
 * ship's printed action bar (Focus / Lock / Boost / …) rather than the AI
 * decision carousel. Each ally ship-type lists its actions here; missions
 * strip individual actions via `AllySetup.removeActions` (e.g. the damaged
 * HWK-290 in "Rescue Rebel Operatives" loses Boost).
 *
 * `id` is the stable key `removeActions` targets — author it once and never
 * change it (scenario data references it). Icons reuse the `:icon-name:`
 * registry keys in icons.ts; the validator asserts each one resolves.
 */

import type { ShipId } from './Ships';
import type { IconKey } from './icons';

/** Stable per-action id; the value missions pass to `removeActions`. */
export type AllyActionId =
  | 'focus'
  | 'lock'
  | 'boost'
  | 'rotate'
  | 'jam'
  | 'reinforce'
  | 'coordinate';

export interface AllyAction {
  /** Stable id `removeActions` targets. Unique within a ship's bar. */
  id: AllyActionId;
  /** Primary action icon (IconKey from icons.ts). */
  icon: IconKey;
  /** Display label. */
  label: string;
  /** Linked follow-up action ("Focus ► Rotate" on the HWK-290 bar). */
  linked?: { icon: IconKey; label: string };
}

const ROTATE_LINK = Object.freeze({ icon: 'rotate', label: 'Rotate' } as const);

// HWK-290 Rebel Operative: Focus ► Rotate, Lock ► Rotate, Boost, Rotate, Jam.
const hwk290: readonly AllyAction[] = [
  { id: 'focus', icon: 'focus', label: 'Focus', linked: ROTATE_LINK },
  { id: 'lock', icon: 'lock', label: 'Lock', linked: ROTATE_LINK },
  { id: 'boost', icon: 'boost', label: 'Boost' },
  { id: 'rotate', icon: 'rotate', label: 'Rotate' },
  { id: 'jam', icon: 'jam', label: 'Jam' },
];

// Outer Rim Smuggler (Modified YT-1300): Focus, Lock, Boost, Rotate.
const outerRimSmuggler: readonly AllyAction[] = [
  { id: 'focus', icon: 'focus', label: 'Focus' },
  { id: 'lock', icon: 'lock', label: 'Lock' },
  { id: 'boost', icon: 'boost', label: 'Boost' },
  { id: 'rotate', icon: 'rotate', label: 'Rotate' },
];

// GR-75 Transport: Focus, Reinforce, Lock, Coordinate, Jam.
const gr75: readonly AllyAction[] = [
  { id: 'focus', icon: 'focus', label: 'Focus' },
  { id: 'reinforce', icon: 'reinforce', label: 'Reinforce' },
  { id: 'lock', icon: 'lock', label: 'Lock' },
  { id: 'coordinate', icon: 'coordinate', label: 'Coordinate' },
  { id: 'jam', icon: 'jam', label: 'Jam' },
];

export const ALLY_ACTIONS: Readonly<Partial<Record<ShipId, readonly AllyAction[]>>> =
  Object.freeze({
    HWK290: hwk290,
    OUTER_RIM_SMUGGLER: outerRimSmuggler,
    GR75: gr75,
  });

/**
 * Resolve an ally's action bar: the ship-type's printed bar minus any actions
 * the mission strips. Returns a new array; the registry stays frozen.
 */
export function resolveAllyActions(
  shipType: ShipId,
  remove: readonly AllyActionId[] = [],
): readonly AllyAction[] {
  const bar = ALLY_ACTIONS[shipType] ?? [];
  if (remove.length === 0) return bar;
  const removed = new Set(remove);
  return bar.filter((action) => !removed.has(action.id));
}
