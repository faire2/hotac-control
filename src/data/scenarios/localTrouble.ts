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
    rebel: '"Great work pilots! Our convoy is safe from harm. Now we can begin operations against Empire in this system." — Play the full campaign!',
    imperial: '"That Imperial patrol has located our convoy; call off the operation. Our base in this system must remain a secret." — Replay this mission, or begin the full campaign.',
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
      noUpgrades: true,
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
};
