import type { Scenario } from './types';

const briefing = `"Based on the sensor data we collected, we have managed to narrow down the possible staging areas used by the TIE Phantom Squadron; they're somewhere in the spinward edge of the Hook nebula.

Your mission is to investigate these locations in force. Destroy any enemy ships and installations you find.

Put an end to the Empire's cloaking device testing, or our fighters will never enjoy space superiority again."`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │  S        S    S    │   6
        │   ☁ B  ☁ B  ☁ B    │
        │  ☁  ☁  ☁  ☁  ☁    │
        │   ☁ B  ☁ B  ☁ B    │
        │                     │
        │           A         │
        └─────────────────────┘
             2         1`;

export const chasingPhantoms3: Scenario = {
  id: 'chasing-phantoms-3',
  version: 'V 2.07.04',
  title: 'Cloak and Dagger',
  subtitle: 'Chasing Phantoms Part III',
  briefing,
  mapDiagram,
  mapNotes: [
    'Hostile Territory — 12 turns',
    'A: Player setup edge',
    'B: Signal Tokens ×10 (one per Cloud)',
    'C: Cloud ×10 (random layout, Range >1 apart, not inside area A)',
  ],
  turnLimit: 12,
  territory: 'hostile',
  objectives: [
    {
      kind: 'primary',
      text: 'Search and Destroy: (1) Find R&D Station and all Docking Ports by scanning Ion Clouds. (2) Destroy all TIE Phantoms. (3) Destroy the Command Center, Sensor Array and Shield Generator emplacements to shut down the Empire\'s cloaking device program.',
    },
    {
      kind: 'bonus',
      text: 'If all Turbolaser emplacements are destroyed, all players gain 1 XP.',
      reward: '+1 XP',
    },
  ],
  victory: {
    text: `"The Empire's R&D station is history, and the cloaking device with it. Exceptional flying Pilots!" + Remove all TIE Phantoms from the Imperial Pilot deck.`,
    next: { kind: 'arcLink', missionId: 'chasing-phantoms-4' },
    rebelPoints: 1,
  },
  defeat: {
    text: `"All forces retreat! We're going to need an answer to the TIE Phantom if our fighters hope to ever win a dogfight again." Each player loses their most expensive Upgrade.`,
    next: { kind: 'reshuffle' },
    imperialPoints: 1,
  },
  randomPoolExclusions: ['TIEPH'],
  squads: [
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 3,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIEPH' }],
        2: [{ kind: 'add', ship: 'TIEPH', gate: { rebelInitGte: 5 } }],
        3: [{ kind: 'add', ship: 'TIEPH' }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'rolledTurn', turn: 4, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'replaceRandom', gate: { rebelInitGte: 4 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'replaceRandom', gate: { rebelInitGte: 5 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Gamma',
      arrival: { kind: 'rolledTurn', turn: 8, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 3 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Signal Token Setup',
      body: `Put the number tokens 1-7 and 10-12 into the draw bag, and place a Tracking token in the center of each cloud.`,
    },
    {
      title: 'Identifying Signal Tokens',
      body: `The clouds must be searched for Imperial facilities. A Rebel ship may perform a Scan action on a Tracking token within Range 1 to remove it, draw a number from the bag and set it aside:
- 10, 11, 12: When all 3 of these tokens are set aside, place the R&D station.
- 4, 5, 6, 7: False signal.
- 1, 2, 3: If there are 4/5/6 players respectively, place a Docking Port with TIE Phantom. This Phantom is in addition to those listed in the Reinforcements chart. If not, false signal.

When placing the station / docking ports: center them over the tracking token if possible, but place them at least Range 1 from board edges. Place them in the orientation shown in the source PDF.`,
    },
    {
      title: 'R&D Station Effects',
      body: `Each emplacement on the R&D Station has a special effect that applies until the station is placed and the emplacement is destroyed.

- (C) Command Center: TIE Phantoms are In 6.
- (A) Sensor Array: All emplacements and enemy ships are treated as if they were equipped with: Sensor Jammer: When defending, change one of the attacker's hit results to an eye result. The attacker cannot reroll the die with the changed result.
- (S) Shield Generator: Has only its standard effect. (All emplacements gain 1 green die while the Generator is active.)
- (T) Turbolasers: When placed, each begins facing the nearest Rebel ship.`,
    },
  ],
};
