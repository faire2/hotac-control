import type { Scenario } from './types';

const briefing = `"One of the test pilots for the Empire's new space superiority fighter, the TIE Defender, is a Rebel sympathizer. She's been in contact with our operatives and wishes to defect with a stolen prototype.

The best opportunity for us to help her escape intact will be during her squadron's training exercises in the Parein system.

We'll jump in, make contact and provide cover while she escapes. However, she won't know we're here to cover her, and we won't know which of the prototypes is hers, until we can make visual contact."`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │  S      [P P P P]   │   6
        │      ·  ·  ·  ·     │
        │     ·  ·  ·  ·      │
        │      ·  ·  ·  ·     │
        │                     │
        │           A         │
        └─────────────────────┘
             2         1`;

export const defection2: Scenario = {
  id: 'defection-2',
  version: 'V 2.07.04',
  title: 'Defector',
  subtitle: 'Defection Part II',
  briefing,
  mapDiagram,
  mapNotes: [
    'Hostile Territory — 10 turns',
    'A: Player setup edge',
    'B: Asteroids ×6 (random layout, Range >2 from edges, Range >1 apart)',
    'P: Prototype TIE Defender squad',
  ],
  turnLimit: 10,
  territory: 'hostile',
  objectives: [
    {
      kind: 'primary',
      text: 'Help the Defector Escape: (1) Make contact with the Defector. (2) The Defector jumps to hyperspace while there is at least one Rebel ship still in play.',
    },
    {
      kind: 'bonus',
      text: 'Reward: each player gains a free Modification, Missile, or Cannon upgrade.',
      reward: '+1 free upgrade',
    },
    {
      kind: 'bonus',
      text: 'Each pilot that scans a TIE Defender gains 1 XP.',
      reward: '+1 XP per scan',
    },
    {
      kind: 'bonus',
      text: `The pilot who performs the most protect actions on the Defector's ship (once allied) gains 2 XP. If tied, all tied players gain 1 XP.`,
      reward: '+2 XP',
    },
  ],
  victory: {
    text: `"We've captured a TIE Defender! We may be able to adapt some of this ship's advanced weapons technology."`,
    next: { kind: 'arcLink', missionId: 'defection-3' },
    unlocksShipTypes: ['TIEDEF'],
  },
  defeat: {
    text: `"The Defector is dead, and took the secrets of the prototype TIE Defender with her. All of this effort has been a waste."`,
    next: { kind: 'reshuffle' },
    imperialPoints: 1,
  },
  requiredModels: ['TIE/d Defender', 'Lambda-class T-4A Shuttle'],
  randomPoolExclusions: ['TIEDEF'],
  squads: [
    {
      name: 'Prototype',
      arrival: { kind: 'setup' },
      vector: 4,
      aiTag: 'Special',
      composition: {
        1: [{ kind: 'add', ship: 'TIEDEF' }],
        2: [{ kind: 'add', ship: 'TIEDEF' }],
        4: [{ kind: 'add', ship: 'TIEDEF' }],
        6: [{ kind: 'add', ship: 'TIEDEF' }],
      },
    },
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 1,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replaceRandom', gate: { rebelInitGte: 5 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'replaceRandom', gate: { rebelInitGte: 4 } }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'turn', turn: 4 },
      vector: 6,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replaceRandom', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'replaceRandom', gate: { rebelInitGte: 3 } }],
      },
    },
    {
      name: 'Gamma',
      arrival: { kind: 'turn', turn: 4 },
      vector: 3,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'LAMBDA' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Delta',
      arrival: { kind: 'rolledTurn', turn: 8, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'replaceRandom', gate: { rebelInitGte: 5 } }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replaceRandom', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIEIN' }],
        6: [{ kind: 'replaceRandom', gate: { rebelInitGte: 3 } }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Defector Setup',
      body: `During setup, put a number token for each TIE Defender in the Prototype squadron into the draw bag. Start with number 1 and add a number for each additional ship (numbers 1-4 for 6p).`,
    },
    {
      title: 'Making Contact with the Defector',
      body: `Before the Defector can switch sides, the Rebels must identify her ship by transmitting a short-range coded message confirming their rescue plans.

To transmit the message, any Rebel ship may perform the Scan action on a TIE Defender at Range 1. Then, pull a number token from the bag. If the number 1 is drawn, this TIE Defender is the Defector. If any other number is drawn, assign it to that TIE Defender; TIE Defenders with number tokens cannot be scanned.`,
    },
    {
      title: 'Defecting',
      body: `Once the Defector has been identified, she immediately joins the Rebels and players may choose her attack targets. At the start of the following turn, the players may plan the Defector's dial and actions collectively.

Rebel players may also use the Protect action on the Defector once she is an ally.`,
    },
    {
      title: 'Prototype Squad AI',
      body: `Once the Defector has changed sides, other Elite enemy ships in the Prototype squad change their target priority to Strike, with the Defector as their target.`,
    },
  ],
};
