/**
 * Scenario data types — official HotAC mission pack + custom future missions.
 *
 * The schema mirrors the page-5 squad-composition table from the Mission Pack:
 *   columns 1p..6p, each cell holds zero or more "setup ops" applied left-to-right.
 *
 * Setup-icon legend (from the Mission Pack reference page):
 *   +<ship>            add a ship of this specific type
 *   +<random>          add a ship of a random type (squad-consistent: same type for all randoms in this squad)
 *   ↑<ship>            replace the squad's base ship type with this one
 *   ↑<random>          replace the squad's base ship type with a random type
 *   <medal><random>    add an Elite of a random type
 *   <N>+<...> / <N>↑   gated by avg rebel pilot initiative ≥ N (the red-N prefix)
 *
 * Resolution is deferred (lazy): a squad's ship list is computed when the
 * round counter reaches its arrival turn, not when the scenario loads.
 */

import type { ShipId } from '../Ships';
import type { Upgrade } from '../shared/coreUpgrades';
import type { AllySetup } from '../rebelAllies';

export type PlayerCount = 1 | 2 | 3 | 4 | 5 | 6;

export type ArrivalTrigger =
  | { kind: 'setup' }
  | { kind: 'turn'; turn: number }
  | { kind: 'rolledTurn'; turn: number; roll: '1d6' };

/**
 * Single spawn vector. Numbers 1-12 are the standard map edge/corner vectors
 * (the fine-grained 1-12 ring is used by some missions; 1-6 is the common
 * subset). Dice forms: `'1d6'` rolls 1-6, `'1d12'` rolls 1-12, `'1d6+6'`
 * rolls 1-6 and adds 6 (i.e. produces 7-12). A bare uppercase letter refers
 * to a labelled position drawn on the mission map.
 */
export type SimpleVector =
  | number
  | '1d6'
  | '1d12'
  | '1d6+6'
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

/**
 * Spawn vector. Forms:
 * - SimpleVector — a fixed value or a single dice roll
 * - tuple of SimpleVector — pick one (e.g. `[2, 3]` for PDF "2/3")
 * - `{ kind: 'oppositeOf'; squadName }` — resolves to the opposite of the
 *   referenced sibling squad's already-resolved vector. Pairs (Support A/B
 *   in Bait): 1↔7, 2↔9, 3↔8, 4↔10, 5↔12, 6↔11.
 */
export type Vector =
  | SimpleVector
  | readonly SimpleVector[]
  | { kind: 'oppositeOf'; squadName: string };

export interface InitGate {
  rebelInitGte: number;
}

/**
 * Setup ops mirror the X-Wing icon legend's cell glyphs:
 *
 *   add               +<ship>     push a ship of this specific type
 *   addRandom         +⚙          push a ship of a squad-consistent random type
 *   replace           ↑<ship>     upgrade the MOST RECENT ship in the squad to this type
 *   replaceRandom     ↑⚙          upgrade the most recent ship to the squad's random type
 *   addElite          🏅⚙         push a squad-consistent random-type ship marked as Elite
 *                     🏅<ship>    same, but with a specific ship type (`addElite` with `ship` set)
 *   addShields        +N*         add N shields to the most recent ship
 *
 * "Most recent" semantics: `replace`/`replaceRandom` always operate on the
 * latest add. They never replace earlier squad members — those keep their
 * original type. This matches the mission pack's "TIE Fighter and upgrade
 * to random ship" reading (the squad ends up mixed: F, F, ↑R).
 *
 * Squad-consistent random: the first random op in a squad selects ONE
 * type from the random pool; every subsequent random op in that same
 * squad reuses that type.
 */
export type SetupOp =
  | { kind: 'add'; ship: ShipId; gate?: InitGate }
  | { kind: 'addRandom'; gate?: InitGate }
  | { kind: 'replace'; ship: ShipId; gate?: InitGate }
  | { kind: 'replaceRandom'; gate?: InitGate }
  | { kind: 'addElite'; ship?: ShipId; gate?: InitGate }
  /**
   * "+N shields" modifier (PDF glyph `+N*`). Applies to the most recently
   * added ship in the squad at the moment this op runs — i.e. it bumps the
   * shield total of the latest add/addRandom/addElite, not all squad members.
   * Multiple addShields in successive player-count cells stack on the same
   * ship. Resolver throws if no ship has been added yet.
   */
  | { kind: 'addShields'; count: number; gate?: InitGate };

