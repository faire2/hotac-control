import type { Scenario } from './types';
import { MVRS } from '../Maneuvers';

const briefing = `"We've just received an urgent message from one of our incoming GR-75 supply transports — the Quantum Storm! They dropped out of hyperspace in the middle of an uncharted Imperial minefield and are unable to escape!

The Empire has dispatched a Decimator-class task force to capture the Transport. We can't afford to lose the ship or its supplies — they are desperately needed on Sullust!

Scramble, pilots!"`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │  M M M       [GR-75]│   6
        │  M M M  ⟍           │
        │  M M     ⟍          │
        │           ⟍   M M M │
        │            ⟍  M M M │
        │      A        M M M │
        └─────────────────────┘
             2         1`;

export const minefields2: Scenario = {
  id: 'minefields-2',
  version: 'V 2.07.04',
  title: 'Imperial Entanglements',
  subtitle: 'Mine Fields Part II',
  briefing,
  mapDiagram,
  mapNotes: [
    'Neutral Territory — 10 turns',
    'A: Player setup area',
    'B: Imperial Minefields (×6 per area, Range >1 apart / from edge)',
    'Uses special rules for Minefields — see p33 of source PDF',
  ],
  map: {
    grid: 9,
    seed: 21,
    setupEdge: false,
    zones: [
      {
        label: 'A',
        hue: 'warn',
        corner: { corner: 'br', radius: 3 },
        tip: 'A — Player setup area: deploy your ships in this corner',
      },
      {
        label: 'C',
        hue: 'holo',
        point: [0.6, 8.4],
        tip: 'C — the Decimator task force arrives from this corner on turn 6',
      },
      {
        id: 'B1',
        label: 'B',
        hue: 'danger',
        tri: [[0.5, 0.5], [7.5, 0.5], [0.5, 7.5]],
        tip: 'B — Imperial minefield (6 mines per area): two right-triangle halves (legs 7 long), separated by a narrow diagonal corridor, mines Range >1 apart',
      },
      {
        id: 'B2',
        hue: 'danger',
        tri: [[8.5, 8.5], [1.5, 8.5], [8.5, 1.5]],
        tip: 'B — Imperial minefield (6 mines per area): two right-triangle halves (legs 7 long), separated by a narrow diagonal corridor, mines Range >1 apart',
      },
    ],
    features: [
      { kind: 'minefields', count: 6, in: 'B1', seed: 21, minDist: 1.3 },
      { kind: 'minefields', count: 6, in: 'B2', seed: 22, minDist: 1.3 },
    ],
    tokens: [
      {
        kind: 'transport',
        at: [7, 2],
        angle: -45,
        tip: 'Quantum Storm — the GR-75 transport, stranded in the top-right corner of the corridor between the two minefields (escape via hyperspace)',
      },
    ],
    vectors: [
      { n: 1, side: 'bottom', t: 1 / 2 },
      { n: 2, side: 'left', t: 2 / 3 },
      { n: 3, side: 'left', t: 1 / 3 },
      { n: 4, side: 'top', t: 1 / 3 },
      { n: 5, side: 'top', t: 2 / 3 },
      { n: 6, side: 'right', t: 1 / 3 },
    ],
  },
  turnLimit: 10,
  territory: 'enemy',
  objectives: [
    {
      kind: 'primary',
      text: 'Rescue the Transport: The transport must jump to hyperspace by the end of Turn 10. OR — All enemy ships are destroyed by the end of Turn 10.',
    },
    {
      kind: 'bonus',
      text: 'If the Transport was not hit by Ion Pulse Missiles, all players gain 1 XP.',
      reward: '+1 XP',
    },
    {
      kind: 'bonus',
      text: 'If the Transport jumps to hyperspace AND the Decimator is destroyed, all players gain 3 XP.',
      reward: '+3 XP',
    },
  ],
  victory: {
    text: '"We have rescued the Quantum Storm and its valuable cargo. Now we must ensure the transport makes it to Sullust."',
    next: { kind: 'arcLink', missionId: 'minefields-3' },
  },
  defeat: {
    text: `"The Empire has seized the Quantum Storm and its cargo; our operations on Sullust will suffer greatly." Each player loses their most expensive Upgrade.`,
    next: { kind: 'reshuffle' },
    imperialPoints: 1,
  },
  allies: [
    { ship: 'GR75', displayName: 'Quantum Storm', startingShields: 0 },
  ],
  squads: [
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 2,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIEIN' }],
        3: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        4: [{ kind: 'add', ship: 'TIEIN' }],
        6: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 3 } }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'setup' },
      vector: 4,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Gamma',
      arrival: { kind: 'rolledTurn', turn: 3, roll: '1d6' },
      vector: [1, 2, 3],
      aiTag: 'Strike',
      composition: {
        1: [{ kind: 'add', ship: 'TIESA' }],
        3: [{ kind: 'add', ship: 'TIESA' }],
        4: [{ kind: 'add', ship: 'TIESA', gate: { rebelInitGte: 5 } }],
        5: [{ kind: 'add', ship: 'TIESA' }],
      },
    },
    {
      name: 'Decimator',
      arrival: { kind: 'turn', turn: 6 },
      vector: 'C',
      aiTag: 'Special',
      // Decimator AI: while the transport is in play it just rolls 1d6 for
      // movement → 1/2/3 straight (ignores target position). The maneuver
      // dial samples this list, so any click yields a random straight.
      tags: [
        { kind: 'maneuverOverride', maneuvers: [MVRS.STRAIGHT1, MVRS.STRAIGHT2, MVRS.STRAIGHT3] },
      ],
      composition: {
        1: [{ kind: 'add', ship: 'VT49' }],
        4: [{ kind: 'addShields', count: 2 }],
        5: [{ kind: 'addShields', count: 2 }],
        6: [{ kind: 'addShields', count: 2 }],
      },
    },
    {
      name: 'Delta',
      arrival: { kind: 'rolledTurn', turn: 6, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN', gate: { rebelInitGte: 5 } }],
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
      title: 'Rebel Transport Setup',
      body: `Struck by multiple mines, the Transport needs time to repair its hyperdrive. The ship begins with 0 energy, and gains 1 energy instead of moving.

