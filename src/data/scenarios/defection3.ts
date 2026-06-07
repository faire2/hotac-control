import type { Scenario } from './types';

const briefing = `"According to intel from the Imperial Defector, pilot candidates for the rest of the new TIE Defenders are nearing the completion of their training program.

Today, the squadron is conducting combat exercises at a secret location in Imperial-controlled space, but our spies have provided us with the coordinates.

We can use this information to strike a major blow to the Empire's operations in the Parein sector, and cripple their training program."`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │  S    [Instructor]  │   6
        │  · A · B · G · D ·  │
        │  · · · · · · · ·    │
        │      · · ·          │
        │                     │
        │           E         │
        └─────────────────────┘
             2         1`;

export const defection3: Scenario = {
  id: 'defection-3',
  version: 'V 2.07.04',
  title: 'Pride of the Empire',
  subtitle: 'Defection Part III',
  briefing,
  mapDiagram,
  mapNotes: [
    'Neutral Territory — 12 turns',
    'A: Player setup / escape area (any edge)',
    'B: Asteroids ×6 (random layout, Range >1 apart / from edges / enemies)',
    'C / D / E / F: training-squad approach points',
    'Centre: the Instructor shuttle (Lambda)',
  ],
  map: {
    grid: 9,
    seed: 23,
    setupEdge: false,
    zones: [
      // Imperial-controlled space: red border frame (corners owned by the
      // top/bottom bands only, so they aren't double-painted).
      { hue: 'danger', rect: [0, 0, 9, 1], border: false, tip: 'Imperial-controlled space — board edge' },
      { hue: 'danger', rect: [0, 8, 9, 9], border: false, tip: 'Imperial-controlled space — board edge' },
      { hue: 'danger', rect: [0, 1, 1, 8], border: false, tip: 'Imperial-controlled space — board edge' },
      { hue: 'danger', rect: [8, 1, 9, 8], border: false, tip: 'Imperial-controlled space — board edge' },
      // A: player setup / escape (any edge). B: asteroid field label, placed
      // just inside the asteroid region so the badge sits over the rocks.
      { label: 'A', hue: 'warn', point: [0.55, 5], tip: 'A — Player setup / escape area (any edge)' },
      { label: 'B', hue: 'holo', point: [1.7, 1.7], tip: 'B — Asteroids ×6 (random layout, Range >1 apart / from edges / enemies)' },
    ],
    // Lettered squad approach vectors — chevrons on the inner intersections in a
    // clockwise pinwheel: C→west, F→north, E→east, D→south.
    approaches: [
      { label: 'C', at: [3, 3], dir: 'w' },
      { label: 'F', at: [6, 3], dir: 'n' },
      { label: 'D', at: [3, 6], dir: 's' },
      { label: 'E', at: [6, 6], dir: 'e' },
    ],
    features: [{ kind: 'asteroids', count: 6, region: [1.6, 1.6, 7.4, 7.4], seed: 91, minDist: 1.9 }],
    tokens: [
      {
        kind: 'ship',
        ship: 'LAMBDA',
        at: [4.5, 4.5],
        tip: 'Instructor shuttle (Lambda) — its training crew coordinates the trainees (Quality Education)',
      },
    ],
  },
  turnLimit: 12,
  territory: 'enemy',
  objectives: [
    {
      kind: 'primary',
      text: 'Cripple Training Squadrons: Rebels must destroy all ships in at least 3 enemy squadrons.',
    },
    {
      kind: 'bonus',
      text: 'Reward: For each enemy squadron that is completely destroyed, all players gain 1 XP.',
      reward: '+1 XP per squad',
    },
    {
      kind: 'bonus',
      text: 'If all TIE Defenders are destroyed, remove all TIE Defender cards from the Imperial Pilot deck.',
      reward: 'Remove TIE Defenders from deck',
    },
  ],
  victory: {
    text: `"Some of the Empire's most promising new pilots were lost today. If only they could have joined the Rebellion instead."`,
    next: { kind: 'arcDiscard' },
    rebelPoints: 1,
  },
  defeat: {
    text: `"This was our only chance to cripple the training program. Now, the Empire will continue in another secret location and you can bet we won't find them a second time."`,
    next: { kind: 'reshuffle' },
    imperialPoints: 1,
  },
  randomPoolExclusions: ['TIEDEF'],
  squads: [
    {
      name: 'Instructor',
      arrival: { kind: 'setup' },
      vector: 'C',
      approachLabel: 'Diagonal',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'LAMBDA' }],
        4: [{ kind: 'addShields', count: 2 }],
        5: [{ kind: 'addShields', count: 2 }],
        6: [{ kind: 'addShields', count: 2 }],
      },
    },
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 'C',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'addElite', ship: 'TIEDEF' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'setup' },
      vector: 'D',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'addElite', ship: 'TIEDEF' }],
      },
    },
    {
      name: 'Gamma',
      arrival: { kind: 'setup' },
      vector: 'E',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'addElite', ship: 'TIEDEF' }],
        5: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Delta',
      arrival: { kind: 'setup' },
      vector: 'F',
      aiTag: 'Attack',
      composition: {
        2: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'addElite', ship: 'TIEDEF' }],
      },
    },
    {
      name: 'Epsilon',
      arrival: { kind: 'turn', turn: 8 },
      vector: '1d12',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIEIN' }],
        2: [{ kind: 'add', ship: 'TIELN', gate: { rebelInitGte: 5 } }],
        3: [{ kind: 'add', ship: 'TIEIN' }],
        4: [{ kind: 'add', ship: 'TIELN', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIEIN' }],
        6: [{ kind: 'add', ship: 'TIELN', gate: { rebelInitGte: 3 } }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Surprise Attack',
      body: `The Imperial training squad is unprepared to deal with the squad of Rebel ships exiting hyperspace around them. For the first turn, enemy ships do not move or perform actions.`,
    },
    {
      title: 'Quality Education',
      body: `Among the best in the sector, the shuttle's training crew is well-coordinated with their trainees. Whenever an AI ship within Range 1 of the shuttle rolls dice, it may convert all focus results to successes (:hit: or :crit:), as if it always has a focus token.`,
    },
  ],
};
