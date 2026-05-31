# Project Roadmap

Last updated: 2026-05-31 (Phase 12 — holo mission maps: hand-authored SVG `MissionMap` spec, ship-silhouette tokens, asteroid+debris fields, player-count-aware token gating + quarter-circle setup zones, Local Trouble + Capture the Officer I/II/III maps)

## Project summary

`hotac-control` is a single-page React app that automates the Imperial AI for **Heroes of the Aturi Cluster**, a fan-made cooperative campaign for FFG's X-Wing Miniatures. This roadmap covers a modernization pass: migrate off the dead Create React App / Heroku stack, replace the abandoned Hinny AI engine with Anderson, and harden the data layer with TypeScript.

## Current Phase: Phase 7 — Vercel deployment (Anderson transcription deferred)

### Phase 6 — Hinny removal ✓ (2026-05-03, brought forward)
- [x] Delete `src/data/hinny/` entirely
- [x] Remove `AI.HINNY` and `UPGRADES.HINNY` from enums
- [x] Remove dispatch sites (SquadManeuverGenerator, actionsCarousel/*, TargetPosition selector toggle)
- [x] Hoist canonical `HULL_UPGRADE` / `SHIELD_UPGRADE` to `src/data/shared/coreUpgrades.ts`

### Bug fixes during sweep verification (2026-05-03)
- [x] Icon font silently rendering as Latin letters: removed CRA-era `import './fonts/*.ttf'` side-effect imports from `App.tsx`. Under Vite those imports get a `?import=` wrapper that shadows the CSS `@font-face` fetch. CSS-side `url()` refs now drive font loading; binaries still emit to `dist/assets/`. Documented in AGENTS.md so the imports don't get re-added.
- [x] `engines.node` loosened from `"20.x"` to `">=20"` — yarn (strict equality) was refusing to run on Node 22+/24. Vercel + new `.nvmrc=20` keep deploys pinned to Node 20.
- [x] `vite.config.ts`: dropped `server.open: true` — was opening browser tabs on every dev-server start, hostile in scripted contexts.

### Best-practices sweep ✓ (2026-05-03)
- [x] Adopt `:icon-name:` shortcode format (Slack/Discord/GitHub idiom) for inline icons
- [x] `src/data/icons.ts` (typed `IconKey` registry), `src/data/shortcodes.ts` (parser), `src/components/Rule.tsx` (renderer)
- [x] Convert all JSX-in-data to plain-string descriptions with shortcodes (FGA upgrade pool, Community upgrades, FGA priority lists)
- [x] Discriminated `UpgradeRow` union (`{source: 'FGA' | 'COMMUNITY' | 'ANDERSON', ...}`) replaces overloaded `[u, i, x]` tuple
- [x] `FgaUpgradePool.ts` (typed FGA pool), `FgaUpgrades.ts` (typed tree), `CommunityUpgradeTree.ts` (typed Community tree)
- [x] Convert all 30+ remaining JSX/JS files to TSX/TS (App, Squad, SquadGenerator, SquadStats, ShipsVariables, Variables, UpgradesCard, SquadActionsCarousel, TargetPosition, TargetPositionDiagram, SquadManeuverGenerator, FGA + Anderson dispatchers)
- [x] tsconfig blanket include `src/**/*` (no more selective list workaround)
- [x] Validator extended with shortcode resolution check
- [x] `key={crypto.randomUUID()}` per squad (replaces buggy `key={i}` after `i++`)
- [x] Bootstrap class typo fix (`col-l-3 col-m-4` → `col-lg-3 col-md-4`)
- [x] Heavy-Laser-Cannor → Heavy-Laser-Cannon (typo fix surfaced by mechanical conversion)
- [x] All `console.log` calls stripped from production code

### Phase 1 — Planning & Documentation ✓
- [x] Decide deployment target → Vercel (no backend, static SPA) (2026-05-02)
- [x] Decide AI engine replacement → drop Hinny, add Anderson (2026-05-02)
- [x] Survey Anderson PDFs (2026-05-02)
- [x] Rename local branch `master` → `main` (2026-05-02)
- [x] Update `.gitignore` (2026-05-02)
- [x] Write `AGENTS.md`, `CLAUDE.md`, `docs/DOC_CATALOG.md`, `docs/DATA-LAYER.md` (2026-05-02)

### Phase 2 — Vite + TS scaffolding ✓
- [x] Delete duplicate subtree `src/components/ai/src/` (41 files, 480KB) (2026-05-02)
- [x] Delete vestigial flat-level files in `src/components/ai/` and `src/data/` (11 files of dead code referencing removed APIs) (2026-05-02)
- [x] Vite + TS scaffolding: `vite.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `prettier.config.mjs`, root `index.html`, `src/main.jsx` entry (2026-05-02)
- [x] Migrate `package.json`: drop `react-scripts`, add `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, ESLint flat plugins, Prettier (2026-05-02)
- [x] Drop `xwing-miniatures-font` npm pkg — pulled `node-sass` which doesn't compile on Node 24; fonts already vendored locally in `src/fonts/`, no behavior change (2026-05-02)
- [x] Rename JSX-bearing `.js` files to `.jsx` (Vite requires explicit JSX extension; 37 files affected) (2026-05-02)
- [x] `npm run dev` serves index.html, validator wired, no errors (2026-05-02)
- [x] `npm run build` produces `dist/` (131 modules, 335KB JS, 175KB CSS gzipped: 90KB / 27KB) (2026-05-02)
- [x] Write `docs/COMPONENT-CATALOG.md` (2026-05-02)

### Phase 3 — Strip Express + add Vercel config ✓
- [x] Delete `src/server/server.js` and `/ping` (2026-05-02)
- [x] Drop `express`, `path` from `package.json` (2026-05-02)
- [x] `vercel.json` with SPA rewrite (2026-05-02)
- [x] `.vercelignore` excluding `docs/`, `.idea/`, `.claude/`, `*.md` (2026-05-02)
- [x] Pin Node version `"engines": { "node": "20.x" }` (2026-05-02)

### Phase 4 — Type the data-layer beachhead ✓
- [x] `src/data/Maneuvers.ts` — typed `Position`, `Maneuver`, `ManeuverTuple` (2026-05-02)
- [x] `src/data/Ships.tsx` — typed `Ship`, `ShipId`, `AiEngine`, `UpgradeSource`, `AttackProfile`, `Stats` (kept `.tsx` because of JSX in `ATTACKS` — JSX-in-data tech debt deferred per backlog) (2026-05-02)
- [x] `src/context/Contexts.ts` — typed `TargetPositionContextValue`, `GlobalSquadsValuesContextValue`, `ShipHandlingContextValue`, `Squadron`, `ShipInstance` (2026-05-02)
- [x] `src/data/__validate__.ts` — runtime validator covering FGA path: AI coverage, position coverage, length-6 arrays, resolved maneuver references, upgrade source enum (2026-05-02)
- [x] Validator wired as side-effect in `App.jsx` (`if (import.meta.env.DEV)`) (2026-05-02)
- [x] `tests/dataLayer.test.ts` — Vitest test asserting validator does not throw against current data; passes (2026-05-02)
- [x] `npm run build` runs `tsc --noEmit && vite build` — passes; full type-checked beachhead build (2026-05-02)

### Phase 5a — Anderson infrastructure ✓ (2026-05-03)
- [x] Add `AI.ANDERSON` and `UPGRADES.ANDERSON` to enums
- [x] Extend `ShipId` for the 8 Anderson-only ships (TIESK, TIERP, TIEADVV1, TIERBA, TIERBH, TIECP, STARWING, SITH); add ship entries with stats read from PDFs (verify in 5b)
- [x] Add `AI.ANDERSON` and `UPGRADES.ANDERSON` to all existing Imperial ships' `ai`/`upgrades` arrays
- [x] Decision: Anderson reuses FGA's `Position` enum keys — R2 split collapses to R1 (closing) / R3 (fleeing) per Anderson rules, so no new positions or UI toggle needed
- [x] Create `src/data/anderson/`: `Maneuvers.ts` (typed empty table), `AndersonAbilities.ts`, `AndersonPhases.ts`, `Anderson{TargetSelection,ShipActions,Attack}.jsx` (stub renderers with TODO placeholders), `AndersonPositionSelection.jsx` (re-exports FGA grid for now)
- [x] Wire `AI.ANDERSON` into `SquadManeuverGenerator.jsx`, `actionsCarousel/SquadActions.ts`, `SquadAttack.ts`, `SquadTargetSelection.ts`, `maneuvers/TargetPosition.jsx` engine selector
- [x] `SquadManeuverGenerator` guards missing entries with a TODO badge so app doesn't crash
- [x] Validator: add Anderson coverage with phase-aware tolerance (5a OK with empty tables; 5b will tighten)
- [x] Build + test green at `npm run build` and `npm test`

### Phase 5b — Anderson data transcription (DEFERRED)
Deferred per 2026-05-03 decision: Anderson scaffolding stays in tree (enums, stub renderers, validator tolerance) but full transcription is on hold. Engine selector still exposes `AI.ANDERSON` with TODO badges. Revisit when there's appetite for the ~1900-cell transcription effort.

Items remaining if/when picked up:
- Verify ship stats in `Ships.tsx` against PDFs (TIESK, TIERP, TIEADVV1, TIERBA, TIERBH, TIECP, STARWING, SITH)
- Transcribe maneuver tables for 16 ships (~1900 cells) from `docs/anderson/pages/p-NN.png` into `src/data/anderson/Maneuvers.ts`
- Transcribe target priorities → `AndersonTargetSelection.jsx`
- Transcribe action priorities → `AndersonShipActions.jsx`
- Transcribe attack priorities → `AndersonAttack.jsx`
- Transcribe pilot abilities (Sensitive Controls, Strypium Array, Full Throttle, etc.) → `AndersonAbilities.ts`
- Transcribe System/End Phase descriptions → `AndersonPhases.ts`
- Decide TIE/d Defender Elite (page 7) modeling — 2nd card per ship, or new variant key (DATA-LAYER §7)
- Decide TIE/rb Heavy two-page question — duplicate, two pilots, or front/back (DATA-LAYER §16)
- Transcribe upgrade tables from pilot card PDFs (2x and 4x decks) → `AndersonUpgrades.ts`
- Implement the Anderson upgrade unlock rule (initiative-threshold based, no rank scaling)
- Wire `UPGRADES.ANDERSON` into `UpgradesGenerator.js` (currently falls through to NO_UPGRADE)
- Tighten validator: hard error on Anderson coverage gaps
- **Defer Gozanti-Class Cruiser** to a follow-up — separate "huge ship" schema needed

### Phase 5 deviations from original plan (resolved during 2-4)
- React stays at **16.14** (not 18 as originally planned). Reason: `react-bootstrap@1.0.0-beta.16` predates React 18 and a major bump risks API breaks during Phase 2's "no behavior change" goal. React 18 + react-bootstrap 2.x is now a follow-up phase.
- Bootstrap stays at **4.4.1** (not 5.x). Reason: Bootstrap 5 renamed several utility classes (`pl-*` → `ps-*`, etc.) which would change behavior. One occurrence of `pl-5` exists in `SquadGenerator.jsx`.
- **Vitest** chosen over Jest (better Vite integration, no extra Babel config).
- **Selective tsconfig include** (just the typed files + their direct .jsx callers) rather than blanket `src/**` because `src/data/hinny/HinnyEliteShips.jsx` has a parse error on line 128 that would block tsc. Hinny is being deleted in Phase 6, so this is a stopgap.

**Phase 6 — Remove Hinny**
- [ ] Delete `src/data/hinny/` entirely
- [ ] Remove `AI.HINNY` and `UPGRADES.HINNY` from enums
- [ ] Remove `hinnyManeuvers` import from `SquadManeuverGenerator`
- [ ] Remove HINNY branch from `UpgradesGenerator`
- [ ] Update `App.js` import from `HinnyUpgrades` → shared hull/shield upgrade reference (probably hoist these to a neutral location, since both Anderson and FGA need them)
- [ ] Default `aiEngine` state in `Squad.js` stays `AI.FGA`

**Phase 7 — Vercel deployment**
- [ ] Push `main` branch to GitHub (rename remote default branch via GitHub settings first)
- [ ] Connect repo to Vercel via dashboard (not CLI)
- [ ] Verify preview deploy renders correctly
- [ ] Configure custom domain if desired
- [ ] Promote to production

### Phase 8 — Scenario loader (2026-05-05)

See [`docs/SCENARIOS.md`](docs/SCENARIOS.md) for the feature spec.

- [x] `src/data/scenarios/types.ts` — `Scenario`, `ScenarioSquad`, `SetupOp` (add/replace/random/elite + init gate), `ArrivalTrigger`, `Vector`
- [x] `src/data/scenarios/resolve.ts` — composition resolver (column-walk, init-gated). Random / replace-random / elite ops throw until a mission needs them
- [x] `src/data/scenarios/localTrouble.ts` — first scenario (Mission Pack V2.07.04, intro mission, page 4–5)
- [x] Validator extended: scenario ship refs, vector range, arrival turn ≤ turnLimit, unique scenario ids, non-empty composition
- [x] Two UI regimes: free play preserves existing flow; scenario play hides per-squadron AI/upgrades toggles, drives them from the briefing modal header instead, and replaces ± round controls with one-way "Next round"
- [x] `LoadScenarioModal` (picker) → `ScenarioBriefingModal` (rank/number/AI/upgrades + briefing/map/objectives + Start) → scenario active. Briefing reopen during play in view mode
- [x] `EndScenarioModal` shows outcomes recap (objectives + Rebel/Imperial victory text) before clearing state
- [x] Squadrons spawn lazily on arrival turn via `spawnFromScenarioSquad`. Scenario engine + upgrades-source flow through `GlobalSquadsValuesContext` (`scenarioAiEngine`, `scenarioUpgradesSource`); changes mid-play propagate to all spawned squadrons
- [x] CSS: subgrid in `SquadStats` so Init/Attack/Agility/XP values line up under headers; ghost-style buttons (`.btn-scenario-action`) for Briefing/End scenario/Next round
- [x] Author all 17 missions of HotAC Mission Pack V2.07.04 (intro + 5 story arcs) — Phase 9
- [x] Surface `scenarioSquadName` + approach vector + huntsPlayer on the Squad card — Phase 9
- [ ] Implement the `1d6` arrival roll (currently `rolledTurn` arrivals are treated as plain `turn`); deferred

### Phase 9 — Mission pack & extensibility (2026-05-06)

Authored all 17 missions, decoded the X-Wing icon font glyphs, and built the surrounding infrastructure (campaign settings, dynamic spawn, outcome branching, ally data model). Build clean, 21 tests passing, lint clean for files touched this session.

**Data — full mission pack**
- [x] All 17 scenarios encoded in `src/data/scenarios/` (intro + Capture Officer 1-3 + Refueling Station 1-3 + Minefields 1-3 + Chasing Phantoms 1-4 + Defection 1-3)
- [x] All squad-cell glyphs decoded via interactive PDF review (no `unparsed` cells remain in any mission)
- [x] `src/data/campaigns/index.ts` — 6 Campaign objects (intro + 5 arcs)
- [x] `src/data/rebelAllies.ts` — REBEL_ALLIES registry for HWK-290, GR-75, Outer Rim Smuggler

**Types & resolver extensions**
- [x] `Outcome` model with discriminated `OutcomeNext` (mission / reshuffle / replay / campaignStart / campaignEnd) + per-side rebelPoints/imperialPoints
- [x] `SpecialRule` field for mission sidebars (Shuttle AI, Escort AI, etc.)
- [x] `SquadTag` discriminated-union extensibility point: `uniqueApproach`, `huntsPlayer`, `dynamicSpawn`, `noUpgrades`. `hasTag` helper for typed lookup.
- [x] `SetupOp.addShields` (count: number) — handles the `+N*` shield-bonus glyph
- [x] `SetupOp.addElite.ship?` — optional specific ship for medal+specific-ship cells (mission 8 Elite Bomber, captureOfficer2 Elite Lambda)
- [x] `Vector` extended: numbers 1-12, `'1d12'`, `'1d6+6'`, tuples `[2,3]` (PDF "2/3"), `{ kind: 'oppositeOf', squadName }` for sibling-relative spawns (Bait's Support B)
- [x] `OPPOSITE_VECTOR` pairs (1↔7, 2↔9, 3↔8, 4↔10, 5↔12, 6↔11) and `resolveSquadVector` with priorVectors map
- [x] `resolveVector` standalone resolver (handles fixed/dice/tuple); covered by tests
- [x] `Scenario.randomPoolExclusions` — per-mission ship-type exclusions (Bait, Cloak and Dagger, Defector, Pride of the Empire)
- [x] `Scenario.requiredModels` — physical-model prerequisites (free-form strings); 13 missions tagged
- [x] `Scenario.allies` — NPC rebel ship setup (7 missions tagged with HWK / GR-75 / Outer Rim Smuggler)
- [x] `ScenarioSquad.approachLabel` — display override for non-edge spawn points (Bay 1, Diagonal)

**Spawn pipeline**
- [x] Per-ship squadron emission when `uniqueApproach` or `huntsPlayer` tag set (Revenge's Aces)
- [x] `rollUniqueVector` with retry-on-duplicate (max 200 attempts)
- [x] `shufflePlayerIndices` Fisher-Yates assignment for `huntsPlayer`
- [x] Vector resolution at spawn time (not data load) for `'1d6'` / `'1d12'` / `'1d6+6'` / tuples
- [x] `Squadron.arrivedFromVector`, `arrivedAtRound`, `huntsPlayerIndex`, `approachLabel` stamped at spawn
- [x] `priorVectors` map reseeded from already-spawned squadrons each round (cross-round `oppositeOf` works)

**Campaign settings**
- [x] `src/data/campaigns/settings.ts` — `CampaignSettings` (ownedModels, lessRandomShips, introducedShipTypes), `STANDARD_MODELS`, `SHIP_INTRODUCTIONS`, localStorage persistence
- [x] `CampaignSettingsModal` — owned-models checklist, less-random-ships toggle, exotic-ships introduction overrides
- [x] `LoadScenarioModal` greys missions whose `requiredModels` aren't all in `ownedModels`, with "Requires: X" hint
- [x] "Less random ships" 1d20 weighted table in `randomShipPool.ts` (5 brackets + fallbacks for not-yet-introduced exotics)
- [x] `introducedShipTypes` auto-updates on rebel victory of unlock missions (chasing-phantoms-1, defection-2)

**Dynamic spawn**
- [x] `src/data/scenarios/dynamicSpawnHandlers.ts` — registry pattern, two concrete handlers (`sensorCheckPatrol`, `inspectionSquadOnIdentify`)
- [x] `DynamicSpawnPromptModal` — generic typed-prompt renderer (confirm/count) gated to "Next round" before spawn-advance
- [x] One-shot vs recurring lifecycle; `resolvedDynamicSquads` set reset on scenario start/end

**Outcome branching**
- [x] `EndScenarioModal` redesigned: two outcome buttons (Rebel/Imperial victory) instead of single Close
- [x] `handleEndScenarioResolve` follows `Outcome.next`: `mission` stages the next briefing, `replay` re-stages this one, others fall through to free play
- [x] Rebel victory auto-applies `SHIP_INTRODUCTIONS` updates to campaign settings

**Arrival notification**
- [x] `ArrivalNotificationModal` — fires on Start Scenario and Next Round when ships spawned. Lists "N× Ship labelled as Squad approaching from Vector — hunts player N"
- [x] Squad card displays `scenarioSquadName` + approach + huntsPlayer line in scenario mode

**Tests**
- [x] `tests/scenarioResolvers.test.ts` — 20 tests covering `resolveVector`, `resolveSquadVector`, `OPPOSITE_VECTOR`, `pickFromD20Table`, `rollD20RandomShip`

**Deferred to follow-up**
- [ ] Render ally squadrons in the UI — task #12 in TaskList. Data foundation landed; full integration needs a `Squadron.shipType` discriminated-union decision (or parallel `allySquadrons` state). Per-mission upgrade lists (Quantum Storm, Damage Control Team, etc.) live in `specialRules` text.

### Phase 10 — Architectural cleanup pass (2026-05-06, in progress)

After the Phase 9 push, an architectural review identified several growth pressures
(see `docs/SCENARIOS.md` and the session retrospective). Tackling step-by-step.

**Step 1 — Extract spawn pipeline** ✓ (2026-05-06)
- [x] `src/data/scenarios/spawn.ts` — `spawnFromScenarioSquad`, `SpawnContext`,
  `priorVectorsFromSquadrons`, `opsForShipsOverride`, `shufflePlayerIndices`,
  `rollUniqueVector`. Pure data-layer module, no React.
- [x] `ResolveContext.compositionOverride` — `resolveSquad` accepts an ops list
  that bypasses the per-player-count cell walk. Used by dynamic-spawn handlers.
- [x] `App.tsx` `performRoundAdvance` — refactored from a hand-built synthetic
  Squadron path to using the unified `spawnFromScenarioSquad` with
  `compositionOverride`. The dynamic-spawn duplication (issue #6 from the review)
  is gone.
- [x] `getUpgrades` relocated from `src/components/ai/upgrades/UpgradesGenerator.ts`
  to `src/data/upgrades/getUpgrades.ts` — pure data-layer code, was in the
  components tree by accident.
- [x] `tests/spawn.test.ts` — 6 tests covering grouping, empty-resolved
  vector recording, `compositionOverride`, `priorVectorsFromSquadrons`,
  `opsForShipsOverride`. Total test count: 27/27 passing.
- [x] App.tsx shrunk from ~700 → ~570 lines. Spawn concerns no longer scattered
  across the file.

**Step 2 — `SettingsContext`** (deferred — defer until adding a new settings consumer)
**Step 3 — `AppMode` discriminated state + transitions** (deferred — pays off when main menu / saved campaigns land; until then, the spread `useState`s are tractable)

Other architectural concerns from the review still queued:
- [x] Step B — Unify model name taxonomy via `Ship.name` + `AllyShipDef.name` (2026-05-11). Resolved instead of introducing a parallel `ModelId` type: `Ship.name` is the canonical physical-model identity; `STANDARD_MODELS` derives from `Ships` (excluding `alwaysOwned`) + `REBEL_ALLIES`; `SHIP_TO_MODEL` map deleted; validator asserts `Scenario.requiredModels` entries match a known Ship/Ally name.
- [x] Step C — Move ship-introduction unlocks onto `Outcome` (2026-05-11). `SHIP_INTRODUCTIONS` map replaced by `Outcome.unlocksShipTypes`; `applyOutcome` reads from the outcome (signature lost the `shipsToIntroduce` arg); `REQUIRES_INTRO` in `randomShipPool.ts` derived from `SCENARIOS.flatMap(s => [victory.unlocksShipTypes, defeat.unlocksShipTypes])` — outcome declaration is now the single source of truth for introduction-gated ships.
- [x] Step D — Derive `Scenario.requiredModels` from data (2026-05-11). New `src/data/scenarios/requiredModels.ts` exports `requiredModelsFor(scenario)`, which walks `composition[*][*]` for `add`/`replace`/`addElite` ops carrying a specific `ship`, walks `allies[*].ship`, filters `Ships[id].alwaysOwned`, and dedupes by display name. `Scenario.requiredModels` field dropped; 13 hand-maintained per-scenario lines deleted. Consumers (`LoadScenarioModal`, `CampaignSetupModal`) call the helper. Validator's name-existence check is gone — correctness is now structural. Side effect: missions that reference common Imperials (TIE/in, TIE/sa) now correctly include them in the gating set, where they were silently omitted before.
- [x] Step E — Group scenario-spawn fields on Squadron under `scenarioMeta?: ScenarioSpawnMeta` (2026-05-11). New `ScenarioSpawnMeta` interface in `Contexts.ts`; 5 scattered optional fields (`scenarioSquadName`, `arrivedFromVector`, `approachLabel`, `arrivedAtRound`, `huntsPlayerIndex`) collapsed into one `scenarioMeta?` substructure. Names shortened where redundant (`fromVector`, `squadName`). Co-required invariants (`squadName` + `fromVector` + `arrivedAtRound`) now structural. Spawn pipeline (2 write sites + `priorVectorsFromSquadrons` reader) and consumers (`App.tsx`, `Squad.tsx`) read from the nested object; `scenarioMeta` is the single discriminator for "scenario-spawned".
- [x] Drop dead `unparsed` SetupOp kind (Phase 10 step 1.5)
- [x] Step F — Split validator into per-concern files (2026-05-11). `src/data/__validate__.ts` (38 lines) now orchestrates per-concern modules under `src/data/validate/`: `maneuvers.ts` (FGA + Anderson tables, AI coverage), `upgrades.ts` (source enum + FGA content shortcodes), `scenarios.ts` (composition, outcomes, vectors, allies), `shortcodes.ts` (helpers), `types.ts` (`ValidationFailure`). Import sites unchanged.

### Phase 11 — Campaign mode (2026-05-06)

End-to-end campaign play: main menu, multi-save campaigns persisted to
localStorage (DB-friendly interface for future Neon swap), deck mechanics
following the `arcLink` / `arcDiscard` / `reshuffle` / `campaignStart` /
`campaignEnd` outcomes encoded on each mission. Free play remains the
default landing.

**Outcome model**
- [x] `OutcomeNext` refined: `mission` → `arcLink` (rename), `arcDiscard` added (arc finale wins now use this).
- [x] All 5 arc-finale rebel-victory outcomes switched from `reshuffle` to `arcDiscard`.
- [x] Validator + UI consumers updated.

**Persistence layer**
- [x] `Campaign` (active save) type with deck/completedArcs/history/points/status/timestamps.
- [x] `CampaignArc` (template, renamed from old `Campaign`).
- [x] `CampaignStore` interface — Promise-based, future-DB-friendly.
- [x] `localStorageCampaignStore` impl with single-blob version-wrapped persistence (`hotac.v1` key).
- [x] `storage.active.ts` single import point — only file that picks the backend.
- [x] `factory.ts` — `newCampaign(opts)`, `applyOutcome(c, missionId, kind, outcome, intros)`, `pickMission`. Pure functions. 13 unit tests covering deck transitions.

**App mode shape**
- [x] `AppMode` discriminated union (`freePlay` / `scenarioOnly` / `campaign`) in `src/state/appMode.ts`.
- [x] `App.tsx` refactored: 4 scattered `useState` calls (activeScenarioId / briefingScenarioId / briefingMode / round) → 1 `mode: AppMode` plus `briefingOverlayOpen` and `freePlayRound`.
- [x] All transition handlers route through `setMode(...)`. Briefing-during-play is a modal overlay, not a phase change.

**UI**
- [x] `MainMenu.tsx` — top-bar dropdown (New / Open / Logout).
- [x] `NewGamePickerModal.tsx` — Campaign / Scenario / Free Play.
- [x] `CampaignSetupModal.tsx` — name + intro toggle + owned-models + less-random + arc selection.
- [x] `OpenCampaignModal.tsx` — saved-campaign browser with delete confirm.
- [x] `DeckPickView.tsx` — between-missions screen, one card per arc head.
- [x] Campaign-info banner in top bar (name, RP, IP, arcs done).

**Wiring**
- [x] `useCampaign(id)` hook — load + functional update + persist in one call.
- [x] `handleEndScenarioResolve` routes through `applyOutcome` for campaign mode; `arcLink`/`replay` stage next briefing, others → deckPick or terminal.
- [x] Resume from `campaignStore.load()` drops to briefing if a mission was in progress, else deckPick.
- [x] `handleStartScenario` and `performRoundAdvance` work in both `scenarioOnly` and `campaign` modes (vary by `mode.kind`).

**Settings cleanup**
- [x] Legacy `CampaignSettings` retired. All settings now live on the `Campaign` record. Free play / scenario-only use `DEFAULT_SPAWN_SETTINGS`.
- [x] `loadSettings` / `saveSettings` / `CampaignSettingsModal` removed.
- [x] `SpawnSettings` type — the subset (ownedModels, lessRandomShips, introducedShipTypes) the spawn pipeline needs. Both `Campaign` and the default fit.

**Tests**
- [x] `tests/storage.test.ts` (8 tests) — round-trip, list ordering, idempotent delete, version wrapper, garbage-handling.
- [x] `tests/campaign.test.ts` (13 tests) — deck mechanics across all OutcomeNext kinds.
- Total: 48/48 passing across 5 files.

**Deferred** (next phases)
- [ ] OAuth + Neon DB backend. The persistence interface is designed for this swap — drop in a `storage.neon.ts`, change one import. User explicitly deferred ("come back to it later").
- [ ] Per-mission upgrade lists for ally ships (Quantum Storm, Damage Control Team, etc.) — still in `specialRules` text.
- [x] Render ally squadrons in the UI (2026-05-11). Allies folded into `Ships` registry (`ai: []`, `upgrades: []`) so squad cards look them up uniformly; `Squadron.shipType` widened implicitly to include ally IDs. `Squadron.energy?: number` + `Ship.hasEnergy?: boolean` track the GR-75 huge-ship energy resource. `AllySetup.startingEnergy?: number` overrides per-mission. New `spawnAlliesFromScenario` in `spawn.ts` spawns one Squadron per `scenario.allies` entry at scenario start (placed alongside Imperial squads, no arrival modal). `ScenarioSpawnMeta.fromVector` now optional — allies have no approach edge. `Squad.tsx` branches presentation on `ship.ai.length === 0`: AI machinery (engine toggle, upgrades) renders empty/inert; new `.squadContainerAlly` CSS gives ally cards a blue accent. `ShipsVariables` renders an Energy +/- row when `squadron.energy !== undefined`. `ShipPickerModal` filters to AI-only ships. Per-mission ally upgrade lists stay in `specialRules` text (briefing modal).

### Phase 12 — Holo mission maps (2026-05-31, in progress)

Replace the ASCII `<pre>{mapDiagram}</pre>` in the briefing modal with stylized
"pseudo-holo vector" SVG maps. Readability in-app outweighs board fidelity; maps
show the static initial setup with tooltips only. **Each mission's map is
hand-authored — layouts are not derived from squad data.**

- [x] `MissionMap` spec on `Scenario.map?` — zones (band/rect/disc/corner/point),
  features (seeded asteroid fields, space stations), tokens (playerStart /
  objective / structure / **ship**), authored `MapVector[]` ring, optional
  setup edge. Types in `src/data/scenarios/types.ts`.
- [x] `src/components/scenarios/missionMapModel.ts` — pure `resolveMissionMap(scenario)`
  → `DrawableMap`. Computes only the swept vector ring (when `'auto'`) and the
  seeded min-distance asteroid placement; everything else is pass-through.
- [x] `src/components/scenarios/MissionMap.tsx` + `MissionMap.css` — holo SVG
  renderer. **Ship tokens reuse the squad-view iconography** (real X-Wing
  silhouette from the vendored `XWingShip` font as SVG `<text>`, keyed by a
  `ShipId → glyph char` map), not abstract glyphs.
- [x] `ScenarioBriefingModal` renders `<MissionMap>` when `scenario.map` is set,
  else falls back to the ASCII `mapDiagram`.
- [x] Asteroid fields support a second obstacle class — red **debris** rocks
  (`MapFeature.debris?`), sampled jointly with the asteroids in one pass so all
  obstacles keep the printed `minDist` spacing. Drawn via the `--accent-danger`
  hue stroke.
- [x] **Player-count-aware rendering.** `resolveMissionMap(scenario, playerCount?)`
  filters tokens carrying a `playerCount` threshold (kept when current count >=
  threshold), and `ScenarioBriefingModal` passes its live player-count toggle
  through. The map renders the *actual* board for the selected count — gated
  shuttles / turbolasers / cargo appear as the table grows. No count badges.
- [x] **Quarter-circle corner setup zones** (`zone.corner`) render as an SVG arc
  wedge, matching the printed quarter-circle deployment areas.
- [x] Authored maps: Local Trouble, Capture the Officer Part I, Capture the
  Officer Part II ("Nobody Home"), Capture the Officer Part III ("Miners
  Strike" — quarter-circle setup zone, landing-pad stations, player-count-gated
  cargo blocks / turbolasers / second shuttle).
- [ ] Author the remaining 13 missions' maps (incremental, one per session).

### Backlog (Needs Planning)
- Backfill `Scenario.behaviorDescriptions` for all 17 missions. Field landed 2026-05-11; schema + render slot are wired (squad card carousel target panel, under the priority list). Each mission needs ~3 entries keyed by `aiTag` value (`Attack`/`Escort`/`Strike`/`Special`/`Flee*`), text copied/condensed from the existing `specialRules` sidebars. Same tag means different things across missions (`Special` = Lambda Shuttle in CapOfficer-1 vs. VT-49 in Minefields-2), so authoring is per-mission. `:icon:` shortcodes supported and validated.
- Encode Gozanti-Class Cruiser as a "huge ship" with its own schema (Bonus Attacks, Docking Clamps, no Select Target step)
- Encode TIE/d Defender Elite as a separate pilot variant (currently treated as base Defender)
- Replace `react-bootstrap` 1.0-beta with shadcn/ui — defer until UI rework is wanted
- Replace mutable `setSquadrons` patterns in `App.js` with `useReducer` + immutable updates
- Convert maneuver-symbol switch in `SquadManeuverGenerator.js` (~80 cases) to a lookup table
- Convert FGA tier ladder in `UpgradesGenerator.js` to a lookup table
- Strip `console.log` calls from production code (~69 in live tree)
- Move JSX out of upgrade descriptions; store as plain text + icon list, render in component
- Delete or address ~29 `// todo` comments in tree
- Add Jest config + first test (the data validator)
- Component tests (Playwright) — defer until a flow is worth protecting

### Deferred / Out of Scope (T0)
- Tailwind / shadcn UI rewrite (significant scope; not earned by current app size)
- TanStack Query / Router (no server, one screen)
- Zustand (current Context approach is sufficient at this scale)
- OMC / Ralph / Ultrapilot (overkill for hobby SPA)
- Backend / serverless functions / `/api` directory (no server logic exists or is planned)
- Multiplayer / saved squads / accounts
- Mobile app

## Architecture Decisions

### Confirmed
- **Frontend stack**: Vite + React 18 + TypeScript (data layer fully typed; UI stays JSX initially, gradual TS adoption acceptable but not required).
- **Package manager**: yarn (per starter prompt).
- **Linter**: modern ESLint flat config, not Airbnb. Adopting `@eslint/js` recommended + `typescript-eslint` strictTypeChecked + react/hooks/jsx-a11y/import + prettier last.
- **Formatter**: Prettier defaults.
- **Deployment**: Vercel (static SPA, no backend, no `/api` directory). GitHub integration, not CLI deploys.
- **Heroku artifacts**: removed — Express shim deleted, `/ping` endpoint deleted, `process.env.PORT` reference deleted.
- **Production branch**: `main` (renamed from `master`).
- **Hinny AI**: removed entirely.
- **Anderson AI**: added; covers 16 ships (Gozanti deferred). Upgrades come from the 2x and 4x alt-pilot card decks.
- **Anderson scaling**: campaign-driven, not player-rank driven. Upgrade unlocks are gated by *imperial pilot initiative*, not party rank.
- **Position model**: Anderson reuses FGA's `Position` enum unchanged — R2 collapses to R1 (closing) / R3 (fleeing) per Anderson rules, no new PSN keys or UI toggle.
- **State management**: keep React Context for cross-component state; replace mutable `setSquadrons` patterns with `useReducer` (deferred to backlog). No Zustand.
- **UI library**: stay on `react-bootstrap` 1.0-beta for now. shadcn/ui migration is deferred — not earned by current scope.
- **Internal docs (`docs/anderson/` PDFs)**: gitignored, kept locally only. Not versioned, not deployed.
- **No design system doc yet**: app has ~5 colors and 1 font; ceremony not earned. Add `docs/DESIGN-SYSTEM.md` if/when UI rework starts.
- **No backend, ever** (in the current vision): if features ever require persistence, revisit at that point.

### Pending
- Whether to rename the GitHub default branch from `master` → `main` (local rename done; remote is a manual GitHub-side action).
- Whether to commit Anderson PDFs via Git LFS instead of gitignoring — current decision is gitignore, revisit if a second contributor joins.
- Whether the existing `react-select` and `react-bootstrap` libs survive the TS migration cleanly — likely yes with `@types/*` packages, but need to verify in Phase 2.

## Known Issues / Tech Debt
Carried over from initial code review (2026-05-02):
- Duplicate subtree `src/components/ai/src/` shipping in bundle (Phase 2 will delete).
- `~69 console.log` in live tree.
- `~29 // todo` comments.
- Mutable state updates in `App.js:34-124` (shallow `[...squadrons]` over nested objects).
- `key={i}` after `i++` in `SquadGenerator.js:12` — list-removal bug latent.
- 80-case switch in `SquadManeuverGenerator.js` — should be a lookup map.
- FGA tier ladder in `UpgradesGenerator.js:41-81` — should mirror its own comment-block table.
- Dead `for` loops in `getFgaUpgrades` (`UpgradesGenerator.js:880,885`).
- `path` package in `dependencies` shadowing Node builtin.
- `src/server/server.js:11` send-file path uses wrong base directory (`build` vs `../../build`); harmless on Heroku but a real bug.
- Upgrade `[2]` slot semantically overloaded across Hinny / Community / FGA tables (cumulative XP vs flat constant vs tier number).
- Upgrade-name typos (`heavyLaserCannor`, `howlRunner` vs `howlrunner`) silently render undefined.
- `hinnyUpgrades.VT49` has two identical sub-arrays — dead variation.
- Hinny only covers 4 ships; missing R4 + stressed positions in maneuver tables.
- JSX inline in upgrade descriptions makes the data un-serializable.

## Questions / Blockers
*(none — autonomous execution can proceed through the phases)*

## Notes
- User has confirmed auto-mode execution is OK; safety net is the no-commit-without-ask rule.
- Anderson PDF is image-only (rasterized to `docs/anderson/pages/p-NN.png` at 150 DPI by `pdftoppm`). 2x and 4x pilot decks rasterized similarly into `pilots_2x/` and `pilots_4x/`.
- All transcription work in Phase 5 is mechanical but voluminous (~16 ships × ~21 positions × 6 cells = ~2000 maneuver entries, plus upgrade trees).
- Heroku is dead — no rollback path through that platform. Vercel deploy is the new target.
