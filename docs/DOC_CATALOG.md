# Documentation catalog

Last updated: 2026-05-06

Central index of all project documentation. Update this file whenever you add, rename, or materially change a doc.

## Project-level

| Doc | Purpose |
|---|---|
| [`/ROADMAP.md`](../ROADMAP.md) | Phase plan, active sprint, architecture decisions, blockers. Authoritative for what's being worked on and why. |
| [`/AGENTS.md`](../AGENTS.md) | Working agreements for AI agents and humans contributing to this repo: workflow rules, TS rules, ESLint preset, data-layer invariants, deployment constraints, verification policy. |
| [`/CLAUDE.md`](../CLAUDE.md) | Pointer to `AGENTS.md`. |

## Architecture & data

| Doc | Purpose |
|---|---|
| [`DATA-LAYER.md`](./DATA-LAYER.md) | Typed schema for ships, maneuvers, positions, upgrades, AI engines. Invariants enforced by the runtime validator. The load-bearing doc for this app — read before touching anything in `src/data/`. |
| [`COMPONENT-CATALOG.md`](./COMPONENT-CATALOG.md) | Reusable UI components, file paths, props, when to use them. |

## Features

| Doc | Purpose |
|---|---|
| [`SCENARIOS.md`](./SCENARIOS.md) | Scenario loader: data shape, resolution rules, free-play vs scenario-play UI regimes, validator coverage, authoring guide. |

## Internal reference (not deployed, not versioned)

The `docs/anderson/` directory holds the source PDFs for Anderson's AI cards (`AI_All_Empire_SHIPCARDS_ALL.pdf`, `AI_Alternative_Empire_PILOTCARDS_2x.pdf`, `AI_Alternative_Empire_PILOTCARDS_4x.pdf`) and rasterized page renders (`pages/`, `pilots_2x/`, `pilots_4x/` produced by `pdftoppm -r 150 -png`). These are gitignored and excluded from Vercel deploys via `.vercelignore`. They exist locally only, as transcription source material.

If you need to regenerate the rasterized pages:

```
pdftoppm -r 150 -png docs/anderson/AI_All_Empire_SHIPCARDS_ALL.pdf docs/anderson/pages/p
```

## Out of scope (not yet earned)

- `DESIGN-SYSTEM.md` — defer until a UI rework is in scope. Current app has ~5 colors and one font; design-system ceremony isn't earned.
- `API.md`, `DEPLOYMENT.md` runbooks — no backend; deployment is push-to-Vercel and that's documented in ROADMAP.md.
- Feature-level `FEATURE-NAME.md` docs — add when a feature has enough surface to warrant one. Currently every feature is small enough to live in code + comments.
