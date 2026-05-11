import { createContext } from 'react';
import type { AiEngine, ShipId, UpgradeSource } from '../data/Ships';
import type { Position } from '../data/Maneuvers';
import type { UpgradeRow } from '../data/UpgradeRow';
import type { SimpleVector } from '../data/scenarios/types';

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
  /** Matches `ScenarioSquad.name`. */
  squadName: string;
  /** Concrete spawn vector resolved at arrival time (1d6/tuple → fixed). */
  fromVector: SimpleVector;
  /** Optional human-readable label override (e.g. "Bay 1"). */
  approachLabel?: string;
  /** Round on which this squadron arrived. */
  arrivedAtRound: number;
  /** Rebel player index (1-based) this enemy squadron is hunting. */
  huntsPlayerIndex?: number;
}

export interface Squadron {
  /** Stable per-squad identifier — used as React key. */
  id: string;
  shipType: ShipId;
  isElite: boolean;
  upgradesSource: UpgradeSource;
  upgrades: readonly UpgradeRow[];
  ships: ShipInstance[];
  /** Set iff spawned by a scenario. Free play leaves this undefined. */
  scenarioMeta?: ScenarioSpawnMeta;
}

export interface ShipInstance {
  tokenId: number;
  hull: number;
  shields: number;
}

export const TargetPositionContext = createContext<TargetPositionContextValue | null>(null);
export const GlobalSquadsValuesContext =
  createContext<GlobalSquadsValuesContextValue | null>(null);
export const ShipHandlingContext = createContext<ShipHandlingContextValue | null>(null);
