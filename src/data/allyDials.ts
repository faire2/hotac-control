/**
 * Maneuver dials for ally ships.
 *
 * Allies aren't AI-driven (players plan their dial each round per the
 * Slicer Techs rule in defection1), so they have no entry in
 * `fgaManeuvers` / `andersonManeuvers`. We still want the squad card to
 * show the player what the ship's dial physically allows — this map
 * provides that per-ship list.
 *
 * Convention: only the centre + right-hand maneuvers are listed. The
 * dial renderer mirrors them visually (or, per current spec, just notes
 * that the left side mirrors the right) so we don't duplicate data.
 */

import type { ShipId } from './Ships';

export type DialDifficulty = 'white' | 'red' | 'blue';
export type DialDirection =
  | 'straight'
  | 'bank'
  | 'turn'
  | 'kturn'
  | 'sloop'
  | 'troll'
  | 'stop'
  | 'reverseStraight'
  | 'reverseBank';

export interface DialEntry {
  speed: number;
  direction: DialDirection;
  difficulty: DialDifficulty;
}

// HWK-290 dial (HotAC variant):
//   0: stationary (red)
//   1: straight blue, bank blue
//   2: straight blue, bank white, turn white
//   3: straight blue, bank white, turn red
//   4: straight white
const hwk290: readonly DialEntry[] = [
  { speed: 0, direction: 'stop', difficulty: 'red' },
  { speed: 1, direction: 'straight', difficulty: 'blue' },
  { speed: 1, direction: 'bank', difficulty: 'blue' },
  { speed: 2, direction: 'straight', difficulty: 'blue' },
  { speed: 2, direction: 'bank', difficulty: 'white' },
  { speed: 2, direction: 'turn', difficulty: 'white' },
  { speed: 3, direction: 'straight', difficulty: 'blue' },
  { speed: 3, direction: 'bank', difficulty: 'white' },
  { speed: 3, direction: 'turn', difficulty: 'red' },
  { speed: 4, direction: 'straight', difficulty: 'white' },
];

export const ALLY_DIALS: Readonly<Partial<Record<ShipId, readonly DialEntry[]>>> =
  Object.freeze({
    HWK290: hwk290,
  });
