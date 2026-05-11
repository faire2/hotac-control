# Agent rules — hotac-control

Single-author hobby SPA. Heroes of the Aturi Cluster Imperial AI helper. React + TypeScript on Vite, deployed as a static SPA on Vercel. No backend.

## Scripts

- `npm run dev` — Vite dev server on `:3000`. Wires the runtime validator as a dev-only side effect.
- `npm run build` — `tsc --noEmit && vite build`. Failure on either step is a blocker.
- `npm run preview` — serves the production build locally for smoke-testing before deploy.
- `npm test` — Vitest. Currently runs the data-layer validator test.
- `npm run lint` / `npm run format` / `npm run typecheck` — ESLint flat config / Prettier / `tsc --noEmit` standalone.

## Workflow

- **Plan before code.** Update `ROADMAP.md` as work progresses; never re-litigate confirmed decisions.
- **Never commit or push** without an explicit in-thread request.
- **Never run destructive operations** (`rm -rf`, `git reset --hard`, `git push --force`, branch deletes) without explicit approval.
- **Never silently expand scope.** A bug fix is a bug fix; refactors get their own task.
- **Distinguish pre-existing failures from newly introduced ones** in any verification report.
- **If full verification was not run, say so explicitly.**
- **Always run `npm run build`** before declaring work complete. Build failure is a blocker.

## TypeScript

- ES modules only.
- Named imports preferred over default imports.
- `async/await` over promise chains.
- Arrow functions for callbacks.
- `any` is forbidden. Use `unknown`, generics, type guards, or precise interfaces.
- Promise handling explicit: `await` handled promises; use `void` only for intentionally detached.
- `consistent-type-imports` enforced.

## ESLint

Flat config built from:
- `@eslint/js` recommended
- `typescript-eslint` `strictTypeChecked` + `stylisticTypeChecked`
- `eslint-plugin-react` flat recommended + jsx-runtime
- `eslint-plugin-react-hooks` recommended
- `eslint-plugin-jsx-a11y` flat recommended
- `eslint-plugin-import` flat recommended + typescript resolver
- `eslint-config-prettier` last

Project rules: `no-explicit-any: error`, `no-floating-promises: ["error", { ignoreVoid: true }]`, `no-misused-promises: error`, `await-thenable: error`, `consistent-type-imports: error`, `ban-ts-comment` requires descriptions.

## Module structure (no barrels)

- **No barrel `index.ts` files.** Each module file has a descriptive name (`registry.ts`, `arcs.ts`, `resolve.ts`, etc.). Importing from a folder path (`from './scenarios'`) is forbidden — always name the file explicitly (`from './scenarios/registry'`). Reason: barrels that mix data and helper re-exports invite ESM circular imports, which manifest as TDZ `ReferenceError` in Vite dev (production-build often masks them). Hit once in 2026-05-11 (`randomShipPool` ↔ scenarios barrel).
- **No top-level reads of registry data.** Inside `src/data/`, never write `const FOO = registryArray.flatMap(...)` at module scope when that registry lives in another file you import. Wrap the derivation in a function so the read is deferred to call time. Same reason as above.

## Data layer (this is the load-bearing rule for this project)

The `src/data/` tree is the source of truth for AI behavior. Specific rules apply:

- **Every maneuver array is exactly length 6** (matches a 1d6 roll). Validator enforces.
- **Every upgrade reference must resolve** to a defined upgrade object. No string keys typo'd as `heavyLaserCannor`.
- **Every ship listed under an `AI.*` enum** must have a corresponding maneuver table for that engine. If `Ships.X.ai` includes `AI.ANDERSON`, `andersonManeuvers[X]` must exist.
- **Position keys (`PSN.*`) used by an engine must be defined** in the position enum.
- The runtime validator (`src/data/__validate__.ts`) throws on import in dev. Build-time check in CI gates deploy.
- **Never store JSX in data files.** Inline icons are written as `:icon-name:` shortcodes (kebab-case keys in `src/data/icons.ts`). The `<Rule>` / `<PriorityList>` components in `src/components/Rule.tsx` parse and render them. The validator hard-errors on unresolved shortcodes.
- **Anderson upgrades are gated by initiative threshold**, not player rank. Anderson does not scale loadouts by `playersRank`.

