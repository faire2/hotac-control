# Scenarios & Campaigns

Last updated: 2026-05-31 (Phase 12 — holo mission maps landed)

Scenarios encode HotAC missions (briefing, map, objectives, squad composition, arrival timing, mission-specific rules) as typed data. The app loads a scenario, advances rounds, prompts for runtime events, and spawns AI squadrons accordingly.

All 17 missions from HotAC Mission Pack V2.07.04 are encoded in `src/data/scenarios/` (intro + 5 story arcs).

## Three modes

The app's top-level state is a discriminated `AppMode` union (see
`src/state/appMode.ts`):

```ts
type AppMode =
  | { kind: 'freePlay' }
  | { kind: 'scenarioOnly'; scenarioId; phase: ScenarioPhase }
  | { kind: 'campaign';     campaignId;  phase: CampaignPhase };
```

Modal overlays — main-menu dropdown, New-game picker, Open-campaign
browser, Campaign setup, end-scenario modal — are NOT separate AppModes.
They render on top of the current mode and dismiss independently.

**Free play** (default landing) — no scenario, manual squadron building.
Top bar shows the Menu button, Load Scenario, rank toggle, ± round
counter. Add squadrons via the "Add squadron" card.

**Scenario only** — a single mission run, no campaign progression. Player
arrives via Menu → New → Scenario → pick from `LoadScenarioModal`. Top
bar replaces the rank/round counter with title + Briefing/End/Next-round
controls. Mission outcomes route to the next mission via `arcLink` /
`replay`, otherwise drop back to free play.

**Campaign** — active campaign save with deck/points/history. Player
arrives via Menu → New → Campaign (creates a new save) or Menu → Open
(resumes a save). Sub-phases:
- `deckPick` — between missions; `DeckPickView` shows one card per arc
  head currently in the deck. Picking transitions to `briefing`.
- `briefing` / `active` / `ended` — same flow as scenario-only, but
  the End-Scenario resolve runs `applyOutcome` (in `factory.ts`), which
  mutates the deck (`arcLink` advances head, `arcDiscard` removes arc,
  `reshuffle` no-op, `campaignStart` promotes intro to main deck,
  `campaignEnd` terminates) and persists via the `CampaignStore`.

## Modal flow

1. **`LoadScenarioModal`** — picker. Disables scenarios whose `requiredModels` aren't all in `settings.ownedModels`, with a "Requires: X" hint.
2. **`ScenarioBriefingModal` (`mode='start'`)** — header has rank/players/AI/upgrades toggles. Body has briefing text, the holo map (`<MissionMap>` when `scenario.map` is set, else the ASCII `mapDiagram`) + notes, objectives. Footer: Back or Start.
3. On Start: clears squadrons, resets round to 1, spawns Setup squads + any `arrival.turn === 1` squads, opens `ArrivalNotificationModal` if anything spawned.
4. **`ScenarioBriefingModal` (`mode='view'`)** — re-opened during play. Same layout, no Start button.
5. **`DynamicSpawnPromptModal`** — fires before round advance when the scenario has unresolved dynamic-spawn handlers. Renders typed prompts (confirm checkbox, count input).
6. **`ArrivalNotificationModal`** — listed every spawn, with "N× Ship labelled as Squad approaching from Vector — hunts player N" lines.
7. **`EndScenarioModal`** — outcome picker. Each side has a button that applies its `Outcome.next`. Cancel returns to free play.
8. **`CampaignSettingsModal`** — owned-models checklist, Less Random Ships toggle, manual exotic-ships introduction overrides.

## Data shape (`src/data/scenarios/types.ts`)

