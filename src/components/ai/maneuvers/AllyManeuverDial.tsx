import { useState } from 'react';
import type { DialDifficulty, DialDirection, DialEntry } from '../../../data/allyDials';

interface Props {
  /** The ally's resolved dial (mission `dialMods` already applied). */
  dial: readonly DialEntry[];
}

const DIFFICULTY_CLASS: Readonly<Record<DialDifficulty, string>> = {
  white: 'xwm',
  red: 'xwmr',
  blue: 'xwmb',
};

// Right-side glyph for each direction. The dial intentionally renders
// only centre + right; the player flips it mentally for left maneuvers.
//
// Reverse-straight reuses the regular `x-straight` glyph plus a 180°
// rotation (via `.ally-dial-icon--reverse` in CSS) because the font's
// dedicated `x-reversestraight` glyph (codepoint K) renders as a
// stop-sign-looking square that doesn't read as a flipped arrow.
// Reverse-bank, by contrast, has a proper dedicated glyph in the
// font (`x-reversebankright`) so we use that directly — no rotation
// trick needed.
const DIRECTION_ICON: Readonly<Record<DialDirection, string>> = {
  straight: 'x-straight',
  bank: 'x-bankright',
  turn: 'x-turnright',
  kturn: 'x-kturn',
  sloop: 'x-sloopright',
  troll: 'x-trollright',
  stop: 'x-stop',
  reverseStraight: 'x-straight',
  reverseBank: 'x-reversebankright',
};

const REVERSE_DIRECTIONS: ReadonlySet<DialDirection> = new Set<DialDirection>([
  'reverseStraight',
]);

const DIRECTION_LABEL: Readonly<Record<DialDirection, string>> = {
  straight: 'straight',
  bank: 'bank',
  turn: 'turn',
  kturn: 'Koiogran turn',
  sloop: 'Segnor’s loop',
  troll: 'Tallon roll',
  stop: 'stop',
  reverseStraight: 'reverse straight',
  reverseBank: 'reverse bank',
};

// Maneuvers share visual columns by "lateral aggression": centre = no
// lateral travel (straight / stop), then bank, then turn, with k-turn
// at the far right. Reverses get their own columns (reverseCentre,
// reverseBank) because a single speed can carry BOTH straight and
// reverse-straight (e.g. the Defector TIE Defender's speed-2 row has
// blue straight + red reverse) — sharing a column would let the later
// dial entry overwrite the earlier one in the per-row Map.
type Column =
  | 'centre'
  | 'bank'
  | 'turn'
  | 'kturn'
  | 'reverseCentre'
  | 'reverseBank';

const DIRECTION_COLUMN: Readonly<Record<DialDirection, Column>> = {
  straight: 'centre',
  stop: 'centre',
  reverseStraight: 'reverseCentre',
  bank: 'bank',
  reverseBank: 'reverseBank',
  turn: 'turn',
  sloop: 'turn',
  troll: 'turn',
  kturn: 'kturn',
};

const COLUMN_ORDER: readonly Column[] = [
  'centre',
  'bank',
  'turn',
  'kturn',
  'reverseCentre',
  'reverseBank',
];

interface RowCell {
  column: Column;
  entry: DialEntry | null;
}

interface DialRow {
  speed: number;
  cells: readonly RowCell[];
}

function buildRows(dial: readonly DialEntry[]): readonly DialRow[] {
  const presentColumns = new Set<Column>();
  const bySpeed = new Map<number, Map<Column, DialEntry>>();
  for (const entry of dial) {
    const col = DIRECTION_COLUMN[entry.direction];
    presentColumns.add(col);
    const row = bySpeed.get(entry.speed) ?? new Map<Column, DialEntry>();
    row.set(col, entry);
    bySpeed.set(entry.speed, row);
  }
  const orderedColumns = COLUMN_ORDER.filter((c) => presentColumns.has(c));
  const speeds = Array.from(bySpeed.keys()).sort((a, b) => b - a);
  return speeds.map((speed) => {
    const row = bySpeed.get(speed) ?? new Map<Column, DialEntry>();
    return {
      speed,
      cells: orderedColumns.map((column) => ({
        column,
        entry: row.get(column) ?? null,
      })),
    };
  });
}

function entryKey(entry: DialEntry): string {
  return `${entry.speed.toString()}:${entry.direction}`;
}

export function AllyManeuverDial({ dial }: Props) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  if (dial.length === 0) return null;
  const rows = buildRows(dial);

  return (
    <div className="ally-dial d-flex flex-column">
      <h3 className="squadSectionHeader">Maneuver dial</h3>
      <div className="ally-dial-grid" role="table" aria-label="Maneuver dial">
        {rows.map((row) => (
          <div key={row.speed} className="ally-dial-row" role="row">
            <span className="ally-dial-speed" aria-label={`Speed ${row.speed.toString()}`}>
              {row.speed}
            </span>
            <span className="ally-dial-cells">
              {row.cells.map(({ column, entry }) => {
                if (!entry) {
                  return <span key={column} className="ally-dial-cell" role="cell" />;
                }
                const key = entryKey(entry);
                const isSelected = key === selectedKey;
                const energyLabel =
                  entry.energy !== undefined
                    ? `, +${entry.energy.toString()} energy`
                    : '';
                const label = `Speed ${row.speed.toString()} ${DIRECTION_LABEL[entry.direction]} (${entry.difficulty})${energyLabel}`;
                return (
                  <button
                    key={column}
                    type="button"
                    role="cell"
                    className={`ally-dial-cell ally-dial-cell--button${
                      isSelected ? ' ally-dial-cell--selected' : ''
                    }`}
                    aria-pressed={isSelected}
                    aria-label={`${label}${isSelected ? ' — selected' : ''}`}
                    onClick={() => {
                      setSelectedKey((prev) => (prev === key ? null : key));
                    }}
                  >
                    <i
                      className={`${DIFFICULTY_CLASS[entry.difficulty]} ${DIRECTION_ICON[entry.direction]} ally-dial-icon${
                        REVERSE_DIRECTIONS.has(entry.direction) ? ' ally-dial-icon--reverse' : ''
                      }`}
                      aria-hidden="true"
                    />
                    {entry.energy !== undefined && (
                      <span className="ally-dial-energy" aria-hidden="true">
                        +{entry.energy}
                      </span>
                    )}
                  </button>
                );
              })}
            </span>
          </div>
        ))}
      </div>
      <p className="ally-dial-mirror-note">Left-side maneuvers mirror the right.</p>
    </div>
  );
}
