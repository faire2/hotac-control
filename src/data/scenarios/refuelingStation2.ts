import type { Scenario } from './types';

const briefing = `"The operatives on board the HWK-290 you rescued have brought us some critical intel. The asteroid field they were investigating in the Argus system conceals an Imperial refueling station. If we can capture this base, we would gain a well-defended staging area, deep in Imperial space.

However, the base is protected by an early-warning sensor net, which would give the Empire ample time to prepare against any attack we launch. Disable it before we can strike!"`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │  · ·   P   · ·      │   6
        │   ·  ·   ·  ·       │
        │      ·  E  ·        │
        │   ·  ·   ·  ·       │
        │  · ·   · · · ·      │
        │           A         │
        └─────────────────────┘
             2         1`;

export const refuelingStation2: Scenario = {
  id: 'refueling-station-2',
  version: 'V 2.07.04',
  title: 'Disable Sensor Net',
  subtitle: 'The Refueling Station Part II',
  briefing,
  mapDiagram,
  mapNotes: [
    'Neutral Territory — 12 turns',
    'A: Player setup / escape edge',
    'B: Asteroids ×12, random layout (Range >1 apart, Range >1 from edge)',
    'P: Patrol arrival (special, see rules)',
    'E: Elite arrival (special, see rules)',
  ],
  turnLimit: 12,
  territory: 'enemy',
  objectives: [
    {
      kind: 'primary',
      text: 'Destroy all Sensor Beacons to break the network.',
    },
    {
      kind: 'bonus',
      text: 'Each Sensor Beacon is an Emplacement (worth 1 XP when destroyed).',
      reward: '+1 XP each',
    },
    {
      kind: 'bonus',
      text: 'If no Patrol squads deploy during the mission, all players gain 2 XP.',
      reward: '+2 XP',
    },
  ],
  victory: {
    text: '"The sensor network is broken! All ships regroup with the main strike force and prepare to launch the assault. The refueling station will be ours!"',
    next: { kind: 'arcLink', missionId: 'refueling-station-3' },
  },
  defeat: {
    text: '"Our presence in the asteroid field has drawn too much Imperial attention! The station will now be too well defended for us to mount an immediate attack — Retreat!"',
    next: { kind: 'reshuffle' },
  },
  squads: [
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 2,
      aiTag: 'Strike',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'setup' },
      vector: 5,
      aiTag: 'Strike',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 3 } }],
      },
    },
    {
      name: 'Patrol',
      // Sensor-check criticals trigger this squad: 1 TIE Interceptor per crit,
      // capped at 4. Spawn handler lives in the dynamic-spawn registry (TBD);
      // see "Activating Sensor Beacons" special rule.
      arrival: { kind: 'setup' },
      vector: '1d6',
      aiTag: 'Attack',
      tags: [{ kind: 'dynamicSpawn', handler: 'sensorCheckPatrol' }],
      composition: {},
    },
    {
      name: 'Elite',
      // Arrives once when half the sensor beacons are destroyed — a single
      // Elite of squad-consistent random type, regardless of player count.
      arrival: { kind: 'setup' },
      vector: '1d6',
      aiTag: 'Strike',
      composition: {
        1: [{ kind: 'addElite' }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Sensor Beacon Setup',
      body: `Represent Sensor Beacons using satellite tokens. Use two sensor beacons per player and randomly place them on top of asteroids.`,
    },
    {
      title: 'Disabling Sensor Beacons',
      body: `Sensor beacons are considered Emplacements, and not obstructed by the asteroid they are placed on. (See the Emplacements Statcard for details.) When attacking, measure range to the asteroid token, not the beacon. They have 3 Agility, 2 Hull, and each is equipped with a Sensor Jammer: When defending, change one of the attacker's hit results to a Focus result. The attacker cannot reroll the die with the changed result, but can modify it.

Seismic Charges will destroy both the Asteroid and the Beacon on it, but add 1 Attack die to the pool when rolling for the Patrol.

Proton Bombs may trigger the Sensor Beacons. For each Proton Bomb detonated within Range 2 of an active sensor, add 1 Attack die to the pool when rolling for the Patrol.`,
    },
    {
      title: 'Activating Sensor Beacons',
      body: `During the end phase, Rebel ships must make a sensor check. Each player builds a pool of attack dice using:
- Each Beacon at Range 1: +3
- Each Beacon at Range 2: +2
- Each Beacon at Range 3: +1
- Asteroid Destroyed by Seismic Torp: +1
- Each Proton Bomb detonated within Range 2 of an active beacon: +1
- You have a Stealth Device: -1

Each player rolls their dice pool. Players overlapping an asteroid containing a sensor beacon add a critical :crit: result to their roll.

If there is at least one critical :crit: result among all the players, a Patrol squad arrives at the start of next turn, composed of one TIE Interceptor per critical hit rolled (to a maximum of 4). There is no limit to the number of Patrol squads that can arrive.`,
    },
    {
      title: 'Elite Reinforcements',
      body: `When half of the sensor beacons are destroyed, the Elite squad arrives at the start of the next turn.`,
    },
  ],
};
