import type { Scenario } from './types';

const briefing = `"Our operatives have been watching the Imperial starport traffic coming in and out of the Nulan system for weeks, and we have managed to decrypt some holocomm messages.

The local garrison is due for an inspection this week by Moff Lankin. We have his shuttle's flight path, so we can intercept and capture him. This should provide us with some valuable intel and deal the local Imperial forces a demoralizing blow."`;

// Map letters from the PDF: S = Shuttle spawn, A = Alpha spawn (player setup edges
// share these), E = Elite/Beta/etc spawn cluster, B = Imperial escape edge,
// G = Gamma spawn, D = Delta spawn. Vector "C" is centre-of-board.
const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │     S          B    │   6
        │                     │
        │     · · · · · ·     │
        │     · · E · · ·     │
        │                     │
        │           A         │
        └─────────────────────┘
             2         1`;

export const captureOfficer1: Scenario = {
  id: 'capture-officer-1',
  version: 'V 2.07.04',
  title: 'Capture the Officer',
  subtitle: 'Part I',
  briefing,
  mapDiagram,
  mapNotes: [
    'Friendly Territory — 12 turns',
    'A: Player setup edges',
    'B: Imperial escape edge',
    'E: Asteroids ×6, Debris ×6, random layout (Range >1 apart / from edge)',
  ],
  turnLimit: 12,
  territory: 'friendly',
  objectives: [
    {
      kind: 'primary',
      text: 'Capture the Imperial Officer: the shuttle is disabled, and there are no enemy ships in play. In this case, the scenario immediately ends.',
    },
    {
      kind: 'bonus',
      text: 'When the primary objective is complete, all players gain 1 XP for each squad of enemy ships that did not arrive.',
      reward: '+1 XP per squad',
    },
  ],
  victory: {
    text: '"Now that the Moff Lankin is in the hands of our operatives, we should have some new intelligence for you shortly."',
    next: { kind: 'arcLink', missionId: 'capture-officer-2' },
  },
  defeat: {
    text: `"We've failed this time, but this won't be the last Imperial inspection we can intercept. As far as we can tell, they aren't aware of the security breach in their holocomm network."`,
    next: { kind: 'reshuffle' },
  },
  requiredModels: ['Lambda-class T-4A Shuttle'],
  squads: [
    {
      name: 'Shuttle',
      arrival: { kind: 'setup' },
      vector: 'C',
      aiTag: 'Special',
      composition: {
        1: [{ kind: 'add', ship: 'LAMBDA' }],
        3: [{ kind: 'addShields', count: 2 }],
        4: [{ kind: 'addShields', count: 2 }],
        5: [{ kind: 'addShields', count: 2 }],
        6: [{ kind: 'addShields', count: 2 }],
      },
    },
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 'C',
      aiTag: 'Escort',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Elite',
      arrival: { kind: 'rolledTurn', turn: 2, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        // 🏅⚙ at 3p — Elite of squad-consistent random ship type.
        3: [{ kind: 'addElite' }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'rolledTurn', turn: 4, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Escort',
      composition: {
        // F  4↑⚙  +F  5↑⚙  +F  3↑⚙
        // The `↑⚙` glyph upgrades the last-added fighter to the squad's
        // random imperial ship type, gated by avg Rebel INIT ≥ N.
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'replaceRandom', gate: { rebelInitGte: 4 } }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replaceRandom', gate: { rebelInitGte: 5 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'replaceRandom', gate: { rebelInitGte: 3 } }],
      },
    },
    {
      name: 'Gamma',
      arrival: { kind: 'rolledTurn', turn: 8, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Escort',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'replaceRandom', gate: { rebelInitGte: 3 } }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replaceRandom', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'replaceRandom', gate: { rebelInitGte: 5 } }],
      },
    },
    {
      name: 'Delta',
      arrival: { kind: 'rolledTurn', turn: 11, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIEIN' }],
        2: [{ kind: 'add', ship: 'TIEIN' }],
        4: [{ kind: 'add', ship: 'TIEIN' }],
        6: [{ kind: 'add', ship: 'TIEIN' }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Shuttle Stats & Equipment',
      body: `Flight Instructor: When defending you may reroll one of your Focus results.

Sensor Jammer: When defending, you may change 1 of the attacker's hit results to a focus result. The attacker cannot reroll the die with the changed result, but can modify it.

Anti-Pursuit Lasers: After an Enemy ship performs a maneuver that causes it to overlap your ship, roll 1 Attack die. On a :hit: or :crit: result, the Enemy ship suffers one damage.

In addition, the shuttle gains extra shields based on the number of players — see above.`,
    },
    {
      title: 'Disabling the Shuttle',
      body: `The shuttle is disabled immediately when it has 1-3 hull remaining. However, if the shuttle is reduced to 0 hull, it is still destroyed as usual and the Rebels fail the mission. The player that disables the shuttle gains 3 XP.

Once the shuttle is disabled, it no longer moves. Remaining enemy ships also change priority from Escort to Attack. If there are no enemy ships in play at the end of a combat phase, reinforcements will not arrive and the mission is over.`,
    },
    {
      title: 'Shuttle AI',
      body: `The Lambda Shuttle will engage and attack the nearest target as usual. Once the shuttle has suffered 5 shield damage, it will change tactics and attempt to flee via the Imperial Escape Edge (B). Treat that edge as its priority target for movement, and always use the shuttle's maximum speed for the selected bearing.`,
    },
    {
      title: 'Escort AI',
      body: `Escort-type enemy ships have modified action priority. After moving, if they are within range 1 of the shuttle, they will perform the Protect action to assign it an evade token.`,
    },
  ],
};