/**
 * Optional per-squad behavior tags. The single extensibility point for
 * one-off mission mechanics — new kinds are added to the union without
 * changing the `ScenarioSquad` shape. Each tag is a discriminated variant
 * so it can carry typed parameters.
 *
 * Tag glossary:
 *   uniqueApproach  Each ship spawned by this squad arrives on a distinct
 *                   approach vector (re-roll duplicates). Used by Revenge's
 *                   Aces squad. Implies `splitPerShip`-like behavior at
 *                   spawn time (resolved ships emit separate Squadrons).
 *   huntsPlayer     Each spawned ship is randomly assigned a rebel player
 *                   number (1..playerCount, bijective when count matches).
 *                   The Squadron card surfaces "Hunts player N".
 *   dynamicSpawn    Squad does not auto-spawn on its arrival turn; a named
 *                   runtime handler (typically an end-of-round popup)
 *                   supplies the ships. Composition may be empty.
 *   noUpgrades      Skip the Imperial Pilot upgrade draw for this squad.
 *                   Equivalent to the legacy `noUpgrades?: boolean` flag.
 */
export type SquadTag =
  | { kind: 'uniqueApproach' }
  | { kind: 'huntsPlayer' }
  | { kind: 'dynamicSpawn'; handler: string }
  | { kind: 'noUpgrades' };

export function hasTag<K extends SquadTag['kind']>(
  squad: { tags?: readonly SquadTag[] },
  kind: K,
): Extract<SquadTag, { kind: K }> | undefined {
  return squad.tags?.find((t): t is Extract<SquadTag, { kind: K }> => t.kind === kind);
}

export interface ScenarioSquad {
  name: string;
  arrival: ArrivalTrigger;
  vector: Vector;
  /**
   * Optional display override for the approach vector. When set, the UI
   * shows this string ("Bay 1", "Center", "Diag.") instead of the typed
   * `vector` value. Used for spawn points that don't fit the edge/letter
   * model (e.g. station docking bays in Capture Refueling Station).
   */
  approachLabel?: string;
  aiTag: string;
  /**
   * Behavior tags — see `SquadTag`. Single extensibility point for opt-in
   * mission mechanics (per-ship spawn, dynamic spawn, no upgrades, etc.).
   */
  tags?: readonly SquadTag[];
  /**
   * Mission-fixed upgrades for this squad. When present, the spawn pipeline
   * uses this list directly instead of rolling from the engine pool — the
   * resulting Squadron has `upgrades` set to this list and no `rollMeta`.
   *
   * Prefer referencing canonical objects from `CommunityUpgrades` /
   * `FgaUpgradePool`. Author inline only when a mission introduces a
   * genuinely unique upgrade not represented in any pool. Supports
   * `:icon:` shortcodes in descriptions.
   */
  fixedUpgrades?: readonly Upgrade[];
  composition: Partial<Record<PlayerCount, readonly SetupOp[]>>;
}

export type ObjectiveKind = 'primary' | 'bonus';

export interface ScenarioObjective {
  kind: ObjectiveKind;
  text: string;
  reward?: string;
}

/**
 * What happens to the campaign deck after this mission resolves.
 *
 *   arcLink         — same arc; replace this arc's head with the named mission ("+" outcome).
 *   arcDiscard      — this arc is done; remove its head from the deck (no replacement). Arc-finale wins
 *                     and any "discard" outcome use this.
 *   reshuffle       — arc unchanged; deck reshuffles for the next pick.
 *   replay          — this specific mission stays at the top, no other shuffling (intro defeat).
 *   campaignStart   — intro arc done; populate the deck with the real campaign arc heads.
 *   campaignEnd     — terminal: the campaign ends now (Imperial Campaign Victory case).
 */
export type OutcomeNext =
  | { kind: 'arcLink'; missionId: string }
  | { kind: 'arcDiscard' }
  | { kind: 'reshuffle' }
  | { kind: 'replay' }
  | { kind: 'campaignStart' }
  | { kind: 'campaignEnd' };

