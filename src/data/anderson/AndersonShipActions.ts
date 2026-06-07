import type { ShipId } from '../Ships';

/**
 * Anderson "Select Action" priority lists per ship.
 * Plain-string priorities with `:icon-name:` shortcodes.
 */

const TIELN: readonly string[] = [
  'Resolve :crit:.',
  ":barrelroll: to avoid target's arc and still get a shot.",
  ':barrelroll: to get a shot.',
  ':focus: if you have a shot.',
  ":barrelroll: to avoid target's arc.",
  ':evade:.',
];

// TIE/D Defender — base card, shipcards p-06. Rows 2 + 6 are :lock:
// (verified vs. FGA, which puts a lock-target step at row 2 and FGA
// has no row-6 equivalent; user-confirmed the Anderson card text).
const TIEDEF: readonly string[] = [
  'Resolve :crit:.',
  "(only if Target has already moved) :lock: if not in Enemy's arc OR evading.",
  "(only if Target has already moved) :barrelroll: or :boost: to get a shot, prioritising range 1 if possible.",
  ":barrelroll: or :boost: to avoid Target's arc and still get a shot.",
  ':evade: if ship is not already evading.',
  ":lock: if not in any Enemy's arcs.",
  ':focus:.',
];

// TIE Interceptor — shipcards p-02. Mirrors FGA TIEIN structure
// (focus-linked-to-red-action chains for offensive prep) with two
// additional rows under the "Target has not yet moved" prereq.
const TIEIN: readonly string[] = [
  'Resolve :crit:.',
  "(only if Target has already moved) :focus: :linked: :red-barrelroll: or :focus: :linked: :red-boost: to avoid Target's arc and still get a shot at any enemy.",
  '(only if Target has already moved) :boost: :linked: :red-barrelroll: or :barrelroll: :linked: :red-boost: to avoid all enemy arcs.',
  '(only if Target has already moved) :focus: if you have a shot.',
  '(only if Target has already moved) :evade:.',
  '(only if Target has not yet moved) :focus: :linked: :red-barrelroll: or :focus: :linked: :red-boost: to get a shot.',
  '(only if Target has not yet moved) :focus:.',
];

// Lambda-class T-4a Shuttle — shipcards p-08. The shuttle's action
// list reflects its support role: rotate arc to face multiple threats,
// coordinate friendlies, jam Target, with focus fallbacks.
const LAMBDA: readonly string[] = [
  'Resolve :crit:.',
  ':focus: if you have a shot.',
  ':rotate: (prio: :front-arc:, :rear-arc:) if within arc of 2 or more Enemies in that full arc.',
  ':coordinate: nearest friendly ship.',
  ':jam: against Target.',
  ':focus:.',
];

// TIE Advanced x1 — shipcards p-04. Cross-referenced with FGA TIEADVX
// (7 actions, same structural shape). Anderson swaps FGA's row 2/3
// :lock: target steps for an :evade:-driven opener: rows 2 + 3 use
// :evade: with red-vs-green prereqs, then the rest matches FGA's
// :focus: :linked: :red-barrelroll: + :barrelroll:-to-avoid-arc ladder.
const TIEADVX: readonly string[] = [
  'Resolve :crit:.',
  "(only if Target has not yet moved) :evade: if not in Target's arcs.",
  '(only if Target has already moved) :evade:.',
  "(only if Target has already moved) :focus: :linked: :red-barrelroll: to avoid Target's arc and still get a shot.",
  '(only if Target has already moved) :focus: :linked: :red-barrelroll: to get a shot.',
  "(only if Target has already moved) :barrelroll: to avoid Target's arc.",
  ':focus:.',
];

// TIE/sa Bomber — shipcards p-03. Cross-referenced with FGA TIESA.
// The card has 3 prerequisite markers in the legend:
//   red-circle    = only if Target has not yet moved
//   green-circle  = only if Target has already moved
//   red-lightning = only if all :focus: / :charge: are spent
//
// TODO(verify): rows 5, 6, 7 — read as defensive barrel-roll/reload
// chain under different prereqs but the icon detail is tight. Row 5
// is best-read as the "reload when depleted" step from FGA's row 2
// shifted into a prereq form; rows 6 + 7 are the bare-arc-avoidance
// fallbacks (one unconditional, one Target-not-moved).
const TIESA: readonly string[] = [
  'Resolve :crit:.',
  "(only if Target has already moved) :barrelroll: :linked: :red-lock: to avoid Target's arc and still get a shot.",
  '(only if Target has already moved) :barrelroll: :linked: :red-lock: to get a shot.',
  '(only if Target has already moved) :evade: if you have a shot.',
  '(only if all :focus: / :charge: are spent) :red-reload: if no charges on equipped :missile: or :torpedo:.',
  ":barrelroll: to avoid Target's arc.",
  "(only if Target has not yet moved) :barrelroll: to avoid Target's arc.",
  ':focus:.',
];

// TIE/ph Phantom — shipcards p-05. Matches FGA TIEPH (5 actions) with
// row 5's `:focus: if you have a shot` shortened to a bare `:focus:` on
// the Anderson card. The Phantom's System Phase decloak roll + End Phase
// "spend evade to gain cloak" mechanics are display-only (handled by the
// player) and aren't part of this action priority list.
const TIEPH: readonly string[] = [
  'Resolve :crit:.',
  ":cloak: if you don't have a shot.",
  ':evade: if the ship is not already evading.',
  ":red-barrelroll: to avoid Target's arc and still get a shot.",
  ':focus:.',
];

// VT-49 Decimator — shipcards p-09. Differs from FGA VT49 in the
// arc-management actions: Anderson uses :rotate: (front-rear arc swap)
// at rows 2 + 5 instead of FGA's :lock: / :reinforce: ladder, and uses
// :evade: with red/green prereqs instead of FGA's lock progression.
const VT49: readonly string[] = [
  'Resolve :crit:.',
  ':rotate: to get a shot if Target is not in your :rear-arc:.',
  '(only if Target has not yet moved) :evade: if not in Enemies arcs.',
  '(only if Target has already moved) :evade:.',
  ':rotate: (prio: :front-arc:, :rear-arc:) if within arc of 2 or more Enemies in that full arc.',
  ':focus:.',
];

export const andersonShipActionsByShip: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
  TIELN,
  TIEDEF,
  TIEIN,
  LAMBDA,
  TIESA,
  TIEADVX,
  TIEPH,
  VT49,
});

// ── Elite-variant overrides ───────────────────────────────────────────

// TIE/D Defender Elite — p-07. 8 actions, with two prerequisite markers:
//   "(only if Target has not yet moved)" — red-circle on the card
//   "(only if Target has already moved)" — green-circle on the card
// Row 2 is the Passive Sensors prep step: calculate-action while you
// drop a charge token in front of your ship for a future locked
// attack (the Passive Sensors mechanic on the Elite card).
const TIEDEF_ELITE: readonly string[] = [
  'Resolve :crit:.',
  "(only if Target has not yet moved) :calculate: and place a :charge: in front of your ship (Passive Sensors).",
  '(only if Target has already moved) :evade: if you have a shot.',
  "(only if Target has already moved) :barrelroll: or :boost: to avoid Target's arc and still get a shot.",
  '(only if Target has already moved) :barrelroll: or :boost: to get a shot.',
  '(only if Target has already moved) :evade:.',
  ':focus:.',
  ':evade:.',
];

export const andersonShipActionsByShipElite: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
  TIEDEF: TIEDEF_ELITE,
});
