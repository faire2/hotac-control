import type { Scenario } from './types';

const briefing = `"While our intelligence teams are decoding the shuttle's databanks and interrogating Moff Lankin, we can make use of the shuttle's battered remains.

Take the crippled shuttle out to a recent battle site and activate its distress beacon. Power down your ships and hide in the nearby wreckage until the time is right to strike.

Imperial patrols are certain to mount search and rescue operations for Lankin, providing us with the perfect opportunity for an ambush."`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │     S          A    │   6
        │                     │
        │     · · · · · ·     │
        │     · · B · · ·     │
        │                     │
        │           D         │
        └─────────────────────┘
             2         1`;

export const captureOfficer2: Scenario = {
  id: 'capture-officer-2',
  version: 'V 2.07.04',
  title: 'Nobody Home',
  subtitle: 'Capture the Officer Part II',
  briefing,
  mapDiagram,
  mapNotes: [
    'Friendly Territory — 10 turns',
    'A: Imperial escape edge',
    'B: Crippled shuttle (obstacle only)',
    'C: Asteroids ×6, Debris ×6, random layout (Range >1 apart, Range >1 from edge)',
  ],
  turnLimit: 10,
  territory: 'friendly',
  objectives: [
    {
      kind: 'primary',
      text: 'Destroy Imperial Search & Rescue Force. If too many enemies escape, the mission is a failure: 1-2p: 2 Enemies / 3-4p: 3 Enemies / 5-6p: 4 Enemies.',
    },
    {
      kind: 'bonus',
      text: 'If squads Alpha or Beta included any TIE Interceptors, and they were all destroyed, all players gain 1 XP.',
      reward: '+1 XP',
    },
    {
      kind: 'bonus',
      text: 'Penalty: For each enemy ship that escapes, all players lose 1 XP.',
      reward: '-1 XP per escaped',
    },
  ],
  victory: {
    text: '"A high ranking officer, and now a sizable search and rescue task force have disappeared. The Empire must think its grip on the Nulan system is slipping, and we\'ve discovered a new target for you."',
    next: { kind: 'arcLink', missionId: 'capture-officer-3' },
  },
  defeat: {
    text: '"The Imperials are onto us; any information we extract from Moff Lankin is now worthless."',
    next: { kind: 'reshuffle' },
    imperialPoints: 1,
  },
  squads: [
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 1,
      aiTag: 'Attack*',
      composition: {
        1: [{ kind: 'add', ship: 'TIEIN' }],
        4: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIEIN' }],
      },
    },
    {
      name: 'Beta',
      arrival: { kind: 'setup' },
      vector: 2,
      aiTag: 'Attack*',
      composition: {
        2: [{ kind: 'add', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        3: [{ kind: 'add', ship: 'TIEIN' }],
        6: [{ kind: 'add', ship: 'TIEIN' }],
      },
    },
    {
      name: 'Delta',
      arrival: { kind: 'setup' },
      vector: 3,
      aiTag: 'Flee*',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'replaceRandom', gate: { rebelInitGte: 3 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'replaceRandom', gate: { rebelInitGte: 5 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Command',
      arrival: { kind: 'setup' },
      vector: 4,
      aiTag: 'Flee*',
      composition: {
        1: [{ kind: 'addElite', ship: 'LAMBDA' }],
      },
    },
    {
      name: 'Epsilon',
      arrival: { kind: 'setup' },
      vector: 5,
      aiTag: 'Flee*',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replaceRandom', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'replaceRandom', gate: { rebelInitGte: 2 } }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Player Setup',
      body: `At the start of the mission, each player takes a number token (1-6) and places it on an asteroid or debris field to mark the hiding location of their ship. These hidden ships are ignored by the AI.`,
    },
    {
      title: 'Player Deployment',
      body: `Each turn, when it is a player's turn to move, they may choose to power up their ship and immediately deploy it overlapping the obstacle with the matching number token. Then, that player may plan and reveal a Blue maneuver, ignoring the obstacle from which the ship deployed.`,
    },
    {
      title: 'AI — Search & Rescue (all ships)',
      body: `While there are no Rebel ships in play, all enemy ships ignore their default AI priority and target the crippled shuttle to determine movement.

If there are Rebel ships in play, enemies with the Flee AI will continue to target the shuttle, but enemies with Attack will engage any Rebels in play as usual.`,
    },
    {
      title: 'Command Shuttle Detection',
      body: `After the Command shuttle has moved, any Rebel ships hidden in obstacles at Range 1 from it must immediately deploy as above, but cannot perform actions, maneuvers, or attack.`,
    },
    {
      title: 'AI — Discovering the Trap (all ships)',
      body: `The first time an enemy ship ends its maneuver within Range 1 of the crippled shuttle, it will perform a scan action for lifesigns. Then, all enemy ships revert to their AI priority listed in the table.`,
    },
    {
      title: 'AI — Fleeing Enemies',
      body: `These ships treat Edge A as their target, and will attempt to fly off that edge of the board. They always use the fastest speed available for the bearing chosen. They will still attack Rebels ships if able.`,
    },
  ],
};