## React / UI

- App is locked to **React 16.14 + react-bootstrap 1.0.0-beta.16 + bootstrap 4.4.1**. Bumping to React 18 + react-bootstrap 2.x + Bootstrap 5 is a separate, scoped phase (see ROADMAP backlog).
- No Tailwind / shadcn / Zustand / TanStack until a UI rewrite is explicitly scoped.
- The X-Wing iconography font lives at `src/fonts/xwing-miniatures.{css,ttf}` and `xwing-miniatures-ships.ttf` — **vendored locally**, not via the deprecated `xwing-miniatures-font` npm package (which pulls node-sass and breaks on Node ≥ 18). Do not re-add the npm package.
- **Font loading is driven by `@font-face url()` in `src/fonts/xwing-miniatures.css`, NOT by JS-side imports of the .ttf files.** Vite resolves the CSS url() refs natively and emits hashed copies to `dist/assets/`. CRA required separate `import './fonts/foo.ttf'` side-effect imports to copy the binaries; under Vite those imports are rewritten to `?import=` JS-module wrappers that *shadow* the @font-face fetch (the icon font silently falls back to system glyphs and the UI shows Latin letters instead of X-Wing iconography). Do not re-add `import './fonts/*.ttf'` to App.tsx or anywhere else.
- Replace mutable `setSquadrons` patterns with `useReducer` + immutable updates when touching squad state logic. Don't ship new mutable patterns.
- Reuse existing components (`Squad`, `SquadGenerator`, `SquadStats`, `SquadActionsCarousel`, `TargetPosition`, `UpgradesCard`) before creating new ones — see `docs/COMPONENT-CATALOG.md`.
- Do NOT use `useEffect` to derive state. Calculate during render.
- Default `key` to a stable id, never an index. Squad list keyed by index has a known removal bug — fix when next touched.

## Deployment

- **Vercel only.** No Express server, no `/api` directory, no serverless functions until backend logic actually exists.
- `vercel.json` provides the SPA rewrite catch-all. Vite handles the rest natively.
- `docs/anderson/` (PDFs + rasterized pages, ~170 MB) is gitignored AND in `.vercelignore`. Do not commit. Regenerate rasterized pages with `pdftoppm -r 150 -png docs/anderson/AI_All_Empire_SHIPCARDS_ALL.pdf docs/anderson/pages/p`.
- Production branch is `main` (renamed locally from `master`; the GitHub-side default-branch rename and `git push -u origin main` happen at deploy time, not in everyday work).
- Connect the repo to Vercel via the GitHub integration, not the Vercel CLI. Push-to-deploy with preview URLs per branch is the intended workflow.
- **Node version**: `package.json` `engines.node` is `>=20` (yarn-friendly), `.nvmrc` pins `20` (predictable Vercel deploy + `nvm use` locally). Don't tighten `engines.node` to a single version — yarn rejects strict equality and the dev experience suffers.

## Documentation

- `ROADMAP.md` is authoritative for plan and decisions.
- `docs/DOC_CATALOG.md` indexes all docs.
- `docs/DATA-LAYER.md` documents the typed schema and invariants.
- `docs/COMPONENT-CATALOG.md` (added during Phase 2) lists reusable components.
- Skip `docs/DESIGN-SYSTEM.md` until a UI rework is in scope.
- Feature docs collocated with the feature, named explicitly (`FEATURE-NAME.md`, not `README.md`).
- ~200 line target per doc, 500 hard max.

## Verification policy

- Narrow checks (`tsc --noEmit` on a single file, single Vitest test) allowed during implementation.
- Full `npm run lint && npm test && npm run build` cycle only after a phase is complete and the user approves verification.
- `tsc` filtered output (`| head`) is for fast feedback only — never the final word on a build's correctness.

## Reporting

- After each phase: state what was done, what was verified, what remains, what gates the next step. No claims of "complete" without `npm run build` passing.
- Pre-existing failures called out separately from newly introduced ones.
- File references in the form `path/to/file.ts:line` for navigability.
