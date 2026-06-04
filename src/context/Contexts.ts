import { createContext } from 'react';
import type { AiEngine, ShipId, UpgradeSource } from '../data/Ships';
import type { Maneuver, Position } from '../data/Maneuvers';
import type { Upgrade } from '../data/shared/coreUpgrades';
import type { SimpleVector } from '../data/scenarios/types';
import type { DialEntry } from '../data/allyDials';
import type { AllyAction } from '../data/allyActions';

/**
 * Squad-local UI state for the position picker, AI engine selector, and stress toggle.
 * Provided by `Squad.jsx`; consumed by maneuver/diagram/action subtrees.
 */
export interface TargetPositionContextValue {
  shipType: ShipId;
  maneuverRandNum: number;
  aiEngine: AiEngine;
  setAiEngine: (ai: AiEngine) => void;
  targetPosition: readonly string[] | string;
  setTargetPosition: (position: Position | readonly Position[]) => void;
  stressed: boolean;
  handleStress: () => void;
  /** When set, the maneuver readout ignores the position table and samples
   * this fixed list by `maneuverRandNum` (special-AI ships whose movement is
   * a plain die roll — see `SquadTag` `maneuverOverride`). */
  maneuverOverride?: readonly Maneuver[];
}

/**
 * Top-level squadron list state plus the rank slider and squad-level mutators.
 * Provided by `App.jsx`.
 */
export interface GlobalSquadsValuesContextValue {
  playersRank: number;
  squadrons: readonly Squadron[];
  handleSetIsElite: (squadId: number, isElite: boolean) => void;
  handleSetUpgradesSource: (squadId: number, source: UpgradeSource) => void;
  handleSquadRemoval: (squadId: number) => void;
  /** When set, the per-squadron AI engine toggle is hidden and this engine is used for all squads. */
  scenarioAiEngine?: AiEngine;
  /** When set, the per-squadron upgrades-source toggle is hidden. */
  scenarioUpgradesSource?: UpgradeSource;
}

/**
 * Per-ship handlers (add/remove physical ships within a squadron, hull/shield mutations).
 * Provided by `App.jsx`.
 */
export interface ShipHandlingContextValue {
  squadrons: readonly Squadron[];
  handleAddShip: (squadId: number) => void;
  handleShipRemoval: (shipIndex: number, squadId: number) => void;
  handleShipChange: (ship: ShipInstance, shipIndex: number, squadId: number) => void;
}

/**
 * Provenance + display state stamped on a squadron at scenario-spawn time.
 * Presence of this object is the discriminator for "this squadron came from
 * a scenario" (free play leaves `Squadron.scenarioMeta` undefined).
 */
export interface ScenarioSpawnMeta {
  /** Matches `ScenarioSquad.name` for Imperial squads; the ally display name
   * (or fallback to ship name) for rebel allies. */
  squadName: string;
  /** Concrete spawn vector resolved at arrival time (1d6/tuple → fixed).
   * Behavioral — consumed by `priorVectorsFromSquadrons` for `oppositeOf`
   * math. Undefined for rebel allies (no approach edge). For display, use
   * `approachDisplay(meta)` rather than reading this field directly. */
  fromVector?: SimpleVector;
  /** Optional human-readable label override (e.g. "Bay 1", "Setup"). Wins
   * over `fromVector` in `approachDisplay(meta)`. */
  approachLabel?: string;
  /** Round on which this squadron arrived. */
  arrivedAtRound: number;
  /** Rebel player index (1-based) this enemy squadron is hunting. */
  huntsPlayerIndex?: number;
  /** Mission-specified AI behavior tag (`Attack`, `Escort`, `Strike`,
   * `Flee*`, `Special`, etc.). Asterisk = mission-modified — see
   * `Scenario.specialRules`. Surfaced in the target-selection panel as
   * informational text; not yet wired into AI dispatch. */
  aiTag?: string;
  /** Prose description of `aiTag` for this mission, copied from
   * `Scenario.behaviorDescriptions[aiTag]` at spawn time. May contain
   * `:icon:` shortcodes. Rendered under the target-priority list. */
  behaviorDescription?: string;
  /** Fixed maneuver list for special-AI ships whose movement is a plain die
   * roll, copied from the squad's `maneuverOverride` tag at spawn time. When
   * present, the maneuver dial samples this list instead of the position
   * table (any dial click → a random entry). */
  maneuverOverride?: readonly Maneuver[];
}

/** Display string for a squadron's approach — label wins over vector number,
 * with `'?'` as the last-resort fallback. Single source of truth for the
 * label/number/fallback precedence. */
export function approachDisplay(meta: ScenarioSpawnMeta): string {
  if (meta.approachLabel !== undefined) return meta.approachLabel;
  if (meta.fromVector !== undefined) return String(meta.fromVector);
  return '?';
}

/**
 * Bookkeeping from the upgrade roll that produced a Squadron's `upgrades`.
 *
 * Present when upgrades came from `getUpgrades` (the pool-rolled path):
 * free-play squads and most scenario-spawned squads. Absent for squads
 * whose upgrades didn't come from a roll: mission-fixed upgrades, rebel
 * allies, and squads tagged `noUpgrades`.
 *
 * Used to:
 *   - drive the source-toggle UI (visibility + current value)
 *   - show the rolled tier/xp in the SquadStats XP column
 *   - override the ship's printed initiative when an upgrade row implies a
 *     higher pilot init
 *   - re-roll on rank/elite/source changes
 */
export interface UpgradeRollMeta {
  source: UpgradeSource;
  /** Initiative override from the highest-tier row; undefined for empty rolls. */
  initiative?: number;
  /** XP-column display: 1/2/3 for FGA, xpCost for Community, `'—'` for Anderson, `0` for empty. */
  xp: number | string;
}

export interface Squadron {
  /** Stable per-squad identifier — used as React key. */
  id: string;
  shipType: ShipId;
  isElite: boolean;
  /** The squad's upgrade cards (bare data). Source-of-truth for render +
   * hull/shield extras. Roll bookkeeping (which source, what tier) lives
   * on `rollMeta` so mission-fixed/ally squads don't need fake roll data. */
  upgrades: readonly Upgrade[];
  /** Present iff `upgrades` came from `getUpgrades`. Absent for mission-fixed,
   * ally, and `noUpgrades`-tagged squads. */
  rollMeta?: UpgradeRollMeta;
  /** Mission-fixed pilot initiative for allies. Takes precedence over
   * `rollMeta.initiative` and `Ships[shipType].initiative` when set. */
  initiativeOverride?: number;
  ships: ShipInstance[];
  /** Set iff spawned by a scenario. Free play leaves this undefined. */
  scenarioMeta?: ScenarioSpawnMeta;
  /**
   * Resolved ally profile — the player-piloted ally's maneuver dial and
   * action bar, with mission `dialMods` / `removeActions` already applied.
   * Computed once at spawn (see `spawnAlliesFromScenario`); absent for AI
   * squads, which use the AI carousel instead.
   */
  ally?: {
    dial: readonly DialEntry[];
    actions: readonly AllyAction[];
  };
}

export interface ShipInstance {
  tokenId: number;
  hull: number;
  shields: number;
  /** GR-75 huge-ship energy resource. Present iff `Ships[squad.shipType].hasEnergy`. */
  energy?: number;
}

export const TargetPositionContext = createContext<TargetPositionContextValue | null>(null);
export const GlobalSquadsValuesContext =
  createContext<GlobalSquadsValuesContextValue | null>(null);
export const ShipHandlingContext = createContext<ShipHandlingContextValue | null>(null);
