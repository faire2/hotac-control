import type { Scenario } from './types';

const briefing = `"Our efforts to undermine the Empire's operations in the Nulan system are getting noticed. Imperial forces have begun cracking down on hyperspace traffic by deploying minefields along hyperspace routes favored by smugglers.

We aren't in any danger yet, but this operation has the potential to disrupt our supply lines and restrict our future movements.

Our best option is a pre-emptive strike — get out there and clear these mines!"`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │     S          M    │   6
        │   M  M  M  M  M     │
        │ M  M  M  M  M  M    │
        │   M  M  M  M  M     │
        │     M  M  M  M      │
        │           A         │
        └─────────────────────┘
             2         1`;

export const minefields1: Scenario = {
  id: 'minefields-1',
  version: 'V 2.07.04',
  title: 'Tread Softly',
  subtitle: 'Mine Fields Part I',
  briefing,
  mapDiagram,
  mapNotes: [
    'Friendly Territory — 12 turns',
    'A: Player setup edge',
    'B: Imperial Minefields (sample layout — see Minefield Setup)',
    'Uses special rules for Minefields — see p33 of source PDF',
  ],
  turnLimit: 12,
  territory: 'friendly',
  objectives: [
    {
      kind: 'primary',
      text: 'Clear the Minefield: Destroy minefield tokens. The mission is a success if there are fewer minefields remaining than the total number of players.',
    },
    {
      kind: 'bonus',
      text: 'If all minefield tokens are destroyed, all pilots gain 2 XP.',
      reward: '+2 XP',
    },
    {
      kind: 'bonus',
      text: 'If no replacement minefields are deployed, all pilots gain 1 XP.',
      reward: '+1 XP',
    },
  ],
  victory: {
    text: '"Keeping these routes clear of mines will buy us the time we need to take delivery of some much-needed supplies."',
    next: { kind: 'arcLink', missionId: 'minefields-2' },
  },
  defeat: {
    text: `"The Empire deploys so many mines that we can't keep up. Our supplies are dwindling, and our chances of reclaiming the Nulan system with them."`,
    next: { kind: 'reshuffle' },
  },
  squads: [
    {
      name: 'Mine Layer',
      arrival: { kind: 'setup' },
      vector: 3,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIESA' }],
        2: [{ kind: 'add', ship: 'TIESA', gate: { rebelInitGte: 5 } }],
        3: [{ kind: 'add', ship: 'TIESA' }],
        5: [{ kind: 'add', ship: 'TIESA' }],
      },
    },
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 5,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 3 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Elite',
      arrival: { kind: 'rolledTurn', turn: 5, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        3: [{ kind: 'addElite', ship: 'TIESA' }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'rolledTurn', turn: 5, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN', gate: { rebelInitGte: 5 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'add', ship: 'TIELN', gate: { rebelInitGte: 4 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Minefield Setup',
      body: `During setup, place 3 minefield tokens per player. Each minefield token must be just beyond Range 1 (or as close as possible to Range 1) from two other minefield tokens, and Range 1 or further from the edge of the mission area.

These minefield tokens are hostile, and will detonate if overlapped by Rebel ships.`,
    },
    {
      title: 'Mine Layer Squad',
      body: `Each TIE Bomber in the Mine layer squad uses the standard Attack AI, but is also loaded with additional mines to fill gaps in the minefield.

Each time a minefield is destroyed or detonated by the players, set that token aside. On the next turn, the lowest-numbered TIE Bomber in the squad that can perform an action will attempt to replace a previously destroyed minefield.

Use the rules for Proximity Mines, with the following exception: The placement of this new minefield token must be within range 2 of any other minefield in play, but must not overlap a ship or minefield. If a TIE Bomber cannot lay a mine, the next Bomber in a squad will lay one instead. If there are no mines to replace, or if no bomber can legally deploy one, then no replacement minefield is deployed.`,
    },
    {
      title: 'Destroyed Minefield Tokens',
      body: `Pilots gain 1 XP for destroying a minefield token. If a player detonates a minefield by overlapping it, do not gain any XP.`,
    },
  ],
};
