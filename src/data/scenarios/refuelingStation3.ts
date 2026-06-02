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
    'Station emplacements — C: Command Center · S: Shield Generator · F: Fuel Tank · T: Turbolaser',
    'G: Docking Bay 1 (Gamma approach) · H: Docking Bay 2 (Delta approach)',
    'Turbolasers [T] begin facing edge A; outer T arms are added at 3/4/5/6 players',
    'Uses special rules for Docking Bay Modules — see p33 of source PDF',
  ],
  map: {
    grid: 9,
    seed: 27,
    setupEdge: false,
    zones: [
      {
        label: 'A',
        hue: 'danger',
        band: { side: 'bottom', depth: 1 },
        tip: 'A — Player setup edge: deploy your ships and the Assault Ship here',
      },
      {
        id: 'B',
        label: 'B',
        hue: 'holo',
        rect: [1, 4.6, 8, 7],
        tip: 'B — Asteroids ×6: random layout, Range >1 apart and Range >1 from any edge',
      },
      { point: [2.5, 4.5], label: 'G', hue: 'warn', tip: 'G — Docking Bay 1: Gamma squad approaches here; the Assault Ship may land to unload commandos' },
      { point: [6.7, 1.4], label: 'H', hue: 'warn', tip: 'H — Docking Bay 2: Delta squad approaches here; the Assault Ship may land to unload commandos' },
    ],
    features: [
      { kind: 'asteroids', count: 6, in: 'B', seed: 27, minDist: 1.6 },
      // Modular station, assembled radially from the hub by the station placer
      // (see stationAssembly.ts), so every connector touches its neighbours at
      // exactly the standard width. Faithful to the printed snowflake:
      //   - hexagonal hub (Command Center between 2 Fuel Tanks); every arm docks
      //     against a hub *face* (the placer snaps the connector to the face
      //     normal), so the six modules form a flush pinwheel,
      //   - two square Turbolaser tiles (upper-left / lower-right faces), two
      //     square Shield tiles (left / right faces),
      //   - each Shield tile extends through a small hexagonal junction to a pair
      //     of angled Turbolaser tiles, player-count-gated 3p/5p (left), 4p/6p
      //     (right) — docked flush against the hex junction's angled faces,
      //   - 2 diagonal docking bays, each holding 2 Fuel Tanks.
      {
        kind: 'hull',
        at: [4.5, 2.4],
        connectorWidth: 0.26,
        tip: 'Station hull — assemble outward from the hexagonal hub: square Turbolaser/Shield arms, two junctions feeding the turbolaser wedges, and two docking bays',
        root: {
          shape: 'hex',
          size: 0.8,
          // Pointy-top hub (flat-top is the hex default for edge-to-edge junctions).
          rotate: 30,
          emplacements: [
            { label: 'F', tip: 'Fuel Tank emplacement' },
            { label: 'C', tip: 'Command Center — the commandos must capture this; if destroyed, the Rebels lose' },
            { label: 'F', tip: 'Fuel Tank emplacement' },
          ],
          arms: [
            // Turbolaser tiles on the two free hex faces (upper-left, lower-right),
            // docked straight onto the hull (no connector).
            {
              angle: -120,
              direct: true,
              to: { shape: 'square', size: 0.34, emplacements: [{ label: 'T', tip: 'Turbolaser emplacement — begins facing edge A' }] },
            },
            {
              angle: 60,
              direct: true,
              to: { shape: 'square', size: 0.34, emplacements: [{ label: 'T', tip: 'Turbolaser emplacement — begins facing edge A' }] },
            },
            // Diagonal docking bays, docked straight onto the hull (no connector).
            {
              angle: -45,
              direct: true,
              to: {
                shape: 'bay',
                size: 0.9,
                depth: 0.72,
                emplacements: [
                  { label: 'F', tip: 'Fuel Tank emplacement — Docking Bay 2' },
                  { label: 'F', tip: 'Fuel Tank emplacement — Docking Bay 2' },
                ],
              },
            },
            {
              angle: 135,
              direct: true,
              to: {
                shape: 'bay',
                size: 0.9,
                depth: 0.72,
                emplacements: [
                  { label: 'F', tip: 'Fuel Tank emplacement — Docking Bay 1' },
                  { label: 'F', tip: 'Fuel Tank emplacement — Docking Bay 1' },
                ],
              },
            },
            // Left Shield tile → hexagonal junction → angled Turbolaser tiles.
            // The hex is itself the connector (docked straight onto S); two of its
            // angled faces carry square Turbolaser tiles (same shape as the hub
            // turbolasers), added at 3 / 5 players.
            {
              angle: 180,
              gap: 0.22,
              to: {
                shape: 'square',
                size: 0.28,
                emplacements: [{ label: 'S', tip: 'Shield Generator emplacement — destroy to drop the station shields' }],
                arms: [
                  {
                    angle: 180,
                    direct: true,
                    to: {
                      shape: 'hex',
                      size: 0.3,
                      playerCount: 3,
                      arms: [
                        {
                          angle: 120,
                          gap: 0.12,
                          to: { shape: 'square', size: 0.28, playerCount: 3, emplacements: [{ label: 'T', tip: 'Turbolaser emplacement (3+ players) — begins facing edge A' }] },
                        },
                        {
                          angle: -120,
                          gap: 0.12,
                          to: { shape: 'square', size: 0.28, playerCount: 5, emplacements: [{ label: 'T', tip: 'Turbolaser emplacement (5+ players) — begins facing edge A' }] },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            // Right Shield tile → hexagonal junction → angled Turbolaser tiles,
            // added at 4 / 6 players.
            {
              angle: 0,
              gap: 0.22,
              to: {
                shape: 'square',
                size: 0.28,
                emplacements: [{ label: 'S', tip: 'Shield Generator emplacement — destroy to drop the station shields' }],
                arms: [
                  {
                    angle: 0,
                    direct: true,
                    to: {
                      shape: 'hex',
                      size: 0.3,
                      playerCount: 4,
                      arms: [
                        {
                          angle: -60,
                          gap: 0.12,
                          to: { shape: 'square', size: 0.28, playerCount: 4, emplacements: [{ label: 'T', tip: 'Turbolaser emplacement (4+ players) — begins facing edge A' }] },
                        },
                        {
                          angle: 60,
                          gap: 0.12,
                          to: { shape: 'square', size: 0.28, playerCount: 6, emplacements: [{ label: 'T', tip: 'Turbolaser emplacement (6 players) — begins facing edge A' }] },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
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