export interface Outcome {
  /** Narrative blurb shown in the end-of-mission recap. */
  text: string;
  next: OutcomeNext;
  /** Campaign points awarded to Rebels on this outcome (arc finales). */
  rebelPoints?: number;
  /** Campaign points awarded to the Empire on this outcome. */
  imperialPoints?: number;
  /**
   * ShipIds added to the campaign's `introducedShipTypes` set when this
   * outcome resolves. Drives the eligible-pool filter and the 1d20 table's
   * exotic-ship fallbacks. Conventionally set on `victory`, but defeat-side
   * unlocks are supported.
   *
   * Doubles as the source of truth for "which ships are introduction-gated"
   * — `eligibleShipsFromPool` derives its `REQUIRES_INTRO` set from the
   * union of every scenario's `unlocksShipTypes`.
   */
  unlocksShipTypes?: readonly ShipId[];
}

/** Which side won the scenario; chosen via the End-Scenario modal. */
export type ScenarioOutcomeKind = 'victory' | 'defeat';

export type Territory = 'friendly' | 'hostile' | 'enemy';

/**
 * Free-text rules block printed alongside the mission (Shuttle AI, Escort AI,
 * special equipment, reminders, etc.). One per sidebar in the source PDF.
 *
 * The briefing modal renders these as a "Special Rules" section. Entries
 * flagged `coveredOnSquadCard: true` are skipped in the briefing because
 * the same info is surfaced inline on the squad card; the text stays in
 * data as the canonical PDF transcription for future toggling.
 */
export interface SpecialRule {
  title: string;
  body: string;
  /** When true, briefing rendering skips this entry — the same content is
   * surfaced inline on a squad card (via `fixedUpgrades` or
   * `behaviorDescriptions`). Full text remains in data as the PDF reference. */
  coveredOnSquadCard?: boolean;
}

/**
 * Stylized "holo" mission map — a small declarative spec rendered to SVG by
 * `<MissionMap>`. Coordinates are in **grid cells** (origin top-left), not
 * pixels, on a `grid`×`grid` board (default 9). The renderer derives the bulk
 * of the picture from defaults + scenario data, so a typical map only declares
 * its bespoke zones/features:
 *
 *   map: {
 *     setupEdge: { side: 'bottom' },         // draws the player band + "A"
 *     zones:    [{ id: 'B', rect: [2,2,7,7] }],
 *     features: [{ kind: 'asteroids', count: 6, in: 'B', seed: 33 }],
 *   }
 *
 * The approach-vector ring (1–6 or 1–12) is derived from the squads' `vector`
 * values and swept clockwise from the setup edge — no need to place numbers.
 */
export type MapSide = 'top' | 'bottom' | 'left' | 'right';

/** Palette key → app `--accent-*` token. `holo` is the default. */
export type MapHue = 'holo' | 'warn' | 'danger';

/**
 * One numbered approach vector, placed by hand on `side` at fraction `t`
 * (0..1 along that edge from its clockwise-start corner). Authored per map —
 * the printed rings vary too much to derive reliably.
 */
export interface MapVector {
  n: number;
  side: MapSide;
  t: number;
}

/** A point in grid-cell units, or the board centre. */
export type MapPoint = readonly [number, number] | 'center';

/** Rectangle in grid-cell units: `[x0, y0, x1, y1]`. */
export type MapRect = readonly [number, number, number, number];

/**
 * A labelled region. Declare exactly one shape field (`rect` / `band` /
 * `disc` / `corner` / `point`); the renderer picks the first present. Give it
 * an `id` if a feature needs to reference it (e.g. asteroids `in: 'B'`).
 */
export interface MapZone {
  /** Stable id for `MapFeature.in` references. */
  id?: string;
  /** Single-letter badge drawn on the zone (e.g. `'B'`). */
  label?: string;
  /** Palette key; defaults to `'holo'`. */
  hue?: MapHue;
  /** Hover tooltip. */
  tip?: string;
  /** Free rectangle in cell units. */
  rect?: MapRect;
  /** Edge band: `depth` cells deep along `side`, optional `span` along it. */
  band?: { side: MapSide; depth: number; span?: readonly [number, number] };
  /** Disc of radius `r` (cells) centred at `at`. */
  disc?: { at: MapPoint; r: number };
  /** Quarter-disc tucked into a board corner. */
  corner?: { corner: 'tl' | 'tr' | 'bl' | 'br'; radius: number };
  /** Bare label badge at a point (no filled body). */
  point?: readonly [number, number];
}

