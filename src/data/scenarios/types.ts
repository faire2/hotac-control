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

export type PlayerCount = 1 | 2 | 3 | 4 | 5 | 6;

export type ArrivalTrigger =
  | { kind: 'setup' }
  | { kind: 'turn'; turn: number }
  | { kind: 'rolledTurn'; turn: number; roll: '1d6' };

export type Vector = number | '1d6';

export interface InitGate {
  rebelInitGte: number;
}

export type SetupOp =
  | { kind: 'add'; ship: ShipId; gate?: InitGate }
  | { kind: 'addRandom'; gate?: InitGate }
  | { kind: 'replace'; ship: ShipId; gate?: InitGate }
  | { kind: 'replaceRandom'; gate?: InitGate }
  | { kind: 'addElite'; gate?: InitGate };

export interface ScenarioSquad {
  name: string;
  arrival: ArrivalTrigger;
  vector: Vector;
  aiTag: string;
  noUpgrades?: boolean;
  composition: Partial<Record<PlayerCount, readonly SetupOp[]>>;
}

export type ObjectiveKind = 'primary' | 'bonus';

export interface ScenarioObjective {
  kind: ObjectiveKind;
  text: string;
  reward?: string;
}

export interface VictoryText {
  rebel: string;
  imperial: string;
}

export type Territory = 'friendly' | 'hostile' | 'enemy';

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
  victory: VictoryText;
  squads: readonly ScenarioSquad[];
}
