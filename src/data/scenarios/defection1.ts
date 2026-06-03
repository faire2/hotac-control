import type { Scenario } from './types';

const briefing = `"Several weeks ago, a Rebel spy was assigned to a new squadron of Imperial fighters, and has been sending us intelligence on their performance.

She's been masking her transmissions by routing them through the Empire's holonet receiver in the Parein system, but we now fear she may be discovered.

Escort our slicer techs out to the holonet receiver and protect them while they can figure a more secure communication channel for our spy.

We must continue to get this valuable intelligence!"`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │  S    S    S    S   │   6
        │     B  B  B  B      │
        │     ·  ·  ·  ·      │
        │     B  B  B  B      │
        │                     │
        │           A         │
        └─────────────────────┘
             2         1`;

export const defection1: Scenario = {
  id: 'defection-1',
  version: 'V 2.07.04',
  title: 'Secure the Holonet',
  subtitle: 'Defection Part I',
  briefing,
  mapDiagram,
  mapNotes: [
    'Neutral Territory — 12 turns',
    'A: Player setup area (the planet in the corner)',
    'B: Satellite Relay ×1 per player (extra relays at higher player counts)',
    'C: Asteroids ×6, random layout (Range >1 from any terrain / from edge)',
    'Centre: Holonet receiver — tri-hub station with a Sensor Array',
  ],
  map: {
    grid: 9,
    seed: 21,
    setupEdge: false,
    zones: [
      {
        id: 'planet',
        label: 'A',
        hue: 'danger',
        corner: { corner: 'br', radius: 3.2 },
        tip: 'A — Player setup area: deploy near the planet tucked into the corner',
      },
      {
        label: 'C',
        hue: 'holo',
        point: [1.7, 5.4],
        tip: 'C — Asteroid field: 6 rocks, random layout (Range >1 from terrain / edges)',
      },
    ],
    features: [
      {
        kind: 'station',
        preset: 'triHub',
        at: [4.5, 4.2],
        tip: 'Holonet receiver — the tri-hub station (Sensor Array emplacement at the core)',
      },
      {
        kind: 'asteroids',
        count: 6,
        region: [0.9, 0.9, 7.6, 7.6],
        seed: 27,
        minDist: 1.8,
      },
    ],
    tokens: [
      // Six relays surround the holonet receiver. The two centre relays (top /
      // bottom, on the mid-line of the second square row in from each edge) are
      // the base pair; the four corner intersections fill in as players are
      // added. The 'B' relay sits inside the asteroid field at the top.
      {
        kind: 'relay',
        at: [4.5, 2],
        label: 'B',
        tip: 'Satellite Relay (B) — disable to identify the spy holonet channel; destroying one costs XP',
      },
      { kind: 'relay', at: [4.5, 7], tip: 'Satellite Relay — disable to identify the spy holonet channel' },
      { kind: 'relay', at: [3, 3], playerCount: 3, tip: 'Satellite Relay (3+ players)' },
      { kind: 'relay', at: [6, 3], playerCount: 4, tip: 'Satellite Relay (4+ players)' },
      { kind: 'relay', at: [3, 6], playerCount: 5, tip: 'Satellite Relay (5+ players)' },
      { kind: 'relay', at: [6, 6], playerCount: 6, tip: 'Satellite Relay (6+ players)' },
    ],
  },
  turnLimit: 12,
  territory: 'enemy',
  objectives: [
    {
      kind: 'primary',
      text: 'Configure a Secure Holo-Channel on the Receiver: (1) Disable Satellite relays and Sensor Array Emplacements to identify the holonet channel used by the Rebel Spy. (2) The Slicer Techs must secure the identified channel. (3) The Slicer Techs must escape by jumping to hyperspace.',
    },
    {
      kind: 'bonus',
      text: 'Penalty: For each satellite relay that was destroyed, all players lose 1 XP.',
      reward: '-1 XP per destroyed',
    },
    {
      kind: 'bonus',
      text: `The pilot who performs the most protect actions on the Slicer Techs' HWK gains 2 XP. If tied, all tied players gain 1 XP.`,
      reward: '+2 XP',
    },
  ],
  victory: {
    text: `"Thanks to our Slicer Techs, the spy's transmissions are now secure. We should have more intel for you shortly."`,
    next: { kind: 'arcLink', missionId: 'defection-2' },
  },
  defeat: {
    text: `"The Empire has scrambled their local holonet protocols; Our spy is safe for now, but we'll have to start over."`,
    next: { kind: 'reshuffle' },
  },
  allies: [
    { ship: 'HWK290', displayName: 'Slicer Techs' },
  ],
  squads: [
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 2,
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
      name: 'Beta',
      arrival: { kind: 'setup' },
      vector: 5,
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
      arrival: { kind: 'rolledTurn', turn: 4, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 5 } }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 3 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Delta',
      arrival: { kind: 'rolledTurn', turn: 8, roll: '1d6' },
      vector: '1d6',
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
      name: 'Inspection',
      // Triggered when the spy's holonet channel is identified — runtime
      // popup confirms each round whether the event happened. Composition
      // resolves normally once the handler fires.
      arrival: { kind: 'setup' },
      vector: [2, 5],
      aiTag: 'Strike',
      tags: [{ kind: 'dynamicSpawn', handler: 'inspectionSquadOnIdentify' }],
      composition: {
        1: [{ kind: 'add', ship: 'LAMBDA' }],
        3: [{ kind: 'add', ship: 'TIEIN' }],
        4: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIEIN' }],
        6: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Slicer Tech Setup',
      body: `The Slicer Techs are represented by a Rebel Operative (HWK-290, In 2) equipped with an Ion Cannon Turret, and +1 shield for every 2 players. The players decide as a team how to plan the HWK's dial each round, and the ship may perform actions and attacks as normal. The Rebels may use the Protect action on this HWK.`,
    },
    {
      title: 'Holonet Relay Setup',
      body: `During setup put the number tokens 10-12 into the draw bag. Add one other token for each player.`,
    },
    {
      title: 'Disabling Relays & Emplacements',
      body: `Satellite Relay: 2 Agility, 3 Hull. Sensor Array: 0 Agility, 5 Hull. Both are considered channels for the holonet receiver. They can be attacked and are considered disabled when they have 1 hull left, or gain an Ion token.

Earn 1 XP for disabling a channel, then draw a number and assign it to mark that channel as disabled. If 12 is drawn, mark the channel with a critical hit token instead and return the 12 to the bag: the spy's holonet channel has been identified. From now on, if 12 is drawn for any other disabled channel, draw and assign that channel another number instead, returning the 12 to the bag.`,
    },
    {
      title: '(Accidentally) Destroying Channels',
      body: `Each time a channel is destroyed, draw a number and remove it. The mission is a failure if the 12 is removed, even if the channel has been identified elsewhere.`,
    },
    {
      title: 'Inspection Squad (Strike Priority)',
      body: `Once the communications channel has been identified, the Inspection Squad arrives at the start of the following Turn. These ships will prioritize the Slicer Techs, but will attack other Rebel ships if they cannot attack the HWK.`,
    },
    {
      title: 'Securing the Holonet Channel',
      body: `The Slicer Techs must perform a Scan Action on the marked channel to draw: If 12 is drawn, the channel is secure. Otherwise, return the number to the bag.`,
    },
  ],
};
