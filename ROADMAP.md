# Project Roadmap

Last updated: 2026-05-02 (Phases 2-4 complete; on `vite-migration` branch, uncommitted)

## Project summary

`hotac-control` is a single-page React app that automates the Imperial AI for **Heroes of the Aturi Cluster**, a fan-made cooperative campaign for FFG's X-Wing Miniatures. This roadmap covers a modernization pass: migrate off the dead Create React App / Heroku stack, replace the abandoned Hinny AI engine with Anderson, and harden the data layer with TypeScript.

## Current Phase: Phase 5b — Anderson data transcription (next)

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
- [x] Decision: Anderson reuses FGA's `Position` enum keys — R2 split is a UI concern, not a new dimension (per DATA-LAYER §4)
- [x] Create `src/data/anderson/`: `Maneuvers.ts` (typed empty table), `AndersonAbilities.ts`, `AndersonPhases.ts`, `Anderson{TargetSelection,ShipActions,Attack}.jsx` (stub renderers with TODO placeholders), `AndersonPositionSelection.jsx` (re-exports FGA grid for now)
- [x] Wire `AI.ANDERSON` into `SquadManeuverGenerator.jsx`, `actionsCarousel/SquadActions.ts`, `SquadAttack.ts`, `SquadTargetSelection.ts`, `maneuvers/TargetPosition.jsx` engine selector
- [x] `SquadManeuverGenerator` guards missing entries with a TODO badge so app doesn't crash
- [x] Validator: add Anderson coverage with phase-aware tolerance (5a OK with empty tables; 5b will tighten)
- [x] Build + test green at `npm run build` and `npm test`

### Active Sprint — Phase 5b (Anderson data transcription)
- [ ] Verify ship stats in `Ships.tsx` against PDFs (TIESK, TIERP, TIEADVV1, TIERBA, TIERBH, TIECP, STARWING, SITH)
- [ ] Transcribe maneuver tables for 16 ships (~1900 cells) from `docs/anderson/pages/p-NN.png` into `src/data/anderson/Maneuvers.ts`
- [ ] Transcribe target priorities → `AndersonTargetSelection.jsx`
- [ ] Transcribe action priorities → `AndersonShipActions.jsx`
- [ ] Transcribe attack priorities → `AndersonAttack.jsx`
- [ ] Transcribe pilot abilities (Sensitive Controls, Strypium Array, Full Throttle, etc.) → `AndersonAbilities.ts`
- [ ] Transcribe System/End Phase descriptions → `AndersonPhases.ts`
- [ ] Decide TIE/d Defender Elite (page 7) modeling — 2nd card per ship, or new variant key (DATA-LAYER §7)
- [ ] Decide TIE/rb Heavy two-page question — duplicate, two pilots, or front/back (DATA-LAYER §16)
- [ ] Add R2-Closing/R2-Fleeing toggle to `AndersonPositionSelection.jsx`
- [ ] Transcribe upgrade tables from pilot card PDFs (2x and 4x decks) → `AndersonUpgrades.ts`
- [ ] Implement the Anderson upgrade unlock rule (initiative-threshold based, no rank scaling)
- [ ] Wire `UPGRADES.ANDERSON` into `UpgradesGenerator.js` (currently falls through to NO_UPGRADE)
- [ ] Tighten validator: hard error on Anderson coverage gaps
- [ ] **Defer Gozanti-Class Cruiser** to a follow-up — separate "huge ship" schema needed

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

### Backlog (Needs Planning)
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
- **Position model**: Anderson introduces `R2_CLOSING` / `R2_FLEEING` distinction (richer than FGA's range-only grid). New PSN keys needed.
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
