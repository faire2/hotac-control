import type { Scenario } from './types';

const briefing = `"We don't dare approach the Imperial Garrison on Nulan VI; it's too well defended. However, analysis of the captured shuttle's databanks has revealed another opportunity.

The Empire appears to be engaged in mining operations on one of Nulan's moons, excavating materials used in weapons production. At any given time, the base is covered with cargo containers full of the stuff.

Strafe this complex, taking out anything you can. This should cripple the Empire's mining operations and supply chain."`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │  T              T   │   6
        │       B   B         │
        │     G G G G         │
        │       B   B         │
        │  T              T   │
        │           A         │
        └─────────────────────┘
             2         1 (C)`;

export const captureOfficer3: Scenario = {
  id: 'capture-officer-3',
  version: 'V 2.07.04',
  title: "Miners Strike",
  subtitle: 'Capture the Officer Part III',
  briefing,
  mapDiagram,
  mapNotes: [
    'Friendly Territory — 12 turns',
    'A: Player setup area',
    'B: Cargo Shuttles',
    'C: Cargo Shuttle Escape Edge',
    'Turbolasers [T] begin facing corner A',
    'G: Cargo emplacements (5 hull, 0 agility, count as 2 damage)',
  ],
  turnLimit: 12,
  territory: 'friendly',
  objectives: [
    {
      kind: 'primary',
      text: 'Destroy Imperial Mining Operation: (1) Destroy all Cargo (G) emplacements. (2) At least 1 Rebel ship must escape from a board edge other than Edge C.',
    },
    {
      kind: 'bonus',
      text: 'If all Turbolaser towers are destroyed, all players gain 1 XP.',
      reward: '+1 XP',
    },
    {
      kind: 'bonus',
      text: 'If all cargo shuttles are destroyed, all players gain 2 XP.',
      reward: '+2 XP',
    },
  ],
  victory: {
    text: `"We've taken out a sizable portion of the supplies for the Imperial Garrison on Nulan VI. This is certain to help us in wrestling the system from the Empire's grasp."`,
    next: { kind: 'arcDiscard' },
    rebelPoints: 1,
  },
  defeat: {
    text: `"Negative, our surprise attack barely made a dent in the Empire's mining operation. Regroup and return to base. We won't get another shot."`,
    next: { kind: 'reshuffle' },
    imperialPoints: 1,
  },
  requiredModels: ['Lambda-class T-4A Shuttle'],
  squads: [
    {
      name: 'Cargo',
      arrival: { kind: 'setup' },
      vector: 'B',
      aiTag: 'Special',
      composition: {
        1: [{ kind: 'add', ship: 'LAMBDA' }],
        4: [{ kind: 'add', ship: 'LAMBDA' }],
      },
    },
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: [2, 3],
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'setup' },
      vector: [4, 5],
      aiTag: 'Attack',
      composition: {
        2: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Gamma',
      arrival: { kind: 'rolledTurn', turn: 6, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'replaceRandom', gate: { rebelInitGte: 4 } }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replaceRandom', gate: { rebelInitGte: 5 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'replaceRandom', gate: { rebelInitGte: 3 } }],
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
        4: [{ kind: 'replaceRandom', gate: { rebelInitGte: 3 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'replaceRandom', gate: { rebelInitGte: 4 } }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Landed Cargo Shuttles',
      body: `These ships are placed during setup but begin the game landed (you can show this by folding up the shuttle's wings and removing the flight pegs from its base). While landed, ships do not activate, attack, interfere with movement, or roll defense dice when attacked.`,
    },
    {
      title: 'Cargo Shuttle Takeoff / AI',
      body: `At the start of Turn 3, any cargo shuttles in play will take off. Each cargo shuttle has the Flee AI — treat Edge C as their target, and attempt to fly off that edge of the board. They always use the fastest speed available for the bearing chosen. They will still attack Rebels ships if able.`,
    },
    {
      title: 'Hazardous Cargo',
      body: `The Rebels do not know the contents of the various cargo containers, but some contain explosive munitions.

Each time a cargo emplacement is destroyed, roll 1 attack die. On a :crit: result, all ships at Range 1 of the emplacement suffer 1 face-up damage card (or lose 1 Shield), and other emplacements at Range 1 suffer 2 damage. On any other result, there is no effect.

A player gains an additional 1 XP for destroying a Cargo emplacement.`,
    },
    {
      title: 'Ground Mission',
      body: `Ships cannot jump to hyperspace within the moon's gravity field. To escape the mission area, players must escape from any board edge (other than edge C) by the end of Turn 12.`,
    },
  ],
};
