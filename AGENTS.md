# Agent rules — hotac-control

Single-author hobby SPA. Heroes of the Aturi Cluster Imperial AI helper. React + TypeScript on Vite, deployed as a static SPA on Vercel. No backend.

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

## Data layer (this is the load-bearing rule for this project)

The `src/data/` tree is the source of truth for AI behavior. Specific rules apply:

- **Every maneuver array is exactly length 6** (matches a 1d6 roll). Validator enforces.
- **Every upgrade reference must resolve** to a defined upgrade object. No string keys typo'd as `heavyLaserCannor`.
- **Every ship listed under an `AI.*` enum** must have a corresponding maneuver table for that engine. If `Ships.X.ai` includes `AI.ANDERSON`, `andersonManeuvers[X]` must exist.
- **Position keys (`PSN.*`) used by an engine must be defined** in the position enum.
- The runtime validator (`src/data/__validate__.ts`) throws on import in dev. Build-time check in CI gates deploy.
- **Never store JSX in data files** going forward. Existing JSX-in-upgrades is technical debt to be paid down. New upgrades carry plain text + an icon list, rendered by a component.
- **Anderson upgrades are gated by initiative threshold**, not player rank. Anderson does not scale loadouts by `playersRank`.

## React / UI

- Existing app uses `react-bootstrap` 1.0-beta and a custom `xwing-miniatures-font`. No Tailwind / shadcn until a UI rewrite is explicitly scoped.
- Replace mutable `setSquadrons` patterns with `useReducer` + immutable updates when touching squad state logic. Don't ship new mutable patterns.
- Reuse existing components (`Squad`, `SquadGenerator`, `SquadStats`, `SquadActionsCarousel`, `TargetPosition`, `UpgradesCard`, `Arrow`) before creating new ones.
- Do NOT use `useEffect` to derive state. Calculate during render.
- Default `key` to a stable id, never an index. Squad list keyed by index has known removal bug — fix when next touched.

## Deployment

- **Vercel only.** No Express server, no `/api` directory, no serverless functions until backend logic actually exists.
- `vercel.json` provides the SPA rewrite catch-all. Vite handles the rest natively.
- `docs/anderson/*.pdf` and rasterized page directories are gitignored and `.vercelignore`'d. Do not commit them.
- Production branch is `main`.

## Documentation

- `ROADMAP.md` is authoritative for plan and decisions.
- `docs/DOC_CATALOG.md` indexes all docs.
- `docs/DATA-LAYER.md` documents the typed schema and invariants.
- `docs/COMPONENT-CATALOG.md` (added during Phase 2) lists reusable components.
- Skip `docs/DESIGN-SYSTEM.md` until a UI rework is in scope.
- Feature docs collocated with the feature, named explicitly (`FEATURE-NAME.md`, not `README.md`).
- ~200 line target per doc, 500 hard max.

## Verification policy

- Narrow checks (`tsc --noEmit` on a single file, single Jest test) allowed during implementation.
- Full lint + test + build cycle only after a phase is complete and the user approves verification.
- `tsc` filtered output (`| head`) is for fast feedback only — never the final word on a build's correctness.

## Reporting

- After each phase: state what was done, what was verified, what remains, what gates the next step. No claims of "complete" without `npm run build` passing.
- Pre-existing failures called out separately from newly introduced ones.
- File references in the form `path/to/file.ts:line` for navigability.