```ts
interface Scenario {
  id: string;
  version: string;
  title: string;
  subtitle?: string;
  briefing: string;
  mapDiagram: string;                            // ASCII fallback (still required)
  mapNotes: readonly string[];
  map?: MissionMap;                              // hand-authored holo SVG map (preferred)
  turnLimit: number;
  territory: 'friendly' | 'hostile' | 'enemy';
  objectives: readonly ScenarioObjective[];
  victory: Outcome;                              // rebel-win
  defeat: Outcome;                               // imperial-win
  squads: readonly ScenarioSquad[];
  specialRules?: readonly SpecialRule[];
  randomPoolExclusions?: readonly ShipId[];      // per-mission `⚙` exclusions
  requiredModels?: readonly string[];            // physical models needed
  allies?: readonly AllySetup[];                 // NPC rebel ships (HWK/GR-75/Smuggler)
}

interface Outcome {
  text: string;
  next:
    | { kind: 'arcLink'; missionId: string }   // advance the arc head
    | { kind: 'arcDiscard' }                    // remove arc from deck (finale win)
    | { kind: 'reshuffle' }                     // deck unchanged
    | { kind: 'replay' }                        // intro-defeat path; deck unchanged
    | { kind: 'campaignStart' }                 // discard intro, populate main deck
    | { kind: 'campaignEnd' };                  // terminal: imperial campaign victory
  rebelPoints?: number;
  imperialPoints?: number;
  unlocksShipTypes?: readonly ShipId[];        // added to campaign.introducedShipTypes
}

interface ScenarioSquad {
  name: string;
  arrival: ArrivalTrigger;
  vector: Vector;
  approachLabel?: string;       // free-text display override ("Bay 1", "Diag.")
  aiTag: string;                // 'Attack' / 'Defend' / 'Special' — display tag
  tags?: readonly SquadTag[];   // single extensibility point for opt-in mechanics
  composition: Partial<Record<1|2|3|4|5|6, readonly SetupOp[]>>;
}

type SquadTag =
  | { kind: 'uniqueApproach' }
  | { kind: 'huntsPlayer' }
  | { kind: 'dynamicSpawn'; handler: string }
  | { kind: 'noUpgrades' };

type SetupOp =
  | { kind: 'add'; ship: ShipId; gate?: { rebelInitGte: number } }
  | { kind: 'addRandom'; gate?: ... }                  // squad-consistent random
  | { kind: 'replace'; ship: ShipId; gate?: ... }      // upgrades MOST RECENT ship only
  | { kind: 'replaceRandom'; gate?: ... }
  | { kind: 'addElite'; ship?: ShipId; gate?: ... }    // optional specific ship
  | { kind: 'addShields'; count: number; gate?: ... }
  | { kind: 'unparsed'; raw: string };                 // escape hatch; resolver throws

type SimpleVector = number | '1d6' | '1d12' | '1d6+6' | 'A' | 'B' | ... | 'H';
type Vector =
  | SimpleVector
  | readonly SimpleVector[]                            // pick one (PDF "2/3")
  | { kind: 'oppositeOf'; squadName: string };         // sibling-relative

type ArrivalTrigger =
  | { kind: 'setup' }
  | { kind: 'turn'; turn: number }
  | { kind: 'rolledTurn'; turn: number; roll: '1d6' };
```

## Mission map (`MissionMap`)

Each mission's map is a **hand-authored** declarative spec on `Scenario.map`. There is
no data-derived auto-layout: zones, tokens, and the vector ring are authored per
mission because real HotAC boards diverge too much to generalize. The ASCII
`mapDiagram` stays as a fallback for missions without a `map`.

The pure resolver `resolveMissionMap(scenario)` (in `missionMapModel.ts`) flattens
the spec into a `DrawableMap`; the `<MissionMap>` SVG component renders it. The only
genuinely-computed pieces are the seeded asteroid placement (min-distance rejection
sampling) and, when `vectors` is left to `'auto'`, the swept vector ring. An
asteroid feature may also carry `debris?` — a second class of red obstacle rocks
sampled jointly with the asteroids in the same pass, so the whole field keeps the
printed ">1 apart" spacing regardless of which obstacle class a rock belongs to.

