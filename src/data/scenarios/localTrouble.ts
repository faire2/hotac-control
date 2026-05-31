import type { Scenario } from './types';

const briefing = `"Welcome to the Outer Rim, pilots. Our convoy is currently en route to a hidden Rebel Base in the Parmel Sector, and you'll be on escort duty until we arrive.

We've picked up a group of enemy signals in the nearby asteroid field; likely an Imperial patrol. Intercept those ships, and keep them away from the convoy until we can execute a hyperspace jump to ensure our base remains hidden.

Good luck!"`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │                     │   6
        │     ·    ·    ·     │
        │          B          │
        │     ·    ·    ·     │
        │                     │
        │           A         │
        └─────────────────────┘
             2         1`;

export const localTrouble: Scenario = {
  id: 'local-trouble',
  version: 'V 2.07.04',
  title: 'Local Trouble',
  subtitle: 'Introductory Mission',
  briefing,
  mapDiagram,
  mapNotes: [
    'Friendly Territory — 10 turns',
    'A: Player setup edge',
    'B: Asteroids ×6, random layout (Range >1 apart, Range >2 from edge)',
  ],
  map: {
    grid: 9,
    seed: 7,
    setupEdge: { side: 'bottom', label: 'A', depth: 1.1 },
    zones: [
      {
        id: 'B',
        label: 'B',
        hue: 'holo',
        rect: [2, 2, 7, 7],
        tip: 'B — Asteroid field: 5×5 central zone, place 6 asteroids (Range >1 apart, >2 from any edge)',
      },
    ],
    features: [{ kind: 'asteroids', count: 6, in: 'B', seed: 33, minDist: 1.6 }],
    vectors: [
      { n: 2, side: 'left', t: 1 / 3 },
      { n: 1, side: 'left', t: 2 / 3 },
      { n: 3, side: 'top', t: 1 / 3 },
      { n: 4, side: 'top', t: 2 / 3 },
      { n: 5, side: 'right', t: 1 / 3 },
      { n: 6, side: 'right', t: 2 / 3 },
    ],
  },
  turnLimit: 10,
  territory: 'friendly',
  objectives: [
    {
      kind: 'primary',
      text: 'Engage Imperial Forces: at least one Rebel ship must survive and remain in play at the end of Turn 10.',
    },
    {
      kind: 'bonus',
      text: 'If all Imperial ships are destroyed, all players gain 1 XP.',
      reward: '+1 XP',
    },
    {
      kind: 'bonus',
      text: 'If no Rebel ships are destroyed, all players gain 1 XP.',
      reward: '+1 XP',
    },
  ],
  victory: {
    text: '"Great work pilots! Our convoy is safe from harm. Now we can begin operations against Empire in this system." — Play the full campaign!',
    next: { kind: 'campaignStart' },
  },
  defeat: {
    text: '"That Imperial patrol has located our convoy; call off the operation. Our base in this system must remain a secret." — Replay this mission, or begin the full campaign.',
    next: { kind: 'replay' },
  },
  squads: [
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 3,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'setup' },
      vector: 4,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Gamma',
      arrival: { kind: 'turn', turn: 4 },
      vector: '1d6',
      aiTag: 'Attack',
      tags: [{ kind: 'noUpgrades' }],
      composition: {
        1: [{ kind: 'add', ship: 'TIEIN' }],
        4: [{ kind: 'add', ship: 'TIEIN' }],
      },
    },
    {
      name: 'Delta',
      arrival: { kind: 'turn', turn: 7 },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Your First Mission',
      body: `This mission is only intended for a group of new players just starting a campaign as X-wing or Y-wing pilots of Initiative 2. As such, this squad composition table doesn't have scaling for players with higher pilot skill.`,
    },
    {
      title: 'TIE Interceptors',
      body: `The TIE Interceptors in Gamma squad do not have upgrades, and therefore you do not need to draw an Imperial Pilot card for them.

However, unlike TIE Fighters, notice they do have "linked" actions.`,
    },
    {
      title: 'Reminders',
      body: `As you play your first game against the AI, concentrate on how it operates. Take note of the different action selection for TIE Fighters and TIE Interceptors.

Don't forget to track experience points when players deal damage to, or destroy, enemy ships.

The mission is set in Friendly Territory, so if things go badly, damaged players can escape from any board edge.`,
    },
  ],
};
