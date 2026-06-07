import type { ShipId } from '../Ships';

/**
 * Anderson "Attack Target" priority lists per ship.
 */

const TIELN: readonly string[] = ['Nearest enemy'];

// TIE/D Defender — base card, shipcards p-06. Same weapon-priority
// trio as FGA TIEDEF (Defender carries cannons/missiles in its loadout).
const TIEDEF: readonly string[] = [
  'Locked ship (prio: :missile:, :cannon:, :front-arc:)',
  'Nearest enemy (prio: :missile:, :cannon:, :front-arc:)',
];

// TIE Interceptor — shipcards p-02. Matches FGA TIEIN exactly.
const TIEIN: readonly string[] = ['Nearest Enemy'];

// Lambda-class T-4a Shuttle — shipcards p-08. Matches FGA LAMBDA: a
// front+rear-arc attacker with optional :gunner: backup attack from
// the rear.
const LAMBDA: readonly string[] = [
  'Nearest Enemy (prio: :cannon:, :front-arc:, :rear-arc:)',
  'Attack Target (if allowed by :gunner:): Nearest Enemy (prio: :rear-arc:)',
];

// TIE Advanced x1 — shipcards p-04. Matches FGA TIEADVX exactly.
const TIEADVX: readonly string[] = [
  'Ship that is locked (prio: :missile:, :front-arc:)',
  'Nearest Enemy',
];

// TIE/sa Bomber — shipcards p-03. Adds a charge-spent fallback :rotate:
// step ahead of the FGA-style two-tier attack priorities (locked vs.
// nearest, both prioritising :torpedo: / :missile: / :front-arc: for max
// red dice).
const TIESA: readonly string[] = [
  '(only if all :focus: / :charge: are spent) If no shot and not in Enemy arcs, perform a :rotate: action.',
  'Ship that is locked (prio: :torpedo:, :missile:, :front-arc:)',
  'Nearest Enemy (prio: :missile:, :front-arc:)',
];

// TIE/ph Phantom — shipcards p-05. Matches FGA TIEPH exactly.
const TIEPH: readonly string[] = ['Nearest Enemy'];

// VT-49 Decimator — shipcards p-09. Same main priorities as FGA VT49,
// with a secondary "if allowed by :gunner:" section for the bonus
// attack (same target priorities, no prio modifiers).
const VT49: readonly string[] = [
  'Ship that is locked (prio: :torpedo:, :turret:)',
  'Nearest Enemy',
  'Attack Target (if allowed by :gunner:): Ship that is locked.',
  'Attack Target (if allowed by :gunner:): Nearest Enemy.',
];

export const andersonAttackByShip: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
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

// TIE/D Defender Elite — p-07. Locked-ship row's "Keep your lock"
// reminder ties into Advanced Fire Control: the Elite spends its lock
// after the missile/cannon attack to trigger a bonus primary. Row 3
// targets the nearest enemy in :front-arc: rather than the universal
// nearest enemy — the Elite plays positionally tight.
const TIEDEF_ELITE: readonly string[] = [
  'Spend :charge: to attack the marked enemy (Passive Sensors).',
  'Locked ship (prio: :missile:, :cannon:) — Keep your lock.',
  'Nearest Enemy in :front-arc:.',
];

export const andersonAttackByShipElite: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
  TIEDEF: TIEDEF_ELITE,
});
