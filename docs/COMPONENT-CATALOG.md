# Component catalog

Last updated: 2026-05-06

Reusable UI components in `src/`. Update this file when you add, rename, or materially change a component.

## Inventory

### Top-level

- **`App.tsx`** — root. Owns squadron list state, rank slider, round counter, scenario state (active id, briefing modal mode, scenario-wide AI engine + upgrades source), campaign settings (loaded from localStorage), pending arrivals, pending dynamic-spawn handlers, and the resolved-dynamic-squads set. Orchestrates round advance via `performRoundAdvance` — composes a `SpawnContext` and delegates to `spawnFromScenarioSquad` from `src/data/scenarios/spawn.ts` (the pure-function pipeline). Provides `GlobalSquadsValuesContext` and `ShipHandlingContext` to its subtree. Wires the validator side-effect import (dev only).
- **`main.jsx`** — Vite entrypoint. `ReactDOM.render(<App />, ...)`. Replaces CRA's `index.js`.

### Squadron tree (`src/components/ai/`)

- **`SquadGenerator.jsx`** — maps the squadron list to `Squad` instances. Wraps each in a column.
- **`Squad.tsx`** — single squadron. Owns target-position, local AI-engine, stress-flag state via `TargetPositionContext`. When `GlobalSquadsValuesContext.scenarioAiEngine` is set, the per-squadron AI engine toggle is hidden and the scenario engine is used (`aiEngine = scenarioAiEngine ?? localAiEngine`). When the squadron has `scenarioSquadName` (was scenario-spawned), the editable squad-name dropdown is replaced with a read-only label including any Elite badge, and a `.scenarioSquadMeta` line displays "Approach: X · Arrived: turn N · Hunts: player N" when those fields are set. Renders `SquadStats` + `ShipsVariables` + `SquadActionsCarousel` (left column) and `TargetPosition` picker (right column), plus `UpgradesCard` below.
- **`SquadStats.tsx`** — display-only ship stats card (init / attack / agility / XP). Uses CSS subgrid (`.squadStats` is a 5-column grid; rows use `display: grid; grid-template-columns: subgrid`) so values line up under their headers regardless of the optional AI-toggle column width.

### Variables (`src/components/ai/variables/`)

- **`ShipsVariables.jsx`** — per-physical-ship hull/shield/token controls. Iterates the squad's `ships` array.
- **`Variables.jsx`** — the increment/decrement triple (hull, shield, token) for a single ship.

### Action carousel (`src/components/ai/actionsCarousel/`)

- **`SquadActionsCarousel.jsx`** — three-step swipeable carousel (Target → Action → Attack). Owns `currentSlideIndex` state and renders left/right `Arrow` controls.
- **`SquadTargetSelection.jsx`** — priority list for target selection. Reads from `data/fga/FgaTargetSelection` or `data/hinny/HinnyTargetSelection` based on `aiEngine` prop.
- **`SquadActions.jsx`** — priority list for action selection. Engine-keyed similarly.
- **`SquadAttack.jsx`** — priority list for attack target. Engine-keyed similarly.

### Maneuvers (`src/components/ai/maneuvers/`)

- **`TargetPosition.jsx`** — AI engine selector (FGA / Hinny toggle), stress checkbox (FGA only), `TargetPositionDiagram` polar grid, and `SquadManeuverGenerator` output. Reads from `TargetPositionContext`.
- **`TargetPositionDiagram.jsx`** — SVG polar grid. Renders `FgaPositionSelection` or `FgaStressedPositionSelection` based on context. (Hinny renders a different reduced grid.)
- **`SquadManeuverGenerator.jsx`** — looks up the maneuver for the current `(shipType, position, randNum)` and emits the dial JSX. Contains the 80-case `MVRS` switch — flagged in ROADMAP backlog for replacement with a lookup table.

### Upgrades (`src/components/ai/upgrades/`)

- **`UpgradesCard.tsx`** — renders the elite upgrade list for a squadron, with a column-2 layout. Reads upgrades from the squadron's `upgrades` array. Hides the per-squadron source toggle (Community / FGA / Anderson) when `GlobalSquadsValuesContext.scenarioUpgradesSource` is set — scenario play drives the source from the briefing modal header.

The pure-logic `getUpgrades(shipType, playersRank, source, isElite)` picker — engine-aware, walks the FGA / Community / Anderson trees and filters by rank — now lives at `src/data/upgrades/getUpgrades.ts` (relocated from this directory in 2026-05-06's refactor; only data-layer dependencies, doesn't belong in the components tree). Imported by `Squad`, `UpgradesCard`, `App.tsx`, and the spawn pipeline.

### Scenarios (`src/components/scenarios/`)

See [`SCENARIOS.md`](./SCENARIOS.md) for the full feature description.

