import React from 'react';

export const AI = Object.freeze({
  HINNY: "Hinny's",
  FGA: 'FGA',
} as const);

export type AiEngine = (typeof AI)[keyof typeof AI];

export const UPGRADES = Object.freeze({
  HINNY: "Hinny's upg.",
  COMMUNITY: 'Community upg.',
  FGA: 'FGA upg.',
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
  | 'TIELN'
  | 'TIEIN'
  | 'TIESA'
  | 'VT49'
  | 'TIEADVX'
  | 'TIEDEF'
  | 'TIEPH'
  | 'LAMBDA';

export const Ships: Readonly<Record<ShipId, Ship>> = Object.freeze({
  TIELN: {
    name: 'TIE/ln Starfighter',
    initiative: 2,
    shields: 0,
    hull: 3,
    attack: [{ attack: ATTACKS.frontArc, damage: 2 }],
    agility: 3,
    id: 'TIELN',
    ai: [AI.HINNY, AI.FGA],
    upgrades: [UPGRADES.FGA],
  },
  TIEIN: {
    name: 'TIE/in Interceptor',
    initiative: 2,
    shields: 0,
    hull: 3,
    attack: [{ attack: ATTACKS.frontArc, damage: 3 }],
    agility: 3,
    id: 'TIEIN',
    ai: [AI.HINNY, AI.FGA],
    upgrades: [UPGRADES.HINNY, UPGRADES.FGA],
  },
  TIESA: {
    name: 'TIE/sa Bomber',
    initiative: 2,
    shields: 0,
    hull: 6,
    attack: [{ attack: ATTACKS.frontArc, damage: 2 }],
    agility: 2,
    id: 'TIESA',
    ai: [AI.HINNY, AI.FGA],
    upgrades: [UPGRADES.HINNY, UPGRADES.FGA],
  },
  VT49: {
    name: 'VT-49',
    initiative: 2,
    shields: 4,
    hull: 12,
    attack: [{ attack: ATTACKS.doubleturret, damage: 3 }],
    agility: 0,
    id: 'VT49',
    ai: [AI.HINNY, AI.FGA],
    upgrades: [UPGRADES.HINNY, UPGRADES.FGA],
  },
  TIEADVX: {
    name: 'Tie Advanced x1',
    initiative: 2,
    shields: 2,
    hull: 3,
    attack: [{ attack: ATTACKS.frontArc, damage: 2 }],
    agility: 3,
    id: 'TIEADVX',
    ai: [AI.FGA],
    upgrades: [UPGRADES.FGA],
  },
  TIEDEF: {
    name: 'TIE/D Defender',
    initiative: 2,
    shields: 2,
    hull: 3,
    attack: [{ attack: ATTACKS.frontArc, damage: 2 }],
    agility: 3,
    id: 'TIEDEF',
    ai: [AI.FGA],
    upgrades: [UPGRADES.FGA],
  },
  TIEPH: {
    name: 'TIE/PH Phantom',
    initiative: 3,
    shields: 2,
    hull: 3,
    attack: [{ attack: ATTACKS.frontArc, damage: 3 }],
    agility: 2,
    id: 'TIEPH',
    ai: [AI.FGA],
    upgrades: [UPGRADES.FGA],
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
    ai: [AI.FGA],
    upgrades: [UPGRADES.FGA],
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
