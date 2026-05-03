/**
 * FGA "Select Action" priority lists per ship.
 * Plain-string priorities with `:icon-name:` shortcodes.
 */

import type { ShipId } from '../Ships';

const TIELN: readonly string[] = [
  'Resolve :crit:.',
  ":barrelroll: to avoid target's arc and still get a shot.",
  ':barrelroll: to get a shot.',
  ':focus: if you have a shot.',
  ":barrelroll: to avoid target's arc.",
  ':evade:.',
];

const TIEIN: readonly string[] = [
  'Resolve :crit:.',
  ":focus: :linked: :red-barrelroll: / :red-boost: to avoid target's arc and still get a shot.",
  ':boost: :linked: :red-barrelroll: or :barrelroll: :linked: :red-boost: to get a shot.',
  ':focus: if you have a shot.',
  ":boost: :linked: :red-barrelroll: or :barrelroll: :linked: :red-boost: to avoid target's arc.",
  ':evade:.',
];

const TIESA: readonly string[] = [
  'Resolve :crit:.',
  ':red-reload: if no charges on equipped :missile: or :torpedo:.',
  ":barrelroll: (:linked: :red-lock:) to avoid target's arc and still get a shot.",
  ':barrelroll: (:linked: :red-lock:) to get a shot.',
  ':lock:.',
  ":barrelroll: to avoid target's arc.",
  ':focus:.',
];

const VT49: readonly string[] = [
  'Resolve :crit:.',
  'If target is in no arc, :rotate: to get a shot.',
  'If target has not yet moved and ship is not in an enemy arc, :lock:.',
  'If target has already moved, :lock:.',
  ':reinforce: (prio: :full-front-arc:, :full-rear-arc:) if within arc of 2 or more enemies in that full arc.',
  ':focus:.',
];

const TIEADVX: readonly string[] = [
  'Resolve :crit:.',
  "If target has not moved yet, :lock: target if not in any enemy's arc.",
  'If target has already moved, :lock: target.',
  "If target has already moved, :focus: :linked: :red-barrelroll: to avoid target's arc and still get a shot.",
  'If target has already moved, :focus: :linked: :red-barrelroll: to get a shot.',
  ":barrelroll: to avoid target's arc.",
  ':focus:.',
];

const TIEDEF: readonly string[] = [
  'Resolve :crit:.',
  'If target has already moved, :lock: target.',
  'If target has already moved, :barrelroll: or :boost: to get a shot.',
  'If target has already moved, :barrelroll: or :boost: to get in range 1 and still get a shot.',
  ":barrelroll: or :boost: to avoid target's arc.",
  ':evade: if ship is not already evading.',
  ':focus:.',
];

const TIEPH: readonly string[] = [
  'Resolve :crit:.',
  ":cloak: if you don't have a shot.",
  ':evade: if ship is not already evading.',
  ":red-barrelroll: to avoid target's arc and still get a shot.",
  ':focus: if you have a shot.',
];

const LAMBDA: readonly string[] = [
  'Resolve :crit:.',
  ':focus: if you have a shot.',
  ':reinforce: (prio: :full-front-arc:, :full-rear-arc:) if within arc of 2 or more enemies in that full arc.',
  ':coordinate: nearest friendly ship.',
  ':red-jam: target.',
  ':focus:.',
];

export const fgaShipActionsByShip: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
  TIELN, TIEIN, TIESA, VT49, TIEADVX, TIEDEF, TIEPH, LAMBDA,
});
