import React from 'react';

export const AI = Object.freeze({
  HINNY: "Hinny's",
  FGA: 'FGA',
  ANDERSON: 'Anderson',
} as const);

export type AiEngine = (typeof AI)[keyof typeof AI];

export const UPGRADES = Object.freeze({
  HINNY: "Hinny's upg.",
  COMMUNITY: 'Community upg.',
  FGA: 'FGA upg.',
  ANDERSON: 'Anderson upg.',
} as const);

export type UpgradeSource = (typeof UPGRADES)[keyof typeof UPGRADES];

export const ATTACKS = Object.freeze({
  frontArc: <i className="xwiv x-frontarc" />,
  rearArc: <i className="xwiv x-reararc" />,
  turret: <i className="xwiv x-singleturretarc" />,
  doubleturret: <i className="xwiv x-doubleturretarc" />,
});

export interface AttackProfile {
  attack: React.ReactElement;
  damage: number;
}

export interface Ship {
  name: string;
  initiative: number;
  shields: number;
  hull: number;
  attack: readonly AttackProfile[];
  agility: number;
  id: ShipId;
  ai: readonly AiEngine[];
  upgrades: readonly UpgradeSource[];
}

export type ShipId =
  // Ships covered by both FGA and Anderson
  | 'TIELN'
  | 'TIEIN'
  | 'TIESA'
  | 'VT49'
  | 'TIEADVX'
  | 'TIEDEF'
  | 'TIEPH'
  | 'LAMBDA'
  // Anderson-only ships (added in Phase 5)
  | 'TIESK' // TIE/sk Striker
  | 'TIERP' // TIE Reaper
  | 'TIEADVV1' // TIE Advanced v1 (Inquisitor)
  | 'TIERBA' // TIE/rb Aggressor
  | 'TIERBH' // TIE/rb Heavy
  | 'TIECP' // TIE/ca Punisher
  | 'STARWING' // Alpha Class Star Wing
  | 'SITH'; // Sith Infiltrator
// Gozanti-Class Cruiser deferred — needs a separate huge-ship schema

