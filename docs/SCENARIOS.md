# Scenarios

Last updated: 2026-05-05

Scenarios encode HotAC missions (briefing, map, objectives, squad composition, arrival timing) as typed data. The app loads a scenario, advances rounds, and spawns AI squadrons on schedule.

## Two regimes

The main screen has two distinct modes:

**Free play (no scenario active)**
- Top bar: Load Scenario, players' rank toggle, ± round counter.
- Each squadron has its own AI engine + upgrades-source toggles (rendered inside `Squad` and `UpgradesCard`).
- Squadrons added manually via the "Add squadron" card.

**Scenario play (`activeScenarioId` set)**
- Top bar: title + "N players of rank R", Briefing, Round display + "/ turnLimit", End scenario, Next round.
- Round counter is **one-way** (Next round only) — `Next round` increments and triggers any squad whose `arrival.turn === newRound`.
- Per-squadron AI engine and upgrades-source toggles are hidden — both are scenario-wide and live in the briefing modal header instead.
- "End scenario" opens an outcomes recap (objectives + Rebel/Imperial victory text) before clearing state.

## Modal flow

1. **`LoadScenarioModal`** — picker. Shows the list of available scenarios. Selecting one stages it for briefing.
2. **`ScenarioBriefingModal` (`mode='start'`)** — header has rank / number / AI / upgrades toggles. Body has briefing text, centered ASCII map + notes, and objectives. Footer: Back (re-opens picker) or Start scenario.
3. On Start: clears squadrons, resets round to 1, spawns all `Setup` squads (and any `arrival.turn === 1` squads).
4. **`ScenarioBriefingModal` (`mode='view'`)** — re-opened during play via the Briefing button. Same layout; toggles editable (changes propagate to spawned squadrons), no Start button, just Close.
5. **`EndScenarioModal`** — opened by the End scenario button. Shows objectives + Rebel/Imperial victory text. Closing clears squadrons, resets round, returns to free play.

## Data shape (`src/data/scenarios/types.ts`)

```ts
interface Scenario {
  id: string;
  version: string;
  title: string;
  subtitle?: string;
  briefing: string;          // multi-paragraph; split on blank lines for rendering
  mapDiagram: string;        // ASCII; rendered in <pre> centered horizontally
  mapNotes: readonly string[];
  turnLimit: number;
  territory: 'friendly' | 'hostile' | 'enemy';
  objectives: readonly ScenarioObjective[];  // primary | bonus, free text + optional reward
  victory: { rebel: string; imperial: string };
  squads: readonly ScenarioSquad[];
}

interface ScenarioSquad {
  name: string;                   // 'Alpha', 'Beta', ...
  arrival: ArrivalTrigger;        // setup | turn N | rolledTurn N (1d6)
  vector: number | '1d6';         // edge 1-6 or random per spawn
  aiTag: string;                  // 'Attack', 'Defend', etc. — display tag, not an engine
  noUpgrades?: boolean;           // skip Imperial Pilot draw (e.g. Local Trouble's Gamma TIE Interceptors)
  composition: Partial<Record<1|2|3|4|5|6, readonly SetupOp[]>>;
}

type SetupOp =
  | { kind: 'add'; ship: ShipId; gate?: { rebelInitGte: number } }
  | { kind: 'addRandom'; gate?: ... }       // squad-consistent random ship type
  | { kind: 'replace'; ship: ShipId; gate?: ... }
  | { kind: 'replaceRandom'; gate?: ... }
  | { kind: 'addElite'; gate?: ... };       // always random per the legend
```

`SetupOp` mirrors the Mission Pack's setup-icon legend (`+<ship>`, `↑<ship>`, `<N>+<ship>`, etc.). Cells in `composition` are walked **left-to-right by player count** — at *Np* players, apply the ops in cells 1..N in order.

## Resolution (`src/data/scenarios/resolve.ts`)

Lazy: a squad's concrete ship list is computed when its arrival turn comes up, not at scenario load.

```ts
resolveSquad(squad, { playerCount, avgRebelInit }): ResolvedSquad
```

- Walks `composition[1..playerCount]` and applies each op.
- `gate` is checked against `avgRebelInit` (the red-N prefix in the icon legend).
- `add`, `replace`, gates are implemented today.
- `addRandom`, `replaceRandom`, `addElite` **throw** with a clear message — Local Trouble doesn't use them. Implement when a later mission requires them.

## Spawning (`App.tsx`)

`spawnFromScenarioSquad(squad, playerCount, avgRebelInit, playersRank, upgradesSource)` calls `resolveSquad`, groups by ship type, and emits one `Squadron` per group with `ships.length === count`. Each squadron is tagged with `scenarioSquadName` for future labelling.

Spawn triggers:
- On Start: every squad where `squadShouldSpawnAt(squad, 1)` is true (`Setup` squads + `arrival.turn === 1`).
- On Next round: every squad where `arrival.turn === newRound`.

`rolledTurn` is currently treated identically to `turn` (the 1d6 roll for arrival timing isn't actually rolled). Local Trouble uses 1d6 only for vectors, so this isn't yet exercised.

## Scenario-wide engine + upgrades

`GlobalSquadsValuesContext` carries optional `scenarioAiEngine` and `scenarioUpgradesSource`. App.tsx sets them when a scenario is active and propagates changes:

- `scenarioAiEngine` — read by `Squad` (`src/components/ai/Squad.tsx`); when set, the per-squadron AI toggle is hidden and `aiEngine = scenarioAiEngine ?? localAiEngine`.
- `scenarioUpgradesSource` — read by `UpgradesCard`; when set, the per-squadron toggle is hidden. `handleScenarioUpgradesSourceChange` in `App.tsx` recomputes every existing squadron's upgrades + reapplies the hull/shield delta.

Both default to `FGA` / `FGA upg.` when a scenario starts.

## Validator coverage (`src/data/__validate__.ts`)

`checkScenarios` enforces:
- Unique scenario ids
- `turnLimit >= 1`
- Vector is `1..6` or `'1d6'`
- `arrival.turn <= turnLimit` for `turn` / `rolledTurn` arrivals
- `add` / `replace` ops reference known `Ships.X` keys
- `gate.rebelInitGte >= 1`
- Composition is non-empty; player-count keys are `1..6`

## Authoring a new scenario

1. Create `src/data/scenarios/<slug>.ts` with a typed `Scenario` export.
2. Add it to `SCENARIOS` in `src/data/scenarios/index.ts`.
3. Build (`npm run build`) — the validator runs in dev + as a vitest test, so any ship-id typo or out-of-range turn fails fast.
4. ASCII map convention: HotAC vector edges sit at 1/3 from corners. For Local Trouble: top-edge `4 5`, bottom-corners `2` (left) `1` (right), left-side `3` (1/3 from top), right-side `6` (1/3 from top). Center the diagram in `<pre>`.

## File map

```
src/data/scenarios/
├── types.ts                # Scenario, ScenarioSquad, SetupOp, ArrivalTrigger
├── resolve.ts              # resolveSquad, summarizeSquad, ResolveContext
├── localTrouble.ts         # Mission Pack V2.07.04, intro mission
└── index.ts                # SCENARIOS registry + findScenario(id)

src/components/scenarios/
├── LoadScenarioModal.tsx       # picker (step 1)
├── ScenarioBriefingModal.tsx   # briefing + setup (step 2) / view-during-play
└── EndScenarioModal.tsx        # outcomes recap on End scenario click
```