/**
 * A drawn feature. `asteroids` scatters `count` abstract rocks (seeded,
 * min-distance enforced) either inside the zone named by `in`, or in an
 * explicit `region`. `station` stamps a holo wireframe from the shape library.
 */
export type MapFeature =
  | {
      kind: 'asteroids';
      count: number;
      /**
       * Optional second obstacle class — red "debris" rocks (meteorites). Sampled
       * together with the asteroids from the same region so all obstacles keep the
       * `minDist` spacing the printed maps require (">1 apart").
       */
      debris?: number;
      /** Zone id whose rect bounds the scatter region. */
      in?: string;
      /** Explicit scatter region (used when `in` is absent). */
      region?: MapRect;
      seed?: number;
      /** Minimum centre-to-centre spacing in cells. Default 1.6. */
      minDist?: number;
    }
  | { kind: 'station'; preset: 'triHub' | 'bar'; at: MapPoint; label?: string; tip?: string };

/** A game token in our own holo glyph language. */
export type MapToken =
  | { kind: 'playerStart'; at: MapPoint; playerCount?: number; tip?: string }
  | { kind: 'objective'; at: MapPoint; label?: string; tip?: string }
  | { kind: 'structure'; at: MapPoint; label?: string; playerCount?: number; tip?: string }
  /**
   * A real ship silhouette drawn from the vendored `XWingShip` icon font (the
   * same glyphs the squad cards use). `ship` is an internal `ShipId`; an
   * optional `label` adds a badge (e.g. the objective letter `C`).
   */
  | {
      kind: 'ship';
      at: MapPoint;
      ship: ShipId;
      hue?: MapHue;
      label?: string;
      /** The ship is only rendered when the current player count is >= this threshold. */
      playerCount?: number;
      tip?: string;
    };

export interface MissionMap {
  /** Board size in cells (square). Default 9. */
  grid?: number;
  /** Ambient seed for the starfield and any feature that omits its own. */
  seed?: number;
  /**
   * Player setup edge — auto-draws a `--accent-warn` band + label badge and
   * removes that edge from the vector ring. Defaults to `{ side: 'bottom' }`.
   * Pass `false` for missions with no edge setup.
   */
  setupEdge?: { side: MapSide; label?: string; depth?: number } | false;
  /**
   * Approach-vector ring. Author an explicit `MapVector[]` per map (the printed
   * rings vary too much to derive). `'auto'` derives 6 vs 12 from the squads'
   * `vector` values and sweeps clockwise from the setup edge as a fallback; a
   * number forces that derived count; `false` hides the ring. Default `'auto'`.
   */
  vectors?: readonly MapVector[] | 'auto' | 6 | 12 | false;
  zones?: readonly MapZone[];
  features?: readonly MapFeature[];
  tokens?: readonly MapToken[];
}

export interface Scenario {
  id: string;
  version: string;
  title: string;
  subtitle?: string;
  briefing: string;
  mapDiagram: string;
  mapNotes: readonly string[];
  /** Optional stylized SVG map. When present, `<MissionMap>` renders it in the
   * briefing in place of the ASCII `mapDiagram`. */
  map?: MissionMap;
  turnLimit: number;
  territory: Territory;
  objectives: readonly ScenarioObjective[];
  /** Rebel-victory outcome (replaces the legacy `victory.rebel` string). */
  victory: Outcome;
  /** Imperial-victory outcome (the Rebels lose). */
  defeat: Outcome;
  squads: readonly ScenarioSquad[];
  /** Sidebar rules blocks printed with the mission. Optional. */
  specialRules?: readonly SpecialRule[];
  /**
   * Per-tag behavior descriptions surfaced on the squad card under each
   * squadron's target-priority panel. Keyed by `ScenarioSquad.aiTag` value
   * (e.g. `'Special'`, `'Escort'`, `'Strike'`).
   *
   * Authored per mission because the same tag means different things in
   * different missions — `'Special'` is the Lambda Shuttle in
   * Capture-the-Officer 1 but the VT-49 Decimator in Minefields 2. Text
   * supports `:icon:` shortcodes (rendered via `<Rule>`).
   *
   * Optional today; missions without it leave the description slot empty.
   * Backfill is queued in the roadmap.
   */
  behaviorDescriptions?: Partial<Record<string, string>>;
  /**
   * Ship types this mission's `addRandom`/`replaceRandom`/`addElite` ops
   * must NOT pick from, on top of any campaign-config exclusions. Bait,
   * for example, sets `['LAMBDA', 'TIEPH']` because both are placed
   * explicitly and shouldn't double up via the random pool.
   */
  randomPoolExclusions?: readonly ShipId[];
  /**
   * Rebel ally NPC ships placed at scenario start (Operatives' HWK-290,
   * Bright Hope GR-75, Recovery Smuggler, etc.). Spawned as ally-flagged
   * Squadrons so hull/shield bookkeeping works in the UI.
   */
  allies?: readonly AllySetup[];
}