Players may choose to either perform an action for the transport, or roll a die: on a focus result, it gains an additional 1 energy. When the Transport has 7 energy, it must jump to hyperspace at the end of the combat phase.`,
    },
    {
      title: 'Decimator Stats & Equipment',
      body: `The Decimator is represented by a Patrol Commander (IN2) with the following Upgrades / Talents:

1. Anti-Pursuit Lasers: After an enemy ship executes a maneuver that causes it to overlap your ship, roll 1 Attack die. On a :hit: or :crit: result, the enemy suffers 1 damage.
2. If average Rebel IN is ≥3: Discard all Critical Hits with the "Pilot" trait.
3. If average Rebel IN is ≥4: At the end of the Engagement Phase, each enemy ship at Range 1 that does not have a Stress token, gains 1 Stress token.
4. If average Rebel IN is ≥5: If you perform an attack that misses, you may immediately make an attack from a Turret arc which has not yet fired.`,
    },
    {
      title: 'Decimator AI',
      body: `While the transport is in play, for movement, the Decimator rolls 1d6.
- 1-2: speed 1 straight
- 3-4: speed 2 straight
- 5-6: speed 3 straight

(On the squad card, clicking anywhere on the maneuver dial rolls this for you.)

If it begins its movement touching the transport, it docks instead to capture the ship with a boarding party. If this happens, then the Rebels lose.`,
    },
    {
      title: 'Enemy Attack AI',
      body: `The Empire wants to capture the Transport; these ships ignore it.`,
    },
    {
      title: 'Gamma Squad (Strike AI)',
      body: `Do not draw an Imperial Pilot card for these TIE Bombers. Instead, each bomber is equipped with an Ion Pulse Missile with two charges.

These ships will prioritize the transport but will only attack it with their missiles, and they may fire them at Range 1-3. A successful Ion Missile hit removes 1 energy from the Transport for each hit, instead of applying Ion Tokens. (i.e. 3 hits would cause 1 damage, and remove 2 Energy.)

Once their missiles are launched, the bombers change to Flee AI and escape from the nearest edge.`,
    },
  ],
};
