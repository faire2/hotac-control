import type { Scenario } from './types';

const briefing = `"Despite our best efforts, we have been unable to keep up with the Empire's vast mine-laying activities around Nulan.

The supplies on the transport Quantum Storm are still desperately needed on Sullust — we must not delay their arrival. Therefore, we have no choice but to blast our way through the system's asteroid field.

Protect the transport from Imperial Patrols until it clears the asteroid field and makes the jump to hyperspace."`;

const mapDiagram = `             4         5
        ┌─────────────────────┐
    3   │  A           [B]    │   6
        │  · · · · · · · ·    │
        │  · GR-75 · · · ·    │
        │  · · · · · · · ·    │
        │                     │
        │     A         A     │
        └─────────────────────┘
             2         1`;

export const minefields3: Scenario = {
  id: 'minefields-3',
  version: 'V 2.07.04',
  title: 'Care Package',
  subtitle: 'Mine Fields Part III',
  briefing,
  mapDiagram,
  mapNotes: [
    'Hostile Territory — 10 turns',
    'A: Player setup area',
    'B: Escape edge (Range 2 from corner)',
    'C: Asteroids ×12 (random layout, Range >1 apart and within box shown)',
    'Assault squads enter on any random vector behind the GR-75 front edge.',
  ],
  turnLimit: 10,
  territory: 'hostile',
  objectives: [
    {
      kind: 'primary',
      text: 'Escort the Quantum Storm to safety: (1) Transport escapes from Point B. (2) Any remaining Rebel ships must escape from Point B or jump to hyperspace by the end of Turn 10.',
    },
    {
      kind: 'bonus',
      text: 'If the transport escapes and has not discarded the Tibanna Gas Supplies card, all players gain 1 XP.',
      reward: '+1 XP',
    },
    {
      kind: 'bonus',
      text: `If the transport escapes with at least half its hull value remaining, all players gain 2 XP.`,
      reward: '+2 XP',
    },
  ],
  victory: {
    text: `"The transport is away! Those supplies will greatly assist with our efforts on Sullust. Well done pilots!"`,
    next: { kind: 'arcDiscard' },
    rebelPoints: 1,
  },
  defeat: {
    text: `"The Quantum Storm is lost! Our Rebel forces on Sullust will be crippled!" Each player loses their most expensive Upgrade.`,
    next: { kind: 'reshuffle' },
    imperialPoints: 1,
  },
  requiredModels: ['GR-75 Transport'],
  allies: [
    { ship: 'GR75', displayName: 'Quantum Storm' },
  ],
  squads: [
    {
      name: 'Alpha',
      arrival: { kind: 'setup' },
      vector: 3,
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'add', ship: 'TIELN' }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
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
        3: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 5 } }],
        4: [{ kind: 'add', ship: 'TIELN' }],
        5: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 3 } }],
        6: [{ kind: 'add', ship: 'TIELN' }],
      },
    },
    {
      name: 'Assault 1',
      // PDF vector "*" — "Any random vector that is behind the front edge of
      // the GR-75". Modelled as 1d6 here; runtime-relative constraint is
      // documented in mapNotes.
      arrival: { kind: 'rolledTurn', turn: 3, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Strike',
      composition: {
        1: [{ kind: 'add', ship: 'TIESA' }],
        2: [{ kind: 'add', ship: 'TIESA', gate: { rebelInitGte: 5 } }],
        3: [{ kind: 'add', ship: 'TIESA' }],
        5: [{ kind: 'add', ship: 'TIESA' }],
      },
    },
    {
      name: 'Elite',
      arrival: { kind: 'rolledTurn', turn: 3, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'addElite' }],
      },
    },
    {
      name: 'Gamma',
      arrival: { kind: 'rolledTurn', turn: 6, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Attack',
      composition: {
        1: [{ kind: 'add', ship: 'TIELN' }],
        2: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 5 } }],
        3: [{ kind: 'add', ship: 'TIELN' }],
        4: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 4 } }],
        5: [{ kind: 'add', ship: 'TIELN' }],
        6: [{ kind: 'replace', ship: 'TIEIN', gate: { rebelInitGte: 3 } }],
      },
    },
    {
      name: 'Assault 2',
      // PDF vector "*" — same constraint as Assault 1 (behind GR-75 front edge).
      arrival: { kind: 'rolledTurn', turn: 8, roll: '1d6' },
      vector: '1d6',
      aiTag: 'Strike',
      composition: {
        1: [{ kind: 'add', ship: 'TIESA', gate: { rebelInitGte: 4 } }],
        2: [{ kind: 'add', ship: 'TIESA' }],
        4: [{ kind: 'add', ship: 'TIESA' }],
        6: [{ kind: 'add', ship: 'TIESA' }],
      },
    },
  ],
  specialRules: [
    {
      title: 'Rebel Transport Setup',
      body: `The Transport is represented by a GR-75 that begins the game with 5 Energy, and is equipped with: Quantum Storm; Damage Control Team; Comms Team; Tibanna Reserves.`,
    },
    {
      title: 'Assault Squadrons (Enemy Strike AI)',
      body: `Instead of the standard setup, each of the TIE Bombers with Strike AI is equipped with a Proton Torpedo with 2 charges. They will prioritize the transport over all other Rebel ships, unless they cannot fire on it. They will only use their Proton Torpedoes when attacking the transport.`,
    },
    {
      title: 'Enemy Attacks vs. Huge Ships',
      body: `Enemy ships that can attack a section of the transport that does not have a Reinforce token will prioritize attacking the transport, even if there are closer Rebel ships.`,
    },
    {
      title: 'Overlapping with Huge Ships',
      body: `If a Huge ship destroys an AI ship by overlapping it, it will suffer damage to the section that overlapped. Roll an attack die. On a :crit: result, suffer 1 face-up damage card. On any other result, suffer 1 damage card.`,
    },
  ],
};