export const Ships: Readonly<Record<ShipId, Ship>> = Object.freeze({
  TIELN: {
    name: 'TIE/ln Starfighter',
    initiative: 2,
    shields: 0,
    hull: 3,
    attack: [{ attack: ATTACKS.frontArc, damage: 2 }],
    agility: 3,
    id: 'TIELN',
    ai: [AI.HINNY, AI.FGA, AI.ANDERSON],
    upgrades: [UPGRADES.FGA, UPGRADES.ANDERSON],
  },
  TIEIN: {
    name: 'TIE/in Interceptor',
    initiative: 2,
    shields: 0,
    hull: 3,
    attack: [{ attack: ATTACKS.frontArc, damage: 3 }],
    agility: 3,
    id: 'TIEIN',
    ai: [AI.HINNY, AI.FGA, AI.ANDERSON],
    upgrades: [UPGRADES.HINNY, UPGRADES.FGA, UPGRADES.ANDERSON],
  },
  TIESA: {
    name: 'TIE/sa Bomber',
    initiative: 2,
    shields: 0,
    hull: 6,
    attack: [{ attack: ATTACKS.frontArc, damage: 2 }],
    agility: 2,
    id: 'TIESA',
    ai: [AI.HINNY, AI.FGA, AI.ANDERSON],
    upgrades: [UPGRADES.HINNY, UPGRADES.FGA, UPGRADES.ANDERSON],
  },
  VT49: {
    name: 'VT-49',
    initiative: 2,
    shields: 4,
    hull: 12,
    attack: [{ attack: ATTACKS.doubleturret, damage: 3 }],
    agility: 0,
    id: 'VT49',
    ai: [AI.HINNY, AI.FGA, AI.ANDERSON],
    upgrades: [UPGRADES.HINNY, UPGRADES.FGA, UPGRADES.ANDERSON],
  },
  TIEADVX: {
    name: 'Tie Advanced x1',
    initiative: 2,
    shields: 2,
    hull: 3,
    attack: [{ attack: ATTACKS.frontArc, damage: 2 }],
    agility: 3,
    id: 'TIEADVX',
    ai: [AI.FGA, AI.ANDERSON],
    upgrades: [UPGRADES.FGA, UPGRADES.ANDERSON],
  },
  TIEDEF: {
    name: 'TIE/D Defender',
    initiative: 2,
    shields: 2,
    hull: 3,
    attack: [{ attack: ATTACKS.frontArc, damage: 2 }],
    agility: 3,
    id: 'TIEDEF',
    ai: [AI.FGA, AI.ANDERSON],
    upgrades: [UPGRADES.FGA, UPGRADES.ANDERSON],
  },
  TIEPH: {
    name: 'TIE/PH Phantom',
    initiative: 3,
    shields: 2,
    hull: 3,
    attack: [{ attack: ATTACKS.frontArc, damage: 3 }],
    agility: 2,
    id: 'TIEPH',
    ai: [AI.FGA, AI.ANDERSON],
    upgrades: [UPGRADES.FGA, UPGRADES.ANDERSON],
  },
  LAMBDA: {
    name: 'Lambda-class T-4A Shuttle',
    initiative: 1,
    shields: 4,
    hull: 10,
    attack: [
      { attack: ATTACKS.frontArc, damage: 3 },
      { attack: ATTACKS.rearArc, damage: 2 },
    ],
    agility: 1,
    id: 'LAMBDA',
    ai: [AI.FGA, AI.ANDERSON],
    upgrades: [UPGRADES.FGA, UPGRADES.ANDERSON],
  },

  // Anderson-only ships (Phase 5). Stats below are read from the rasterized
  // shipcards PDF and need verification during Phase 5b transcription.
  TIESK: {
    name: 'TIE/sk Striker',
    initiative: 2,
    shields: 0,
    hull: 4,
    attack: [{ attack: ATTACKS.frontArc, damage: 3 }],
    agility: 2,
    id: 'TIESK',
    ai: [AI.ANDERSON],
    upgrades: [UPGRADES.ANDERSON],
  },
  TIERP: {
    name: 'TIE Reaper',
    initiative: 2,
    shields: 2,
    hull: 6,
    attack: [{ attack: ATTACKS.frontArc, damage: 3 }],
    agility: 1,
    id: 'TIERP',
    ai: [AI.ANDERSON],
    upgrades: [UPGRADES.ANDERSON],
  },
  TIEADVV1: {
    name: 'TIE Advanced v1 (Inquisitor)',
    initiative: 3,
    shields: 2,
    hull: 3,
    attack: [{ attack: ATTACKS.frontArc, damage: 3 }],
    agility: 3,
    id: 'TIEADVV1',
    ai: [AI.ANDERSON],
    upgrades: [UPGRADES.ANDERSON],
  },
  TIERBA: {
    name: 'TIE/rb Aggressor',
    initiative: 2,
    shields: 0,
    hull: 4,
    attack: [{ attack: ATTACKS.turret, damage: 2 }],
    agility: 2,
    id: 'TIERBA',
    ai: [AI.ANDERSON],
    upgrades: [UPGRADES.ANDERSON],
  },
  TIERBH: {
    name: 'TIE/rb Heavy',
    initiative: 1,
    shields: 0,
    hull: 8,
    attack: [{ attack: ATTACKS.frontArc, damage: 2 }],
    agility: 1,
    id: 'TIERBH',
    ai: [AI.ANDERSON],
    upgrades: [UPGRADES.ANDERSON],
  },
  TIECP: {
    name: 'TIE/ca Punisher',
    initiative: 2,
    shields: 1,
    hull: 6,
    attack: [{ attack: ATTACKS.frontArc, damage: 2 }],
    agility: 1,
    id: 'TIECP',
    ai: [AI.ANDERSON],
    upgrades: [UPGRADES.ANDERSON],
  },
  STARWING: {
    name: 'Alpha Class Star Wing',
    initiative: 2,
    shields: 2,
    hull: 5,
    attack: [{ attack: ATTACKS.frontArc, damage: 3 }],
    agility: 2,
    id: 'STARWING',
    ai: [AI.ANDERSON],
    upgrades: [UPGRADES.ANDERSON],
  },
  SITH: {
    name: 'Sith Infiltrator',
    initiative: 2,
    shields: 4,
    hull: 6,
    attack: [{ attack: ATTACKS.frontArc, damage: 3 }],
    agility: 1,
    id: 'SITH',
    ai: [AI.ANDERSON],
    upgrades: [UPGRADES.ANDERSON],
  },
});

export const Stats = Object.freeze({
  name: 'name',
  initiative: 'initiative',
  shields: 'shields',
  hull: 'hull',
  attack: 'attack',
  agility: 'agility',
  id: 'id',
  selTarget: 'selTarget',
  tokenId: 'tokenId',
  ai: 'ai',
} as const);

export type StatKey = (typeof Stats)[keyof typeof Stats];