```ts
interface MissionMap {
  grid?: number;                 // cells per side (default 9)
  seed?: number;                 // global RNG seed (default 1)
  setupEdge?: { side; depth?; label? } | false;  // synthesised warn-hued band; false = none
  zones?: readonly MapZone[];    // labelled regions (bands, rects, discs, corners, points)
  features?: readonly MapFeature[];  // asteroids field(s) + space stations
  tokens?: readonly MapToken[];      // playerStart / objective / structure / ship
  vectors?: readonly MapVector[] | 'auto' | 6 | 12 | false;  // approach ring
}

type MapHue = 'holo' | 'warn' | 'danger';   // → --accent-holo / --accent-warn / --accent-danger
type MapPoint = readonly [number, number] | 'center';   // cell units, origin top-left

interface MapZone {                          // exactly one shape key
  label?; hue?; tip?; id?;                    // id lets a feature target this zone (`in`)
  band?: { side: MapSide; depth: number; span?: readonly [number, number] };
  rect?: MapRect; disc?: { at; r }; corner?: { corner; radius }; point?: MapPoint;
}

type MapFeature =
  | { kind: 'asteroids'; count; debris?; in?; region?; seed?; minDist? }
  | { kind: 'station'; preset: 'triHub' | 'bar'; at; label?; tip? };

type MapToken =
  | { kind: 'playerStart'; at; playerCount?; tip? }
  | { kind: 'objective'; at; label?; tip? }
  | { kind: 'structure'; at; label?; playerCount?; tip? }
  | { kind: 'ship'; at; ship: ShipId; hue?; label?; playerCount?; tip? };

interface MapVector { n: number; side: MapSide; t: number; }  // t = 0..1 along the edge
```

**Ship tokens reuse the squad-view iconography** — `<MissionMap>` renders the real
X-Wing ship silhouette from the vendored `XWingShip` font as SVG `<text>`, keyed by a
`ShipId → glyph char` map (`TIELN:'F'`, `LAMBDA:'l'`, `TIEIN:'I'`, …). Don't re-author
ship art; add the glyph char to the map if a new ship type appears on a board.

**Band `span`** clips a left/right band along the Y axis (`[a, b]` in cell units; default
`[0, grid]` = full edge). Capture the Officer's red setup bands use `span: [1, 8]` so they
stop one cell short top and bottom while the blue escape band spans the full width.

**Vectors are authored per map.** The approach-vector ring differs wildly mission to
mission, so prefer an explicit `MapVector[]`. `'auto'` / `6` / `12` fall back to the swept
ring derived from the setup edge + whether any squad can roll 7..12; `false` hides it.

**Player-count-aware rendering.** `structure` and `ship` tokens may carry a
`playerCount` threshold. `resolveMissionMap(scenario, playerCount?)` keeps a token only
when the current count is `>=` its threshold (omit `playerCount` to show every token).
`ScenarioBriefingModal` threads its live player-count toggle through, so the map renders
the *actual* board for the selected count — gated turbolasers / cargo / shuttles fade in
as the table grows. Tokens with no threshold are always present. No count badges are drawn.

**Quarter-circle setup zones.** `corner: { corner: 'tl'|'tr'|'bl'|'br', radius }` renders
as an SVG arc wedge anchored at the chosen board corner (matches the printed quarter-circle
deployment areas), with the zone label centred on the wedge.

Authored examples: `localTrouble.ts` (bottom setup edge + central rect zone),
`captureOfficer1.ts` (no setup edge, top escape band + flanking setup bands + ship tokens),
and `captureOfficer3.ts` ("Miners Strike" — quarter-circle setup zone, `bar` landing-pad
stations, player-count-gated cargo blocks / turbolasers / second shuttle).

## Setup-op semantics

The setup ops mirror the X-Wing icon legend. **"replace" and "replaceRandom" only operate on the most recently added ship in the squad** — they upgrade one slot, not the whole squad. This matches the PDF reading "TIE Fighter and upgrade to random ship" (squad ends mixed: F, F, ↑R).

The first random op in a squad picks one ship type from the random pool (or via the d20 table when "Less Random Ships" is on); every subsequent random op in that same squad reuses that type.

## Vector resolution

`resolveVector(vector, roll?)` for fixed/dice/tuple inputs; `resolveSquadVector(vector, priorVectors, roll?)` for `oppositeOf` references.

`OPPOSITE_VECTOR` pairs (1↔7, 2↔9, 3↔8, 4↔10, 5↔12, 6↔11) — used by Bait's Support B to land opposite Support A.

Spawn-time: `priorVectors` is built from already-spawned squadrons (across rounds) so cross-round opposites resolve correctly.

