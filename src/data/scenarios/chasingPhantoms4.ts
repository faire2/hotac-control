import type { Scenario } from './types';

const briefing = `"With the prototype Phantom squadron destroyed, we've seen reduced Imperial activity in the Hook Nebula. We must maintain regular patrols to ensure they don't return."

During a routine patrol, your proximity alert panel flashes. A well-equipped squadron of TIE Interceptors emerges from the ion storm all around you — it's an ambush!`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │   ☁  ☁  ☁  ☁  ☁    │   6
        │  ☁  ☁  ☁  ☁  ☁    │
        │   ☁  ☁  ☁  ☁  ☁    │
        │  ☁  ☁  ☁  ☁  ☁    │
        │           A         │
        └─────────────────────┘
             2         1`;

export const chasingPhantoms4: Scenario = {
  id: 'chasing-phantoms-4',
  version: 'V 2.07.04',
  title: 'Revenge',
  subtitle: 'Chasing Phantoms Part IV',
  briefing,
  mapDiagram,
  mapNotes: [
    'Hostile Territory — 10 turns',
    'A: Player setup area (centre)',
    'B: Cloud ×10 (Ion Storm, random layout, Range >1 apart)',
    'Uses the Ion Storm variant rules for Clouds — see p32 of source PDF',
  ],
  map: {
    grid: 9,
    seed: 44,
    setupEdge: false,
    zones: [
      {
        label: 'A',
        hue: 'warn',
        rect: [3, 3, 6, 6],
        tip: 'A — Player setup area: deploy your ships in the central zone; the ambush comes from every vector',
      },
      {
        label: 'B',
        hue: 'holo',
        point: [4.5, 1.6],
        tip: 'B — Ion storm clouds: 10 large clouds, random layout (Range >1 apart). Uses the Ion Storm variant rules.',
      },
    ],
    features: [
      {
        kind: 'ionStorms',
        count: 10,
        region: [0.8, 0.8, 8.2, 8.2],
        seed: 44,
        minDist: 1.8,
        size: 0.9,
        tip: 'Ion storms — large ion clouds scattered across the whole sector; the TIE Interceptors ambush out of them',
      },
    ],
  },
  turnLimit: 10,
  territory: 'hostile',
  objectives: [
    {
      kind: 'primary',
      text: 'Survive the Ambush and Escape: At least one Rebel Ship must survive and jump to hyperspace.',
    },
    {
      kind: 'bonus',
      text: 'Each time an Enemy ship is destroyed, all players gain an extra 1 XP.',
      reward: '+1 XP per kill',
    },
    {
      kind: 'bonus',
      text: 'If all enemy ships are destroyed, mission is no longer considered Hostile Territory and immediately ends. +1 Rebel Victory Point.',
      reward: '+1 Rebel VP',
    },
  ],
  victory: {
    text: `"With the loss of some of their best pilots, the Empire will be unable to regain control of the Hook Nebula." Discard.`,
    next: { kind: 'arcDiscard' },
    rebelPoints: 1,
  },
  defeat: {
    text: '"We\'ve lost contact — Patrol flight! Respond!"',
    next: { kind: 'campaignEnd' },
    imperialPoints: 1,
  },
  squads: [
    {
      name: 'Aces',
      arrival: { kind: 'turn', turn: 1 },
      vector: '1d12',
      aiTag: 'Special',
      tags: [{ kind: 'uniqueApproach' }, { kind: 'huntsPlayer' }],
      composition: {
        1: [{ kind: 'addElite', ship: 'TIEIN' }],
        2: [{ kind: 'addElite', ship: 'TIEIN' }],
        3: [{ kind: 'addElite', ship: 'TIEIN' }],
        4: [{ kind: 'addElite', ship: 'TIEIN' }],
        5: [{ kind: 'addElite', ship: 'TIEIN' }],
        6: [{ kind: 'addElite', ship: 'TIEIN' }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Imperial Ace Setup',
      body: `These Elite Aces have special setup. Each player draws a TIE Interceptor card from the deck and tucks it under their player statcard. Each player should position the Interceptor card so that the visible rows match their own pilot skill: For example, a player with In 3 will tuck the Interceptor card so that all of the rows except those marked In 4+ and In 5+ are visible.

Number or mark each Interceptor so that it is possible to tell which belongs to which player.`,
    },
    {
      title: 'Imperial Ace AI',
      body: `The Aces always use their assigned player ship for movement and combat priority regardless of distance or arc. The Aces will only fire on other Rebels if they cannot attack their intended target.`,
    },
    {
      title: 'Imperial Ace Approach Vectors',
      body: `Each player rolls 1d12 to place their TIE Interceptor. No two ships may share an approach vector; reroll duplicates.`,
    },
    {
      title: 'Ion Storm Interference',
      body: `The severe Ion Storm interferes with Hyperdrive calculations. The Rebels must jump to hyperspace to escape, but they cannot start their hyperdrives until Turn 7.`,
    },
  ],
};