- **`LoadScenarioModal.tsx`** — picker (step 1 of the scenario flow). Lists `SCENARIOS`. Disables scenarios whose `requiredModels` aren't all in the active settings' `ownedModels` (campaign mode reads from the campaign record, free-play uses `DEFAULT_SPAWN_SETTINGS`). Greyed entries use `btn-outline-secondary`.
- **`ScenarioBriefingModal.tsx`** — briefing + setup (step 2) and view-during-play. Custom blue header (`.scenarioModalHeader`) hosts four toggle groups: rank, number, AI engine, upgrades source. Body renders briefing text, centered ASCII map + notes, objectives. Footer differs per `mode`: `start` shows Back + Start scenario; `view` shows Close. XP rewards use `.badge-xp` (blue).
- **`EndScenarioModal.tsx`** — outcome picker shown when End scenario is clicked. Renders objectives + both Outcome panels (Rebel and Imperial), each with its `text`, the `Outcome.next` description, VP badges, and a resolve button. Picking one calls `onResolve(kind)`; the App applies points + ship-introduction unlocks and routes via `Outcome.next` (next mission staged in `ScenarioBriefingModal`, replay, reshuffle, etc.). Cancel returns to free play.
- **`menu/MainMenu.tsx`** — top-bar dropdown: New / Open / Logout. Wired in `App.tsx`'s top bar and visible in every mode.
- **`menu/NewGamePickerModal.tsx`** — three-option picker (Campaign / Scenario / Free Play) shown after Menu → New.
- **`menu/CampaignSetupModal.tsx`** — name + intro toggle + owned-models checklist + less-random toggle + arc selection (auto-disables arcs whose required models aren't owned). On Save, creates a `Campaign` via `newCampaign(opts)`, persists via `campaignStore.save`, and reports the new id back.
- **`menu/OpenCampaignModal.tsx`** — saved-campaign browser. Lists summaries from `campaignStore.list()` sorted by recency. Resume routes to deck-pick (or saved current-mission briefing); Delete shows a confirm.
- **`menu/DeckPickView.tsx`** — between-missions screen for active campaigns. One card per arc head currently in the deck. Picking transitions mode to `briefing` and sets `currentMissionId` on the campaign.
- **`ArrivalNotificationModal.tsx`** — listing of new spawns shown after Start Scenario or Next Round when any scenario-squad ships arrived. Each row reads "N× Ship Name labelled as Squad approaching from Vector — hunts player N" with an Elite badge where applicable.
- **`DynamicSpawnPromptModal.tsx`** — generic per-handler prompt renderer. Shown before round advance when the active scenario has any unresolved dynamic-spawn handlers. Renders one section per pending handler with its typed prompts (confirm checkbox or count input). Submit invokes each handler's `decide(input)` and feeds outcomes back to `App.performRoundAdvance`.

## Rules for using or extending these components

- **Reuse before rewriting.** All squadron-related UI lives in `src/components/ai/`. Don't introduce a parallel hierarchy.
- **Stay on `react-bootstrap` 1.0-beta + `bootstrap` 4.4.1** until a UI rework is explicitly scoped. Don't add `shadcn/ui` ad-hoc.
- **Don't import data files directly into UI** other than via the typed barrels (`src/data/Ships.tsx`, `src/data/Maneuvers.ts`). The engine-specific data files (`src/data/fga/*`, `src/data/anderson/*` once added) are imported only by `UpgradesGenerator`, `SquadActions`, `SquadAttack`, `SquadTargetSelection`, `SquadManeuverGenerator`, and the polar-grid pickers.
- **Stable keys.** `SquadGenerator.jsx:12` currently uses `key={i}` after `i++`. Known list-removal bug. Fix when next touched (replace with a per-squad uuid).
- **No `useEffect` to derive state.** Calculate during render. Squadron-derived values are computed in the parent's render path, not effects.
- **Mutable state pattern (`App.jsx` setSquadrons)** is technical debt. When materially touching squadron state logic, replace with `useReducer` per ROADMAP backlog. Don't ship new mutable patterns.

## Components NOT in this catalog (intentionally)

- The `Arrow` component inside `SquadActionsCarousel.jsx` — internal, single-use, not reusable.
- Anything under `src/data/` — those are data tables, not components, even when they return JSX.
- Anything under `src/data/fga/FgaPositionSelection.jsx` and similar — these are *partials* of the polar grid that only `TargetPositionDiagram` consumes; if you need a different grid, add a new partial there rather than a new top-level component.

## Future additions (Phase 5 — Anderson)

The Anderson engine introduces:

- **`src/data/anderson/AndersonPositionSelection.jsx`** — polar grid with the R2-Closing/R2-Fleeing direction toggle.
- **`src/components/ai/AndersonSystemPhase.jsx`** (probable) — display-only renderer for ships with a System or End Phase.
- **`src/components/ai/AndersonPilotAbility.jsx`** (probable) — display-only renderer for the per-card pilot ability box.

Update this catalog when those land.