## Random pool

`DEFAULT_RANDOM_SHIP_POOL = ['TIEIN', 'TIEADVX', 'TIEDEF', 'TIEPH', 'LAMBDA', 'VT49']`.

`Scenario.randomPoolExclusions` removes ships per mission (Bait excludes Lambda + Phantom; Cloak and Dagger excludes Phantom; Defector excludes Defender — each because the squad already places those ships explicitly).

When `CampaignSettings.lessRandomShips` is on, picks resolve via `rollD20RandomShip` (see `randomShipPool.ts`); see `memory/scenarios_random_ship_table.md` for the table.

## Spawn pipeline (`src/data/scenarios/spawn.ts`)

`spawnFromScenarioSquad(squad, ctx, compositionOverride?)` is the single
entry point — auto-spawn, dynamic-spawn handler outcomes, and
`compositionOverride` synthesized ops all flow through it.

`SpawnContext` carries everything the pipeline needs:

```ts
interface SpawnContext {
  scenario: Scenario;
  playerCount: PlayerCount;
  avgRebelInit: number;
  playersRank: number;
  upgradesSource: UpgradeSource;
  round: number;
  priorVectors: Map<string, SimpleVector>;  // mutable, threaded across calls
  settings: CampaignSettings;
}
```

Pipeline:

1. Resolve composition → ships, bonus shields, elite indices. Override
   replaces the per-player-count cell walk when supplied.
2. Determine spawn mode from tags:
   - **Default** — group ships by `(shipType, isElite)` into one Squadron each.
   - **Per-ship** (`uniqueApproach` or `huntsPlayer` set) — emit one
     Squadron per ship.
3. Resolve approach vector via `resolveSquadVector` (or `rollUniqueVector`
   for unique-approach squads).
4. For `huntsPlayer`, `shufflePlayerIndices` produces a 1..N permutation
   assigned one per squadron.
5. Stamp each Squadron with `scenarioSquadName`, `arrivedFromVector`,
   `approachLabel`, `arrivedAtRound`, `huntsPlayerIndex`.

Helper exports from the module:

- `priorVectorsFromSquadrons(squadrons)` — seed a fresh `priorVectors`
  map from already-spawned scenario squadrons. Used at the start of each
  round so cross-round `oppositeOf` resolves.
- `opsForShipsOverride(ship, count)` — convert a dynamic-spawn handler's
  `{ ship, count }` into a `SetupOp[]` for `compositionOverride`.

Spawn triggers (in `App.tsx`):

- On Start: every squad where `squadShouldSpawnAt(squad, 1)` is true.
- On Next round: every squad where `arrival.turn === newRound`, **plus**
  any dynamic-spawn squad whose handler returned `spawn: true`. Override
  decisions translate to `opsForShipsOverride` and re-enter the spawn
  pipeline rather than synthesizing Squadrons inline.

## Dynamic spawn

Squads tagged `{ kind: 'dynamicSpawn', handler: '<key>' }` defer their arrival to a runtime decision — see `dynamicSpawnHandlers.ts` and `memory/scenarios_dynamic_spawn.md`. Two handlers landed:
- `sensorCheckPatrol` (recurring; count input) — Disable Sensor Net's Patrol squad.
- `inspectionSquadOnIdentify` (one-shot; confirm input) — Secure the Holonet's Inspection squad.

## Scenario-wide engine + upgrades

`GlobalSquadsValuesContext.scenarioAiEngine` / `scenarioUpgradesSource` — when set during scenario play, hides the per-squadron toggles and applies one engine/source uniformly. Both default to `FGA` on scenario start.

## Validator coverage (`src/data/__validate__.ts`)

