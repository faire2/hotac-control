import { createContext } from 'react';
import type { AiEngine, ShipId, UpgradeSource } from '../data/Ships';
import type { Position } from '../data/Maneuvers';
import type { UpgradeRow } from '../data/UpgradeRow';

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

export interface Squadron {
  /** Stable per-squad identifier — used as React key. */
  id: string;
  shipType: ShipId;
  isElite: boolean;
  upgradesSource: UpgradeSource;
  upgrades: readonly UpgradeRow[];
  ships: ShipInstance[];
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
