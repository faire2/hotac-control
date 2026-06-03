import type { Scenario } from './types';

const briefing = `"During our recovery of the Trellisk's crew, we witnessed a new Imperial fighter equipped with a cloaking device. Luckily, our spies have confirmed only a single squadron of new TIE Phantoms was deployed to this sector for field testing.

We've been unable to track their movements, but they seem to favor operating in the Hook nebula's ion storms. We've loaded the Bright Hope with sensor equipment, and when the ion storm dissipates, we'll lure the Phantoms out.

That's where you come in."`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │  S        S    S    │   6
        │      ·  ·  ·        │
        │     [Bright Hope]   │
        │      ·  ·  ·        │
        │                     │
        │           A         │
        └─────────────────────┘
             2         1`;

export const chasingPhantoms2: Scenario = {
  id: 'chasing-phantoms-2',
  version: 'V 2.07.04',
  title: 'Bait',
  subtitle: 'Chasing Phantoms Part II',
  briefing,
  mapDiagram,
  mapNotes: [
    'Neutral Territory — 10 turns',
    'A: Player setup area',
    'B: Rebel Transport (anywhere inside A)',
    'C: Asteroid ×6, random layout (Range >1 apart / from edge / transport)',
  ],
  map: {
    grid: 9,
    seed: 42,
    setupEdge: false,
    zones: [
      {
        label: 'A',
        hue: 'warn',
        rect: [3, 3, 6, 6],
        tip: 'A — Player setup area: deploy your ships here; the Bright Hope (transport) starts anywhere inside',
      },
      {
        label: 'C',
        hue: 'holo',
        point: [8.4, 4.5],
        tip: 'C — Asteroid field: 6 rocks, random layout (Range >1 apart / from edges / from the transport)',
      },
    ],
    features: [
      {
        kind: 'asteroids',
        count: 6,
        region: [0.9, 0.9, 8.1, 8.1],
        seed: 42,
        minDist: 2.4,
      },
    ],
    tokens: [
      {
        kind: 'transport',
        at: [4.5, 4.5],
        angle: -30,
        label: 'B',
        tip: 'Bright Hope — the GR-75 sensor transport (B) begins in the centre setup area',
      },
    ],
  },
  turnLimit: 10,
  territory: 'enemy',
  objectives: [
    {
      kind: 'primary',
      text: 'Defeat the TIE Phantom Elite and Survive: (1) Destroy the TIE Phantom Elite. (2) The transport and at least one Rebel fighter must survive (escape by jumping to Hyperspace, or remain in play at the end of Turn 10).',
    },
    {
      kind: 'bonus',
      text: 'If all of the Shuttles in the Support squadron are destroyed, all players gain 2 XP.',
      reward: '+2 XP',
    },
  ],
  victory: {
    text: `"The transport's sensor team got a fix on the enemy's hyperspace vector; we can use this to find their home base, and bring the fight to them."`,
    next: { kind: 'arcLink', missionId: 'chasing-phantoms-3' },
  },
  defeat: {
    text: `"We've failed to isolate the enemy's approach vector, and we can't risk another Transport as bait. Those TIE Phantoms will hunt us freely." Each player loses their most expensive Upgrade.`,
    next: { kind: 'reshuffle' },
    imperialPoints: 1,
  },
  randomPoolExclusions: ['LAMBDA', 'TIEPH'],
  allies: [
    { ship: 'GR75', displayName: 'Bright Hope', startingShields: 0 },
  ],
  squads: [
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replaceRandom', gate: { rebelInitGte: 2 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'replaceRandom', gate: { rebelInitGte: 5 } }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'setup' },
      vector: '1d6+6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'replaceRandom', gate: { rebelInitGte: 5 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'replaceRandom', gate: { rebelInitGte: 4 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Support A',
      arrival: { kind: 'turn', turn: 3 },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'LAMBDA' }],
      },
    },
    {
      name: 'Support B',
      arrival: { kind: 'turn', turn: 3 },
      vector: { kind: 'oppositeOf', squadName: 'Support A' },
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'LAMBDA' }],
      },
    },
    {
      name: 'Elite',
      arrival: { kind: 'turn', turn: 4 },
      vector: '1d12',
      aiTag: 'Special',
      composition: {
        1: [{ kind: 'addElite', ship: 'TIEPH' }],
      },
    },
    {
      name: 'Gamma',
      arrival: { kind: 'rolledTurn', turn: 6, roll: '1d6' },
      vector: '1d6',
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
      name: 'Delta',
      arrival: { kind: 'rolledTurn', turn: 8, roll: '1d6' },
      vector: '1d6+6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'replaceRandom', gate: { rebelInitGte: 4 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'replaceRandom', gate: { rebelInitGte: 3 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Transport Setup',
      body: `The GR-75 Rebel Transport is equipped with the upgrades below, and begins with 0 Energy. During each activation phase, it gains 2 Energy instead of moving.

- Bright Hope
- Targeting Coordinator: You may spend 1 Energy to choose 1 friendly ship at Range 0-2. Acquire a Target Lock, and then pass the lock on to that friendly ship.
- Repair Team: Spend 1 or more Energy to repair that many Face-Up damage cards.
- Comms Booster: Spend 1 Energy to remove all Stress tokens from a friendly ship at Range 0-1.`,
    },
    {
      title: 'Transport Escape',
      body: `Once the TIE Phantom is destroyed, the Transport may escape by jumping to hyperspace: at the end of the combat phase, spend 4 Energy to jump.`,
    },
    {
      title: 'TIE Phantom Elite',
      body: `When deployed, the TIE Phantom begins cloaked. It will target the Rebel ship with the highest pilot skill, and will only fire on a different target if it cannot get a shot, or there is a different target at Range 1.`,
    },
    {
      title: 'Enemy Attack AI (All Ships)',
      body: `Enemy ships that can attack a section of the transport that does not have a Reinforce token will attack the transport.`,
    },
    {
      title: 'Support Shuttles',
      body: `These shuttles do not draw Pilot cards. Modified as support craft for field testing the TIE Phantom squadron, each support ship is an Omicron Group Pilot (In 1) equipped with:

- Anti-Pursuit Lasers: After an Enemy ship executes a maneuver that causes it to overlap your ship, roll 1 Attack die. On a Hit or Crit result, the Enemy ship suffers 1 damage.
- Prototype Stygium Field Generator: The TIE Phantom cannot be targeted by Jam actions. When the TIE Phantom decloaks, it gains an Evade token (one for each shuttle in play).`,
    },
  ],
};