`checkScenarios` enforces:
- Unique scenario ids
- `turnLimit >= 1`; arrival turns within range
- Vector is `1..12`, a known dice form (`1d6` / `1d12` / `1d6+6`), a map letter, or a valid `oppositeOf` sibling reference
- Vector tuples non-empty
- `add` / `replace` / `addElite` ops reference known `Ships.X` keys
- `addShields.count > 0`; `gate.rebelInitGte >= 1`
- Composition non-empty (or `dynamicSpawn` tag present)
- Outcome.next.missionId references a known scenario (warns, doesn't fail)
- `Scenario.allies[].ship` is a known `AllyShipId`; starting hull/shields non-negative
- Shortcodes in briefing / objectives / specialRules / outcome text resolve to known icons

## Authoring a new scenario

1. Create `src/data/scenarios/<slug>.ts` exporting a `Scenario`.
2. Add it to `SCENARIOS` in `src/data/scenarios/index.ts`.
3. Build (`npm run build`) — validator runs in dev + as a vitest test.
4. Tag with `requiredModels` if it needs anything beyond the core fighters.
5. Tag with `randomPoolExclusions` if random rolls should skip specific ships.
6. Tag with `allies` for NPC rebel ships (Operatives' HWK, Bright Hope, etc.).

## File map

```
src/data/scenarios/
├── types.ts                      # Scenario, ScenarioSquad, SetupOp, SquadTag, Vector, Outcome, MissionMap
├── resolve.ts                    # resolveSquad, resolveVector, resolveSquadVector, OPPOSITE_VECTOR
├── spawn.ts                      # spawnFromScenarioSquad, SpawnContext, priorVectorsFromSquadrons, opsForShipsOverride
├── randomShipPool.ts             # DEFAULT_RANDOM_SHIP_POOL, rollD20RandomShip, pickFromD20Table
├── dynamicSpawnHandlers.ts       # DYNAMIC_SPAWN_HANDLERS registry + concrete handlers
├── localTrouble.ts               # intro mission
├── captureOfficer{1,2,3}.ts      # Capture Officer arc
├── refuelingStation{1,2,3}.ts    # The Refueling Station arc
├── minefields{1,2,3}.ts          # Minefields arc
├── chasingPhantoms{1,2,3,4}.ts   # Chasing Phantoms arc
├── defection{1,2,3}.ts           # Defection arc
└── index.ts                      # SCENARIOS registry + findScenario(id) + type re-exports

src/data/campaigns/
├── settings.ts                   # SpawnSettings, STANDARD_MODELS (derived), ownsRequiredModels
├── index.ts                      # CAMPAIGN_ARCS / MAIN_CAMPAIGN_ARCS / findArc registry
├── factory.ts                    # newCampaign(opts), applyOutcome(c, missionId, kind, outcome), pickMission
├── storage.ts                    # CampaignStore interface (Promise-based, future-DB-friendly)
├── storage.localStorage.ts       # CampaignStore impl backed by localStorage (`hotac.v1` key, version-wrapped)
└── storage.active.ts             # single import point: `campaignStore` — only file that picks the backend

src/state/
├── appMode.ts                    # AppMode discriminated union + helpers (FREE_PLAY, isFreePlay, etc.)
└── useCampaign.ts                # hook: load + save the active campaign by id

src/data/rebelAllies.ts           # REBEL_ALLIES registry, AllyShipId, AllySetup

src/data/upgrades/
└── getUpgrades.ts                # spawn-time upgrade picker (was at src/components/ai/upgrades/UpgradesGenerator.ts)

src/components/scenarios/
├── LoadScenarioModal.tsx         # picker + requiredModels gating
├── ScenarioBriefingModal.tsx     # briefing + setup / view-during-play
├── EndScenarioModal.tsx          # outcome picker (Rebel/Imperial victory)
├── DynamicSpawnPromptModal.tsx   # generic per-handler prompt renderer
├── ArrivalNotificationModal.tsx  # post-spawn arrivals listing
├── MissionMap.tsx                # holo SVG map renderer (zones, asteroids, ship tokens, vectors)
├── MissionMap.css                # .missionMap container styling
└── missionMapModel.ts            # pure resolveMissionMap(scenario) → DrawableMap (no React)

src/components/menu/
├── MainMenu.tsx                  # top-bar dropdown: New / Open / Logout
├── NewGamePickerModal.tsx        # New → Campaign / Scenario / Free Play
├── CampaignSetupModal.tsx        # name + intro toggle + owned models + arc selection
├── OpenCampaignModal.tsx         # saved-campaign browser + delete confirm
└── DeckPickView.tsx              # between-missions screen (one card per arc head)
```
