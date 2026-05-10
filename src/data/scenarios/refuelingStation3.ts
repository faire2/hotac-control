import type { Scenario } from './types';

const briefing = `"The sensor net surrounding the refueling base is out of commission. Now is the time to strike and capture the facility for the Alliance!

Your squadron must disable the station's defenses and engage any fighter cover in the area. You will also be required to escort an assault ship full of rebel commandos to dock with the station and capture it.

Once we begin the attack, the Empire is sure to scramble any remaining patrols in the area. Stay alert, and may the Force be with you!"`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │  T              T   │   6
        │      ┌─────┐        │
        │      │ Sta │        │
        │      │ tion│        │
        │  T   └─────┘    T   │
        │           A         │
        └─────────────────────┘
             2         1`;

export const refuelingStation3: Scenario = {
  id: 'refueling-station-3',
  version: 'V 2.07.04',
  title: 'Capture Refueling Station',
  subtitle: 'The Refueling Station Part III',
  briefing,
  mapDiagram,
  mapNotes: [
    'Hostile Territory — 12 turns',
    'A: Player setup edge',
    'B: Asteroids ×6, random layout (Range >1 apart / from edge)',
    'G: Station Docking Bay 1 (Gamma approach)',
    'H: Station Docking Bay 2 (Delta approach)',
    'Turbolasers [T] begin facing edge A',
    'Uses special rules for Docking Bay Modules — see p33 of source PDF',
  ],
  turnLimit: 12,
  territory: 'hostile',
  objectives: [
    {
      kind: 'primary',
      text: 'Capture the Refueling Station: (1) Destroy the shield generators (Pilots gain an additional 1 XP for destroying a Shield Generator emplacement). (2) The Assault Ship must land in a station docking bay. (3) The Commando team must capture the command center. (4) Survive until the end of Turn 12 (or destroy all enemies).',
    },
    {
      kind: 'bonus',
      text: 'If the station is captured, the group gains 2 XP for each emplacement that has not been damaged or destroyed.',
      reward: '+2 XP per intact emplacement',
    },
  ],
  victory: {
    text: '"Our commandos have seized control of the station and forced the Imperials to retreat! The Argus system is ours!"',
    next: { kind: 'arcDiscard' },
    rebelPoints: 1,
  },
  defeat: {
    text: `"All remaining forces retreat! We won't get another chance at this; we've lost the station!" Each player loses their most expensive Upgrade.`,
    next: { kind: 'reshuffle' },
    imperialPoints: 1,
  },
  requiredModels: ['Outer Rim Smuggler'],
  allies: [
    { ship: 'OUTER_RIM_SMUGGLER', displayName: 'Assault Ship' },
  ],
  squads: [
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 3,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 5 } }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'setup' },
      vector: 4,
      aiTag: 'Attack',
      composition: {
        2: [{ kind: 'add', ship: 'TIEIN' }],
        4: [{ kind: 'add', ship: 'TIEIN' }],
        6: [{ kind: 'add', ship: 'TIEIN' }],
      },
    },
    {
      name: 'Gamma',
      arrival: { kind: 'turn', turn: 4 },
      vector: 'G',
      approachLabel: 'Bay 1',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'replace', ship: 'TIEADVX', gate: { rebelInitGte: 4 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'replace', ship: 'TIEADVX', gate: { rebelInitGte: 3 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Delta',
      arrival: { kind: 'turn', turn: 5 },
      vector: 'H',
      approachLabel: 'Bay 2',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIESA' }],
        3: [{ kind: 'add', ship: 'TIESA' }],
        5: [{ kind: 'add', ship: 'TIESA' }],
      },
    },
    {
      name: 'Elite',
      arrival: { kind: 'rolledTurn', turn: 8, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'addElite' }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Assault Ship',
      body: `The Assault Ship is represented by an Outer Rim Smuggler (In 1). The players decide as a team how to plan this ship's dial each round, and the ship may perform actions and attacks as normal. Players do not gain any XP for enemy ships destroyed by the Assault Ship, but may use the Protect action on it.

Unloading the Commando Team: The Assault Ship must land in one of the station's Docking Bays. At the end of the round the Assault ship has landed, place a Tracking token on the Docking Bay tile to represent the commando team.

The players may choose to deploy the Assault ship from that docking bay at the start of any following round.`,
    },
    {
      title: 'Moving the Commando Team',
      body: `At the end of each turn, roll 3 attack dice: If the number of hits rolled is equal to or greater than the number of emplacements on that station tile, players may move the commandos to an adjacent station tile. Otherwise, they may destroy one emplacement on that tile, or simply wait until next round. Players may choose if Fuel Tanks destroyed this way explode.`,
    },
    {
      title: 'Capturing the Station',
      body: `The commandos must reach the center tile. Then, they must succeed at their movement roll to enter the Command Center and capture the station. Any remaining Turbolaser emplacements are now under Rebel control: Players may choose their facing and attack targets for the rest of the mission. If the Command Center is destroyed, the Rebels Lose.

If the Rebels have control of the station at the end of Turn 12, the mission is no longer considered hostile territory and the Imperials retreat. Otherwise, all Rebel ships in play are destroyed.`,
    },
  ],
};