/**
 * A campaign is an ordered story arc that links missions together.
 * Mission progression is driven by the active mission's `victory.next` /
 * `defeat.next` rather than by index, so a Campaign mostly carries
 * presentation + the running point tally.
 */
/**
 * A story arc — a chain of missions that progress via `arcLink` outcomes.
 * The HotAC mission pack has 5 arcs (Capture Officer, Refueling Station,
 * Minefields, Chasing Phantoms, Defection) plus the intro arc (single
 * mission, Local Trouble).
 */
export interface CampaignArc {
  id: string;
  title: string;
  /** Mission ids in chain order. The "head" of the arc starts at index 0. */
  missionIds: readonly string[];
  /** Optional starting mission id (defaults to `missionIds[0]`). */
  startMissionId?: string;
  /** True for the introductory arc (before the full campaign begins). */
  isIntro?: boolean;
}

/**
 * One slot in the campaign deck. Each active arc contributes exactly one
 * entry; the entry tracks which mission within the arc is currently the
 * "head" (next playable). `arcLink` advances the head; `arcDiscard`
 * removes the slot from the deck.
 */
export interface DeckEntry {
  arcId: string;
  headMissionId: string;
}

/**
 * One row in a campaign's mission history. Records the outcome that closed
 * the mission and the points it conferred.
 */
export interface CampaignHistoryEntry {
  missionId: string;
  result: 'victory' | 'defeat';
  rebelPoints: number;
  imperialPoints: number;
  resolvedAt: number;  // unix ms
}

/**
 * The active campaign save record. One per campaign the player has started;
 * persisted via the `CampaignStore` interface. Settings, deck state, and
 * progression are all per-campaign — there is no separate "player settings"
 * scope.
 */
export interface Campaign {
  /** UUID; not the title. */
  id: string;
  /** Free-form name chosen by the player. May be duplicated across campaigns. */
  name: string;

  // Configuration (set at creation, editable mid-campaign)
  /** Whether this campaign starts with the intro mission. */
  includeIntro: boolean;
  /** Free-form names of physical models the player owns for this campaign. */
  ownedModels: readonly string[];
  /** When true, random imperial picks use the d20 weighted table. */
  lessRandomShips: boolean;
  /**
   * When true, the deck-pick screen shows every arc head face-up and the
   * player chooses freely. When false (default), the deck behaves as in
   * the printed rules — shuffle and draw, no choice.
   */
  freePickFromDeck: boolean;

  // Progression (mutated as the campaign plays out)
  /** ShipIds unlocked via prior mission play (TIEPH after chasing-phantoms-1, etc.). */
  introducedShipTypes: readonly ShipId[];
  /** Current deck — one entry per active arc head. */
  deck: readonly DeckEntry[];
  /** Arc ids that have been discarded (removed from the deck). */
  completedArcs: readonly string[];
  /** Mission currently being played, or null between missions (deck-pick state). */
  currentMissionId: string | null;
  /** Completed-mission log. */
  history: readonly CampaignHistoryEntry[];
  rebelPoints: number;
  imperialPoints: number;
  /** Terminal status. `active` while still playable. */
  status: 'active' | 'rebelVictory' | 'imperialVictory';

  createdAt: number;  // unix ms
  updatedAt: number;  // unix ms
}

/** Compact campaign metadata for list views (Open dialog). */
export interface CampaignSummary {
  id: string;
  name: string;
  status: Campaign['status'];
  rebelPoints: number;
  imperialPoints: number;
  completedArcs: number;
  totalArcs: number;
  updatedAt: number;
}
