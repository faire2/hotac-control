/**
 * Iconography registry — maps short kebab-case keys to the X-Wing icon font's
 * CSS classes. Used by the `:icon-name:` shortcode parser in `<Rule>`.
 *
 * Keep keys lowercase, kebab-case, and aligned with X-Wing rulebook nomenclature
 * where possible. The validator (src/data/__validate__.ts) scans all string data
 * for `:foo:` shortcodes and asserts every one resolves here.
 *
 * The font lives at src/fonts/xwing-miniatures.{css,ttf}, vendored locally
 * (we deliberately don't depend on the upstream npm package — see AGENTS.md).
 */

export const ICON_CLASS = Object.freeze({
  // Arcs / firing zones
  'front-arc': 'xwi x-frontarc',
  'rear-arc': 'xwi x-reararc',
  'bullseye': 'xwi x-bullseyearc',
  'turret': 'xwi x-singleturretarc',
  'double-turret': 'xwi x-doubleturretarc',

  // Tokens
  'focus': 'xwi x-focus',
  'evade': 'xwi x-evade',
  'lock': 'xwi x-lock',
  'charge': 'xwi x-charge',
  'force': 'xwi x-force',
  'strain': 'xwi x-strain',

  // Dice results
  'hit': 'xwi x-hit',
  'crit': 'xwi x-crit',

  // Actions
  'barrelroll': 'xwi x-barrelroll',
  'boost': 'xwi x-boost',
  'cloak': 'xwi x-cloak',
  'reload': 'xwi x-reload',
  'reinforce': 'xwi x-reinforce',
  'jam': 'xwi x-jam',
  'coordinate': 'xwi x-coordinate',
  'rotate': 'xwi x-rotatearc',

  // Maneuver glyphs (referenced inline in some rules)
  'straight': 'xwi x-straight',
  'turn-left': 'xwi x-turnleft',
  'turn-right': 'xwi x-turnright',
  'bank-left': 'xwi x-bankleft',
  'bank-right': 'xwi x-bankright',
  'k-turn': 'xwi x-kturn',
  'sloop-left': 'xwi x-sloopleft',
  'sloop-right': 'xwi x-sloopright',
  'troll-left': 'xwi x-trollleft',
  'troll-right': 'xwi x-trollright',
  'stop': 'xwi x-stop',
  'reverse-straight': 'xwi x-reversestraight',
  'reverse-bank-left': 'xwi x-reversebankleft',
  'reverse-bank-right': 'xwi x-reversebankright',

  // Weapon types
  'missile': 'xwi x-missile',
  'torpedo': 'xwi x-torpedo',

  // Charge / recurring indicators
  'recurring': 'xwi x-recurring',
  'double-recurring': 'xwi x-doublerecurring',
  'range-bonus': 'xwi x-rangebonusindicator',

  // Defense
  'shield': 'xwi x-shield',

  // Arc variants
  'full-front-arc': 'xwi x-fullfrontarc',
  'full-rear-arc': 'xwi x-fullreararc',

  // Weapon types (cannon)
  'cannon': 'xwi x-cannon',

  // Crew
  'gunner': 'xwi x-gunner',

  // Linking and red (free) action variants — used in step descriptions
  'linked': 'xwi x-linked',
  'red-lock': 'xwir x-lock',
  'red-barrelroll': 'xwir x-barrelroll',
  'red-boost': 'xwir x-boost',
  'red-jam': 'xwir x-jam',
  'red-reload': 'xwir x-reload',
  'red-focus': 'xwir x-focus',
  'red-coordinate': 'xwir x-coordinate',
} as const);

export type IconKey = keyof typeof ICON_CLASS;

const KNOWN_ICON_KEYS = new Set<string>(Object.keys(ICON_CLASS));

export function isIconKey(value: string): value is IconKey {
  return KNOWN_ICON_KEYS.has(value);
}
