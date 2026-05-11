import type { Scenario } from './types';

const briefing = `"We've just received a distress call from the Trellisk, one of our supply ships. They were ambushed enroute to U'dray and the crew was forced to abandon ship in escape pods.

We're mounting search and rescue operations immediately, but the region is subject to frequent ion storms which will make things difficult for us.

Get out there and find them. It's a good bet that whatever destroyed them is still nearby."`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │  ☁ ☁ ☁ ☁ ☁ ☁ ☁    │   6
        │   ☁ B ☁ B  ☁ B     │
        │  ☁ ☁ ☁ ☁ ☁ ☁ ☁    │
        │   ☁ B ☁ B  ☁ B     │
        │                     │
        │           A         │
        └─────────────────────┘
             2         1`;

export const chasingPhantoms1: Scenario = {
  id: 'chasing-phantoms-1',
  version: 'V 2.07.04',
  title: 'Needle in a Hay Stack',
  subtitle: 'Chasing Phantoms Part I',
  briefing,
  mapDiagram,
  mapNotes: [
    'Neutral Territory — 12 turns',
    'A: Player setup / escape edge',
    'B: Distress Signal Tokens (sample layout)',
    'C: Ion Storm ×10 (random layout, Range >1 apart)',
  ],
  turnLimit: 12,
  territory: 'enemy',
  objectives: [
    {
      kind: 'primary',
      text: 'Recover the Escape Pod: (1) Scan the tracking tokens to reveal the Escape Pod token (#12). (2) The Recovery ship loads the Escape Pod by docking with it. (3) The Recovery ship escapes from edge A.',
    },
    {
      kind: 'bonus',
      text: 'If the Container token is recovered, all players gain one free secondary weapon upgrade of their choice.',
      reward: '+1 secondary weapon',
    },
    {
      kind: 'bonus',
      text: 'The pilot who performs the most protect actions on the Recovery Ship gains 2 XP. If tied, all tied players gain 1 XP.',
      reward: '+2 XP',
    },
  ],
  victory: {
    text: `"We've recovered the crew, but now we've got a new problem — a cloaked Imperial fighter."`,
    next: { kind: 'arcLink', missionId: 'chasing-phantoms-2' },
    unlocksShipTypes: ['TIEPH'],
  },
  defeat: {
    // Per the PDF, both outcomes lead to "Bait" — the recovery itself either
    // way reveals the cloaking-device threat. Modeled as a successful link
    // both ways with no points.
    text: `"Our supply lines are struggling, but now we've discovered a bigger threat to the Alliance."`,
    next: { kind: 'arcLink', missionId: 'chasing-phantoms-2' },
  },
  requiredModels: ['Outer Rim Smuggler', 'TIE/ph Phantom'],
  allies: [
    { ship: 'OUTER_RIM_SMUGGLER', displayName: 'Recovery Ship' },
  ],
  squads: [
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 3,
      aiTag: 'Strike',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'addRandom', gate: { rebelInitGte: 5 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'addRandom', gate: { rebelInitGte: 4 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'setup' },
      vector: 4,
      aiTag: 'Strike',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'addRandom', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'addRandom', gate: { rebelInitGte: 3 } }],
      },
    },
    {
      name: 'Gamma',
      arrival: { kind: 'rolledTurn', turn: 5, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Strike',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Delta',
      arrival: { kind: 'rolledTurn', turn: 8, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Strike',
      composition: {
        1: [{ kind: 'addRandom' }],
        3: [{ kind: 'addRandom' }],
        5: [{ kind: 'addRandom' }],
        6: [{ kind: 'addRandom' }],
      },
    },
    {
      name: 'Phantom',
      // Mission introduces TIE Phantoms — once this mission has been completed,
      // future "Less random ships" mode rolls can resolve to TIEPH.
      arrival: { kind: 'setup' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIEPH' }],
        2: [{ kind: 'add', ship: 'TIEPH' }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Recovery Ship',
      body: `Your squadron has been assigned a Recovery Ship to bring home any survivors and cargo you find, represented by an Outer Rim Smuggler (In 1). The players decide as a team how to plan this ship's dial each round, and the ship may perform actions (including scan) and attacks as normal. Players do not gain any XP for Enemy ships destroyed by the Recovery Ship. Players may also use the Protect action on the Recovery ship to ensure it returns home safely.

Each time a pilot scans a Tracking token, that pilot gains 1 XP. The Recovery ship may perform a Dock maneuver to pick up revealed Escape Pod and Container tokens.`,
    },
    {
      title: 'Phantom Squad',
      body: `When the Escape Pod token is placed, this squad arrives the following turn.`,
    },
    {
      title: 'Strike AI',
      body: `Enemy ships with the Strike AI target the recovery ship for movement. If they cannot attack it, they will fire on the nearest Rebel ship as usual.`,
    },
    {
      title: 'Tracking Token Setup',
      body: `Use 4 Tracking tokens + 1 per player. Place one in the center of each ion cloud, starting with the ion clouds furthest from edge A. Prepare the draw bag with the numbers 9-12. Add 1 other number per player.`,
    },
    {
      title: 'Identifying Signal Tokens',
      body: `The ion clouds make identifying signals difficult; each possible distress signal has to be verified at close range. A Rebel ship may perform a Scan action on a Tracking token at Range 1 to remove it. Draw & set aside a number from the bag:
- 12: Place Escape Pod token
- 11: Place Container token
- Others: False signal`,
    },
  ],
};
