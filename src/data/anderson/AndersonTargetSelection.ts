import type { ShipId } from '../Ships';

/**
 * Anderson "Select Target" priority lists per ship.
 * Plain-string priorities with `:icon-name:` shortcodes; rendered by `<PriorityList>`.
 */

const TIELN: readonly string[] = [
  'Nearest enemy in :front-arc:',
  'Nearest enemy',
];

// TIE/D Defender — base card, shipcards p-06. Same 4 priorities as FGA
// TIEDEF with slight phrasing tweak ("with lower Initiative" trails the
// arc instead of preceding it).
const TIEDEF: readonly string[] = [
  'Locked Enemy within range 3',
  'Nearest Enemy in :front-arc: with lower Initiative',
  'Nearest Enemy in :front-arc:',
  'Nearest Enemy',
];

// TIE Interceptor — shipcards p-02. Same 2 priorities as FGA TIEIN.
const TIEIN: readonly string[] = [
  'Nearest Enemy in :front-arc:',
  'Nearest Enemy',
];

// Lambda-class T-4a Shuttle — shipcards p-08. Same 2 priorities as FGA LAMBDA.
const LAMBDA: readonly string[] = [
  'Nearest Enemy in :front-arc:',
  'Nearest Enemy',
];

// TIE/sa Bomber — shipcards p-03. Same 4-tier structure as TIE Defender
// Elite (locked / lower-INIT / arc / nearest). "of lower INIT" mirrors
// the Defender Elite phrasing.
const TIESA: readonly string[] = [
  'Locked Enemy within range 3',
  'Nearest Enemy in :front-arc: of lower INIT',
  'Nearest Enemy in :front-arc:',
  'Nearest Enemy',
];

// TIE Advanced x1 — shipcards p-04. Same 4 priorities as FGA TIEADVX
// with Anderson's "with lower Initiative" trailing the arc.
const TIEADVX: readonly string[] = [
  'Locked Enemy within range 3',
  'Nearest Enemy in :front-arc: with lower Initiative',
  'Nearest Enemy in :front-arc:',
  'Nearest Enemy',
];

// TIE/ph Phantom — shipcards p-05. Same 2 priorities as FGA TIEPH.
const TIEPH: readonly string[] = [
  'Nearest Enemy in :front-arc:',
  'Nearest Enemy',
];

// VT-49 Decimator — shipcards p-09. Differs from FGA's "Locked enemy
// within range 3" opener; the Anderson card uses "Nearest" — the
// Decimator is too slow to chase locks reliably, so the AI picks the
// nearest in-range target.
const VT49: readonly string[] = [
  'Nearest Enemy within range 3',
  'Nearest Enemy in :front-arc:',
  'Nearest Enemy',
];

export const andersonTargetSelectionByShip: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
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
// Sparse map: a ShipId entry here is the elite priority list used when
// the squad's `isElite` flag is true; missing entries fall back to the
// base map above. TIE Defender Elite (shipcards p-07) is the first
// known case; other ships' elite variants — when transcribed — go here.

// TIE/D Defender Elite — p-07. Same 4 priorities as base; item 2 reads
// "of lower INIT" on the Elite card (vs base's "with lower Initiative").
const TIEDEF_ELITE: readonly string[] = [
  'Locked Enemy within range 3',
  'Nearest Enemy in :front-arc: of lower INIT',
  'Nearest Enemy in :front-arc:',
  'Nearest Enemy',
];

export const andersonTargetSelectionByShipElite: Readonly<Partial<Record<ShipId, readonly string[]>>> = Object.freeze({
  TIEDEF: TIEDEF_ELITE,
});
