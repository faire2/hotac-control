# hotac-control

A web app that automates the Imperial AI for **Heroes of the Aturi Cluster** — a fan-made cooperative campaign for Fantasy Flight Games' *X-Wing Miniatures* (1.0 / 2.0). It generates Imperial squadrons, picks the right upgrade tier for the players' rank, randomizes maneuvers, target positions, actions, and attacks, and tracks per-ship hull / shields / XP across an engagement.

## Stack

- **Vite + React 16 + TypeScript** (data layer typed; UI stays JSX, gradual TS adoption)
- **react-bootstrap** 1.0-beta + **bootstrap** 4 (UI library bump deferred to a follow-up phase)
- **Vitest** for tests
- **ESLint** flat config with `typescript-eslint` strict + React + a11y + import + Prettier
- **Vercel** static hosting (no backend)

## Scripts

```
npm install        # one-time
npm run dev        # Vite dev server on :3000 (validator runs in dev)
npm run build      # tsc --noEmit && vite build, output to dist/
npm run preview    # serve the production build locally
npm test           # Vitest — currently runs the data-layer validator
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run format     # Prettier
```

## AI engines

Two engines are supported (with a third in flight):

- **FGA** — full coverage of Imperial ships including TIE Defender, Phantom, Lambda, Decimator. Production-ready.
- **Anderson** — replacing the abandoned Hinny engine. Encoding in progress (Phase 5). 17 cards across 16 ship types, plus separate alt-pilot upgrade decks.
- **Hinny** — being removed (Phase 6). Don't add new code that depends on it.

## Repository map

```
src/
├── App.jsx                    Top-level app: squadron list, rank slider, ship picker
├── main.jsx                   Vite entrypoint
├── components/ai/             UI components (squadron, ship stats, action carousel, etc.)
├── context/Contexts.ts        Typed React contexts
├── data/
│   ├── Ships.tsx              Typed ship metadata
│   ├── Maneuvers.ts           Typed PSN + MVRS enums
│   ├── __validate__.ts        Runtime data validator (5 invariants today; 11 target)
│   ├── fga/                   FGA AI tables (Maneuvers typed; Upgrades pending refactor)
│   └── hinny/                 To be deleted in Phase 6
└── fonts/                     Vendored xwing-miniatures font (CSS + TTF)

docs/
├── ROADMAP.md                 Phase plan + decisions + blockers (authoritative)
├── AGENTS.md                  Working agreements for contributors
├── DOC_CATALOG.md             Index of all docs
├── DATA-LAYER.md              Data layer schema and invariants — read before src/data changes
├── COMPONENT-CATALOG.md       Reusable UI components and reuse rules
└── anderson/                  Internal reference PDFs (gitignored, kept locally only)
```

## Where to read more

- **`ROADMAP.md`** — what's done, what's in flight, what's deferred. Start here.
- **`docs/DATA-LAYER.md`** — the load-bearing reference for everyone who touches `src/data/`.
- **`AGENTS.md`** — TypeScript rules, ESLint setup, deployment constraints.

## Deployment

Vercel via GitHub integration. Push to `main` → production; push to any other branch → preview URL. There is no backend, no `/api` directory, no serverless functions — just static SPA assets behind a catch-all rewrite (`vercel.json`).

The Heroku deploy is dead. Do not look for a `Procfile`, an Express server, or a `/ping` endpoint — they were removed in the Vite migration.

## License & attribution

This is a personal hobby project. *X-Wing Miniatures*, *Heroes of the Aturi Cluster*, ship names, and game iconography belong to their respective rights holders (FFG / AMG / Disney). The Anderson and FGA AI tables originate from the HotAC community; see provenance in `docs/DATA-LAYER.md` §15.
