# Project Roadmap

Last updated: 2026-05-02

## Project summary

`hotac-control` is a single-page React app that automates the Imperial AI for **Heroes of the Aturi Cluster**, a fan-made cooperative campaign for FFG's X-Wing Miniatures. This roadmap covers a modernization pass: migrate off the dead Create React App / Heroku stack, replace the abandoned Hinny AI engine with Anderson, and harden the data layer with TypeScript.

## Current Phase: Phase 1 — Planning & Documentation

### Active Sprint
- [x] Decide deployment target → Vercel (no backend, static SPA) (completed 2026-05-02)
- [x] Decide AI engine replacement → drop Hinny, add Anderson (completed 2026-05-02)
- [x] Survey Anderson PDFs (`AI_All_Empire_SHIPCARDS_ALL.pdf`, `AI_Alternative_Empire_PILOTCARDS_2x.pdf`, `AI_Alternative_Empire_PILOTCARDS_4x.pdf`) (completed 2026-05-02)
- [x] Rename local branch `master` → `main` (completed 2026-05-02)
- [x] Update `.gitignore` to exclude PDFs, rasterized pages, `dist/`, `.vercel/` (completed 2026-05-02)
- [ ] Write `AGENTS.md` and `CLAUDE.md`
- [ ] Write `docs/DOC_CATALOG.md`
- [ ] Write `docs/DATA-LAYER.md` with the Anderson + FGA typed schema and invariants
- [ ] Approve roadmap (user gate before Phase 2)

### Up Next (Approved)

**Phase 2 — Vite + TS scaffolding**
- [ ] Delete duplicate subtree `src/components/ai/src/` (destructive — gated on user "go")
- [ ] Initialize Vite + React + TypeScript project structure (config files only — `vite.config.ts`, `tsconfig.json`, `index.html` at root, `eslint.config.mjs`, `prettier.config.mjs`)
- [ ] Migrate dependencies: drop `react-scripts`, `express`, `path`, add Vite + TS toolchain
- [ ] Move font / CSS imports to Vite-compatible paths
- [ ] Update `index.html` for Vite entrypoint
- [ ] Verify `npm run dev` renders the existing app with current FGA path working identically
- [ ] Verify `npm run build` produces `dist/` with no behavior change
- [ ] Write `docs/COMPONENT-CATALOG.md` while touching every component during the migration

**Phase 3 — Strip dead deployment / engine code**
- [ ] Delete `src/server/server.js` (Express shim no longer needed)
- [ ] Delete `/ping` references (the endpoint goes away with the server)
- [ ] Remove `express` and `path` from `package.json` dependencies
- [ ] Add `vercel.json` with SPA rewrite
- [ ] Add `.vercelignore` excluding `docs/`, `*.pdf`
- [ ] Pin Node version in `package.json` (`"engines": { "node": "20.x" }`)

**Phase 4 — Type the data-layer beachhead**
- [ ] Convert `src/data/Ships.js` → `Ships.ts` (typed `Ship`, `ShipId`, `AiEngine`, `UpgradeSource`, `Stats`)
- [ ] Convert `src/data/Maneuvers.js` → `Maneuvers.ts` (typed `Position`, `Maneuver`)
- [ ] Convert `src/context/Contexts.js` → `Contexts.ts` with proper context value types
- [ ] Add a runtime validator (`src/data/__validate__.ts`) that throws on import in dev — checks: every maneuver array length === 6, every upgrade key resolves, every `ai`-listed engine has a matching maneuver table for that ship, every PSN used by FGA tables is defined in PSN enum
- [ ] Surface validator failures as a build-time check so they block deploy

**Phase 5 — Encode Anderson**
- [ ] Define Anderson position keys (R12_CLOSING_*, R32_FLEEING_*, R4_*) — richer model than FGA's range-only grid
- [ ] Transcribe maneuver tables from `docs/anderson/pages/p-01.png` ... `p-19.png` into `src/data/anderson/Maneuvers.ts`
- [ ] Transcribe target priorities → `src/data/anderson/AndersonTargetSelection.ts`
- [ ] Transcribe action priorities → `src/data/anderson/AndersonShipActions.ts`
- [ ] Transcribe attack priorities → `src/data/anderson/AndersonAttack.ts`
- [ ] Transcribe pilot abilities (Sensitive Controls, Strypium Array, Full Throttle, etc.) — display-only, no behavior
- [ ] Transcribe upgrade tables from pilot card PDFs (2x and 4x decks) → `src/data/anderson/AndersonUpgrades.ts`
- [ ] Implement the Anderson upgrade unlock rule (initiative-threshold based, no rank scaling)
- [ ] Wire `AI.ANDERSON` into `SquadManeuverGenerator`, `UpgradesGenerator`, position selection UI
- [ ] **Defer Gozanti-Class Cruiser** to a follow-up — separate "huge ship" schema needed

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
