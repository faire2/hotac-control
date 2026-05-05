# Component catalog

Last updated: 2026-05-05

Reusable UI components in `src/`. Update this file when you add, rename, or materially change a component.

## Inventory

### Top-level

- **`App.tsx`** — root. Owns squadron list state, rank slider, round counter, scenario state (active id, briefing modal mode, scenario-wide AI engine + upgrades source), and ship-selection dropdown. Provides `GlobalSquadsValuesContext` (now also carrying `scenarioAiEngine` / `scenarioUpgradesSource` when a scenario is active) and `ShipHandlingContext` to its subtree. Wires the validator side-effect import (dev only).
- **`main.jsx`** — Vite entrypoint. `ReactDOM.render(<App />, ...)`. Replaces CRA's `index.js`.

### Squadron tree (`src/components/ai/`)

- **`SquadGenerator.jsx`** — maps the squadron list to `Squad` instances. Wraps each in a column.
- **`Squad.tsx`** — single squadron. Owns target-position, local AI-engine, stress-flag state via `TargetPositionContext`. When `GlobalSquadsValuesContext.scenarioAiEngine` is set, the per-squadron AI engine toggle is hidden and the scenario engine is used (`aiEngine = scenarioAiEngine ?? localAiEngine`). Renders `SquadStats` + `ShipsVariables` + `SquadActionsCarousel` (left column) and `TargetPosition` picker (right column), plus `UpgradesCard` below.
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
- **`UpgradesGenerator.js`** — pure logic (not a component; named here because of file location). Picks a variant + filters rows by rank/elite. Engine-aware. The FGA tier ladder branching at lines 41-81 is flagged in ROADMAP backlog for cleanup to a lookup table.

### Scenarios (`src/components/scenarios/`)

See [`SCENARIOS.md`](./SCENARIOS.md) for the full feature description.

- **`LoadScenarioModal.tsx`** — picker (step 1 of the scenario flow). Lists `SCENARIOS`; selecting one stages it for briefing.
- **`ScenarioBriefingModal.tsx`** — briefing + setup (step 2) and view-during-play. Custom blue header (`.scenarioModalHeader`) hosts four toggle groups: rank, number, AI engine, upgrades source. Body renders briefing text, centered ASCII map + notes, objectives. Footer differs per `mode`: `start` shows Back + Start scenario; `view` shows Close. XP rewards use `.badge-xp` (blue).
- **`EndScenarioModal.tsx`** — outcomes recap shown when the End scenario button is clicked. Renders objectives + Rebel/Imperial victory text. Closing clears scenario state.

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
