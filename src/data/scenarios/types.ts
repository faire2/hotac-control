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
 */
export interface SpecialRule {
  title: string;
  body: string;
}

export interface Scenario {
  id: string;
  version: string;
  title: string;
  subtitle?: string;
  briefing: string;
  mapDiagram: string;
  mapNotes: readonly string[];
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
   * Ship types this mission's `addRandom`/`replaceRandom`/`addElite` ops
   * must NOT pick from, on top of any campaign-config exclusions. Bait,
   * for example, sets `['LAMBDA', 'TIEPH']` because both are placed
   * explicitly and shouldn't double up via the random pool.
   */
  randomPoolExclusions?: readonly ShipId[];
  /**
   * Physical-model prerequisites — free-form names of X-Wing Miniatures
   * ships/expansions the player must own to play this mission. Used by the
   * future arc-gating feature so missions that need a GR-75, HWK-290, VT-49,
   * etc. can be disabled in the picker if the player doesn't own the model.
   * Free strings (not ShipId) since allies like GR-75 / HWK-290 / Outer Rim
   * Smuggler aren't in the AI ship registry.
   */
  requiredModels?: readonly string[];
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
