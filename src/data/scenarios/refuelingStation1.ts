import type { Scenario } from './types';

const briefing = `"We've received an encrypted message from one of our Rebel Operative teams in the Argus system. They were engaged in covert reconnaissance of Imperial facilities in a nearby asteroid field.

Their HWK-290 has sustained heavy damage to its weapons and hyperdrive. They won't make it back in one piece with their findings unless we scramble some fighter cover.

There's a good bet the Empire has already dispatched fighters to intercept them too."`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │     S          A    │   6
        │                     │
        │     · · · · · ·     │
        │     · · E · · ·     │
        │                     │
        │           B         │
        └─────────────────────┘
             2         1`;

export const refuelingStation1: Scenario = {
  id: 'refueling-station-1',
  version: 'V 2.07.04',
  title: 'Rescue Rebel Operatives',
  subtitle: 'The Refueling Station Part I',
  briefing,
  mapDiagram,
  mapNotes: [
    'Neutral Territory — 10 turns',
    'A: Rebel Operative HWK-290 setup edge',
    'B: Player setup / escape edge (HWK escapes off this edge)',
    'C: Asteroids ×6, random layout (Range >1 apart, Range >2 from edge)',
  ],
  map: {
    grid: 9,
    seed: 21,
    setupEdge: false,
    zones: [
      {
        label: 'A',
        hue: 'danger',
        band: { side: 'top', depth: 1 },
        tip: 'A — Rebel Operative HWK-290 setup edge',
      },
      {
        label: 'B',
        hue: 'danger',
        band: { side: 'bottom', depth: 1 },
        tip: 'B — Player setup / escape edge: deploy here; the HWK escapes off this edge',
      },
      {
        id: 'C',
        label: 'C',
        hue: 'holo',
        rect: [2, 2.5, 7, 6.5],
        tip: 'C — Asteroids ×6: random layout, Range >1 apart and Range >2 from any edge',
      },
    ],
    features: [{ kind: 'asteroids', count: 6, in: 'C', seed: 21, minDist: 1.7 }],
    tokens: [
      {
        kind: 'ship',
        ship: 'HWK290',
        at: [4.5, 1.5],
        tip: 'Rebel Operatives (HWK-290, In 1) — begins here, must escape off edge B',
      },
    ],
    vectors: [
      { n: 1, side: 'left', t: 2 / 3 },
      { n: 2, side: 'left', t: 1 / 3 },
      { n: 3, side: 'top', t: 1 / 3 },
      { n: 4, side: 'top', t: 2 / 3 },
      { n: 5, side: 'right', t: 1 / 3 },
      { n: 6, side: 'right', t: 2 / 3 },
    ],
  },
  turnLimit: 10,
  territory: 'enemy',
  objectives: [
    {
      kind: 'primary',
      text: 'The HWK-290 must escape from your setup edge.',
    },
    {
      kind: 'bonus',
      text: 'If all Elite enemy ships are destroyed, all players gain 2 XP.',
      reward: '+2 XP',
    },
    {
      kind: 'bonus',
      text: `The pilot who performs the most protect actions on the Rebel Operatives' HWK gains 2 XP. If two or more players are tied, all tied players gain 1 XP.`,
      reward: '+2 XP',
    },
  ],
  victory: {
    text: '"The operatives have safely retreated, bringing us valuable intel of the Argus System. We must mount another operation to further investigate in force."',
    next: { kind: 'arcLink', missionId: 'refueling-station-2' },
  },
  defeat: {
    text: `"We've lost two of our best operatives, their craft, and valuable intelligence data. The Empire is hiding something in that asteroid field — we need to know what!"`,
    next: { kind: 'reshuffle' },
  },
  allies: [
    {
      ship: 'HWK290',
      displayName: 'Rebel Operatives',
      initiative: 1,
      // "...a total number of shields equal to the number of players."
      startingShields: 0,
      bonusShieldsPerPlayers: 1,
      // "...Speed 4 maneuvers are treated as red."
      dialMods: [{ speed: 4, difficulty: 'red' }],
      // "...it is unable to perform the Boost action."
      removeActions: ['boost'],
    },
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
        4: [{ kind: 'add', ship: 'TIELN' }],
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
        5: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Elite',
      arrival: { kind: 'rolledTurn', turn: 3, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        // 🏅⚙ — one Elite of the squad-consistent random ship type. Single
        // cell in the PDF → applies at every player count via the column-walk.
        1: [{ kind: 'addElite' }],
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
        3: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 3 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Delta',
      arrival: { kind: 'rolledTurn', turn: 7, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Strike',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 5 } }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Rebel Operative Setup',
      body: `The Operatives are represented by a Rebel Operative (HWK-290, In 1) with no upgrades. Due to severe damage from their Imperial entanglement, they are unable to attack. The ship begins the mission with the "Damaged Sensor Array" critical hit, and a total number of shields equal to the number of players.

The HWK also has damaged engines — it is unable to perform the Boost action, and Speed 4 maneuvers are treated as red.

The players decide as a team how to plan the HWK's dial each round, and the ship may perform actions as normal if it fixes the Damaged Sensor Array critical hit.`,
    },
    {
      title: 'Escaping',
      body: `After executing a maneuver, the HWK immediately escapes if all or part of its base is off the play area along the Player setup/escape edge (area B).`,
    },
    {
      title: 'Protecting the HWK',
      body: `The Rebels may use the protect action on the HWK.`,
    },
  ],
};
