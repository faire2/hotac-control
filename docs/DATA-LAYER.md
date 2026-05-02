# Data layer

Last updated: 2026-05-02

The `src/data/` tree encodes the Imperial AI behavior tables for HotAC. It is the **load-bearing layer of this app** — the UI is mostly a thin presenter over these tables. Every bug the project has shipped historically has been a data-layer bug: typo'd upgrade keys, missing maneuver tables, off-by-one in upgrade tier ladders, or one engine quietly diverging from another. Read this whole document before touching anything in `src/data/`.

---

## 1. Glossary

HotAC vocabulary used without explanation in code and tables:

- **Initiative (init):** pilot skill / ordering. Higher moves second, shoots first. Range 1–7.
- **XP:** experience points; FGA's tier ladder is XP-driven. **Anderson does NOT use XP.**
- **Player rank:** campaign-level abstraction (1–7) scaling FGA difficulty. **Anderson does NOT use this.**
- **Threat level (TL):** FGA's name for player rank applied to a squad. See `UpgradesGenerator.js:561-569` comment block.
- **Bullseye / Range R1–R4+:** standard X-Wing distance bands; bullseye is a narrow front cone.
- **R2-Closing / R2-Fleeing:** Anderson splits R2 by target direction of travel. Closing → toward you; Fleeing → away. New to this codebase.
- **Stressed (STRS):** token state with limited maneuvers. Each AI card has a "When Stressed" alternate side.
- **Basic / Elite (Anderson):** 1 Basic (always equipped) + up to 5 Elite (initiative-gated) per variant.
- **Tier (FGA):** XP tier 1/2/3 gating which rows return.
- **Variant:** one row of the upgrade tree; engine picks one per squad.
- **System Phase / End Phase:** optional pre-/post-steps on some Anderson cards (Decloak, Adaptive Ailerons, etc.). Display-only; player executes manually.

---

## 2. Top-level shape

```
src/data/
├── Ships.ts                          # ship metadata (stats, attacks, available engines, available upgrade sources)
├── Maneuvers.ts                      # PSN (position) and MVRS (maneuver) enums + maneuver presentation map
├── icons.ts                          # IconKey enum + className map (xwing-miniatures-font)
├── __validate__.ts                   # runtime validator — throws on import in dev, gated in CI
├── shared/
│   └── coreUpgrades.ts               # canonical Hull Upgrade / Shield Upgrade (single source of truth)
├── fga/
│   ├── Maneuvers.ts
│   ├── FgaTargetSelection.ts
│   ├── FgaShipActions.ts
│   ├── FgaAttack.ts
│   ├── FgaPositionSelection.tsx      # UI helper, renders polar grid for FGA's range-only model
│   ├── FgaUpgrades.ts
│   └── CommunityUpgrades.ts
└── anderson/
    ├── Maneuvers.ts
    ├── AndersonTargetSelection.ts
    ├── AndersonShipActions.ts
    ├── AndersonAttack.ts
    ├── AndersonPositionSelection.tsx # UI helper, renders polar grid + R2-direction toggle
    ├── AndersonUpgrades.ts           # variant tree from pilots_2x + pilots_4x decks
    ├── AndersonAbilities.ts          # pilot ability descriptions (display-only)
    └── AndersonPhases.ts             # System/End phase descriptions (display-only)
```

Removed in Phase 6: `src/data/hinny/` and the `Hinny*` exports.

---

## 3. Core types

```ts
// Identity
type ShipId =
  | 'TIELN' | 'TIEIN' | 'TIESA' | 'TIEADVX' | 'TIEDEF' | 'TIEPH' | 'LAMBDA' | 'VT49'
  | 'TIESK' | 'TIERP' | 'TIEADVV1' | 'TIERBA' | 'TIERBH' | 'TIECP' | 'STARWING' | 'SITH';
  // Gozanti deferred — needs a separate huge-ship schema, see ROADMAP.md backlog

type AiEngine = 'FGA' | 'ANDERSON';

type UpgradeSource = 'FGA' | 'COMMUNITY' | 'ANDERSON';

// Attack profile — a ship can have more than one (e.g. Lambda has front + rear arcs)
type ArcKind = 'frontArc' | 'rearArc' | 'turret' | 'doubleturret';
interface AttackProfile {
  arc: ArcKind;
  damage: number;
}

// Ship metadata
interface Ship {
  id: ShipId;
  name: string;                          // display name e.g. "TIE/in Interceptor"
  initiative: number;                    // base init; pilot cards may override
  shields: number;
  hull: number;
  attack: readonly AttackProfile[];
  agility: number;
  ai: readonly AiEngine[];               // which engines have a card for this ship
  upgrades: readonly UpgradeSource[];    // which upgrade sources cover this ship
  fleeThreshold: number;                 // damage taken at which the ship flees; default 0 = first damage
}
```

**Why `fleeThreshold` is on `Ship`, not on the engine card:** the existing data hardcodes "Flee Threshold: 0 Health" on every Anderson card except Lambda Shuttle (5). This is a per-ship-type property, not an engine-specific one. If a future engine disagrees, we hoist this into the engine card and back-fill defaults.

---

## 4. Position model

The position grid is what the player tells the AI ("where is your target relative to you?"). It's polar: range × sector. The two engines have different grids.

### FGA — range-only

Five sectors at three ranges, plus a stressed alternative:

```ts
type FgaPosition =
  | 'R4_BULL' | 'R4_FRONT' | 'R4_FRONTSIDE' | 'R4_REARSIDE' | 'R4_REAR'
  | 'R3_BULL' | 'R3_FRONT' | 'R3_FRONTSIDE' | 'R3_REARSIDE' | 'R3_REAR'
  | 'R1_BULL' | 'R1_FRONT' | 'R1_FRONTSIDE' | 'R1_REARSIDE' | 'R1_REAR'
  | 'STRS_BULL' | 'STRS_FRONT' | 'STRS_FRONTSIDE' | 'STRS_REARSIDE' | 'STRS_REAR';
```

20 keys total. Stressed keys are reached only when the AI ship is stressed; the UI swaps in the `STRS_*` set when `stressed === true`.

Note: FGA's grid uses "R1/R2" for the close band and "R3/R2" for the mid band — i.e. R2 falls into R1 or R3 depending on context. The legend is on every FGA card. Internally we still use `R1_*` / `R3_*` keys to match the published tables.

### Anderson — range × direction

Anderson splits range 2 by *direction of target travel*. The card legend reads:

```
R4+               (yellow/green outer band)
R3 / R2-Fleeing   (orange middle band)
R1 / R2-Closing   (red inner band)
```

So the keys are the same shape but the *binding* of R2 changes. We can keep the FGA-style key set and let the UI decide which key to use:

- If target is at range 1 → `R1_*`
- If target is at range 2 and *closing* → `R1_*` (Anderson treats R2-Closing as if it were R1)
- If target is at range 2 and *fleeing* → `R3_*` (Anderson treats R2-Fleeing as if it were R3)
- If target is at range 3 → `R3_*`
- If target is at range 4+ → `R4_*`

This means Anderson's data tables can use the **same `Position` enum** as FGA. The difference is purely in the UI: Anderson's position selector shows an extra "is target closing or fleeing" toggle when the player picks range 2; FGA's selector ignores direction.

This is the simplest representation that doesn't add a third dimension to the lookup table. Confirm during Phase 5 transcription that no Anderson card breaks this binding.

### Stressed states for Anderson

Anderson's "When Stressed" panel covers all positions on a single right-hand card. Encoded as `STRS_*` keys, just like FGA.

---

## 5. Maneuver vocabulary

Maneuvers are dial outcomes — what the AI ship does after position lookup. Each is `(speed, kind, color)`:

```ts
type ManeuverKind =
  | 'STRAIGHT' | 'BANK' | 'BANK_OPP' | 'TURN' | 'TURN_OPP'
  | 'KOIOGRAN'                       // K-turn (180°)
  | 'SEGNOR' | 'SEGNOR_OPP'          // S-loop
  | 'TALLON' | 'TALLON_OPP'          // T-roll
  | 'STATIONARY'
  | 'REVERSE_STRAIGHT' | 'REVERSE_BANK';

type ManeuverColor = 'blue' | 'white' | 'red';
type ManeuverCode = `${string}`;     // e.g. 'STRAIGHT_2_BLUE', 'KOIOGRAN_4_RED'
```

Data tables use the string codes (compact, readable). The renderer becomes a single lookup:

```ts
const MANEUVER_PRESENTATION: Record<ManeuverCode, { speed: number; iconClass: string }> = {
  STRAIGHT_2_BLUE: { speed: 2, iconClass: 'xwmb x-straight' },
  // ...
};
```

This replaces the 80-case switch in `SquadManeuverGenerator.js` and removes silent fall-through on typo'd codes.

---

## 6. Upgrades

The legacy `[upgrade, initiative, xp]` triple overloads slot `[2]` (cumulative XP in Hinny, flat constant in Community, tier 1/2/3 in FGA). Replace with a discriminated record where meaning is explicit:

```ts
interface Upgrade {
  skillName: string;
  description: string;                      // plain text only — no JSX
  icons?: readonly IconKey[];               // rendered by an icon component
  charge?: number;                          // upgrade-token economy
  recharge?: number;
}

type UpgradeRow =
  | { source: 'FGA';      upgrade: Upgrade; initiative: number; tier: 1 | 2 | 3 }
  | { source: 'COMMUNITY';upgrade: Upgrade; initiative: number; xpCost: number }
  | { source: 'ANDERSON'; upgrade: Upgrade; initiative: number };  // initiative IS the threshold
```

The discriminated union pins meaning per engine. Old code that reads `row[2]` for "XP" becomes a type error; you have to narrow on `source` first.

### FGA / Community upgrade trees

```ts
type ShipUpgradeTree = readonly UpgradeRow[][];     // outer: variants; inner: rows in each variant
type FgaUpgradesByShip = Record<ShipId, ShipUpgradeTree>;
```

Each variant has 1–9 rows. `getFgaUpgrades(tier, rows)` filters to `rows.filter(r => r.source === 'FGA' && r.tier <= tier)`.

### Anderson upgrade trees

Anderson's pilot card decks have a fixed shape — 1 Basic + 5 Elite per variant — that we can pin in the type system:

```ts
interface AndersonVariant {
  basic: UpgradeRow & { source: 'ANDERSON' };
  elite: readonly [
    UpgradeRow & { source: 'ANDERSON' },  // typically initiative 4
    UpgradeRow & { source: 'ANDERSON' },  // typically initiative 4
    UpgradeRow & { source: 'ANDERSON' },  // typically initiative 5
    UpgradeRow & { source: 'ANDERSON' },  // typically initiative 6
    UpgradeRow & { source: 'ANDERSON' },  // typically initiative 6
  ];
}

type AndersonUpgradesByShip = Record<ShipId, readonly AndersonVariant[]>;
```

The fixed-length tuple on `elite` enforces "exactly 5" at compile time. Adding or removing a slot becomes a type error, not a silent runtime difference.

`getAndersonUpgrades(variant, imperialInitiative)` returns the basic plus all elite rows where `initiative <= imperialInitiative`. **No `playersRank` consulted.**

### Canonical Hull / Shield Upgrades

Today, `App.js:177-181` checks both `HinnyUpgrades.hullUpgrade` and `CommunityUpgrades.hullUpgrade` as separate references. After migration, both point to a single canonical `coreUpgrades.HULL_UPGRADE` object so identity comparison works regardless of source:

```ts
// shared/coreUpgrades.ts
export const HULL_UPGRADE: Upgrade = { skillName: 'Hull Upgrade', description: 'Increases your hull by 1.' };
export const SHIELD_UPGRADE: Upgrade = { skillName: 'Shield Upgrade', description: 'Increases your shields by 1.' };
```

`countExtraHullAndShield` then becomes:

```ts
function getHullShieldBonus(rows: readonly UpgradeRow[]): { hull: number; shields: number } {
  let hull = 0, shields = 0;
  for (const row of rows) {
    if (row.upgrade === HULL_UPGRADE)   hull   += 1;
    if (row.upgrade === SHIELD_UPGRADE) shields += 1;
  }
  return { hull, shields };
}
```

Identity comparison is safe because `Object.freeze` prevents mutation and the canonical objects are imported, not duplicated.

---

## 7. Engine cards (the AI behavior, separate from upgrades)

Each engine has, for each ship, a "card" that bundles the priority lists and the maneuver table. FGA and Anderson share the shape:

```ts
interface AiCard {
  shipId: ShipId;
  pilotName: string;                            // e.g. "Academy Pilot", "Inquisitor"
  pilotInitiative: number;                      // overrides Ships[id].initiative
  selectTarget: readonly Priority[];            // ordered list of selection rules
  selectAction: readonly Priority[];
  attack: readonly Priority[];
  maneuvers: ManeuverTable;                     // Position → 6-tuple of Maneuver codes
  stressedManeuvers?: Partial<ManeuverTable>;   // overrides the STRS_* keys; falls through to maneuvers if absent
  systemPhase?: PhaseDescription;               // Anderson optional; e.g. "Roll to Decloak"
  endPhase?: PhaseDescription;                  // Anderson optional; e.g. "Spend 1 Evade to gain Cloak"
  pilotAbility?: PilotAbility;                  // Anderson optional; display-only
}

interface Priority {
  rank: number;                                 // 1, 2, 3, ...
  rule: string;                                 // human-readable: "Nearest Enemy in front arc"
  conditions?: readonly string[];               // extra parenthetical conditions, e.g. "if not in Target's arc"
  notes?: string;                               // legend pointers e.g. "only if Target has not yet moved"
}

interface PhaseDescription {
  name: string;
  steps: readonly string[];
}

interface PilotAbility {
  name: string;
  description: string;
}

type ManeuverTable = Record<FgaPosition, readonly [
  ManeuverCode, ManeuverCode, ManeuverCode, ManeuverCode, ManeuverCode, ManeuverCode
]>;

type EngineCardSet = Record<ShipId, AiCard>;
```

The 6-tuple on `ManeuverTable` is the load-bearing length-6 invariant from the validator, lifted into the type system.

### TIE/d Defender Elite (the variant problem)

Anderson page 7 gives the Defender a separate "Elite" pilot card with different priorities and maneuvers. Two ways to model this:

1. **Multiple cards per ship.** `EngineCardSet = Record<ShipId, AiCard | readonly AiCard[]>` — the squad-level state picks which one. Most flexible, biggest UI implication.
2. **Cards keyed by `(ShipId, Variant)`.** `Record<ShipId, Record<VariantKey, AiCard>>` — explicit, clean, but adds a dimension.

Defer the decision to Phase 5; Defender is the only currently-known case. If more variants appear in transcription, go with option 2. If Defender stays alone, option 1 is fine and cheaper.

---

## 8. Squad runtime model

`Squad` lives in React state — a small struct that points into the data tables, not a copy of them.

```ts
interface Squad {
  shipId: ShipId;
  pilotInitiative: number;             // imperial pilot init, drives Anderson upgrade gating
  aiEngine: AiEngine;
  upgradeSource: UpgradeSource;
  variantIndex: number;                // which variant of the upgrade tree was selected
  isElite: boolean;                    // FGA / Community only — selects elite vs basic mode
  ships: ShipInstance[];               // physical ships in the squad, tracked individually
}

interface ShipInstance {
  tokenId: number;
  hull: number;                        // current hull (depleted as it takes damage)
  shields: number;                     // current shields
  flee: boolean;                       // has been assigned a flee token
}
```

The data layer stays read-only. All mutation happens to `Squad` / `ShipInstance` via reducer actions in the UI layer.

---

## 9. Runtime flow (turn resolution)

Inputs from the player: target position (sector + range + direction-if-Anderson-R2), and stressed flag.

1. **Maneuver** — `engineCards[shipId].maneuvers[position][rolld6-1]` (or `stressedManeuvers` if applicable). Code → `MANEUVER_PRESENTATION[code]` → dial render.
2. **Action** — render `selectAction` priority list; player executes top-applicable rule manually.
3. **Attack** — render `attack` priority list; player resolves manually.
4. **System / End phase (Anderson only)** — render `systemPhase` / `endPhase` description; player executes manually.

Contract: **every step must have a defined value for every (shipId, position) the engine claims to support.** Validator enforces.

---

## 10. Validator — `src/data/__validate__.ts`

A side-effect import that throws if any invariant fails. Imported from `App.tsx` so dev mode catches issues immediately. CI runs the same module in a Jest test (`tests/dataLayer.test.ts`) so a build can't ship a broken table.

### Invariants

1. **Length-6 maneuver arrays.** `assert(maneuvers[ship][pos].length === 6)` for every (ship, position) pair in every engine card.
2. **Resolved upgrade references.** `assert(row.upgrade !== undefined && typeof row.upgrade.skillName === 'string')`.
3. **AI coverage.** For every ship `S` with `Ships[S].ai.includes(E)`, assert `engineCards[E][S]` exists.
4. **Position coverage.** For every `Position` key referenced by an engine's UI position-selector, assert that every supported ship's `maneuvers` table defines that key.
5. **Upgrade-source coverage.** For every ship `S` with `Ships[S].upgrades.includes(U)`, assert that the upgrade tree for `U` has at least one variant for `S`.
6. **Distinct variants.** Within a ship's upgrade tree, no two variants are byte-identical. Catches the duplicate `hinnyUpgrades.VT49` bug.
7. **Anderson elite slots = 5.** Already enforced by the tuple type; the validator double-checks at runtime since data may be loaded dynamically in future.
8. **Initiative thresholds monotonic (Anderson).** Within a variant's `elite` array, thresholds should be non-decreasing. Soft warning, not an error — Anderson cards mostly follow this but not always.
9. **No JSX in upgrade descriptions.** `assert(typeof row.upgrade.description === 'string')`. New upgrades only — existing JSX-bearing data is migrated as part of Phase 5 / 6.

### Test contract

CI runs the validator as a single Jest test that imports `runValidator()` and asserts it does not throw. On failure it throws an `AggregateError` listing every offending `(ship, position, key)` tuple by name — no grepping required.

---

## 11. Icons

The `xwing-miniatures-font` provides icons (front arc, focus, charge, K-turn, etc.) as Unicode glyphs styled by CSS classes (`xwi x-frontarc`). New shape:

```ts
// src/data/icons.ts
type IconKey =
  | 'frontArc' | 'rearArc' | 'bullseye' | 'turret' | 'doubleTurret'
  | 'focus' | 'evade' | 'charge' | 'lock'
  | 'hit' | 'crit'
  | 'barrelroll' | 'boost' | 'cloak'
  | 'kturn' | 'sloop' | 'troll'
  | 'turnLeft' | 'turnRight' | 'straight' | 'bankLeft' | 'bankRight'
  | 'stop' | 'reverseStraight' | 'reverseBank';

const ICON_CLASS: Record<IconKey, string> = {
  frontArc:    'xwi x-frontarc',
  focus:       'xwi x-focus',
  // ...
};
```

The `<Icon kind="focus" />` component reads from this map. Upgrade descriptions reference icons by `IconKey`, not by hard-coded class names. This decouples data from CSS and lets the validator type-check icon references.

---

## 12. Worked examples

### 12.1 Adding a new ship to Anderson

For TIE/rb Aggressor (`TIERBA`, PDF page 14):

1. `Ships.ts` — add entry with `id`, stats, `ai: ['ANDERSON']`, `upgrades: ['ANDERSON']`, `fleeThreshold`.
2. `anderson/Maneuvers.ts` — transcribe the polar grid: all 20 PSN keys, each a 6-tuple.
3. `anderson/AndersonTargetSelection.ts`, `AndersonShipActions.ts`, `AndersonAttack.ts` — transcribe priority lists, including parenthetical conditions and footnote notes ("only if Target has not moved").
4. `anderson/AndersonAbilities.ts` — add the bottom-of-card pilot ability ("Agile Gunner").
5. `anderson/AndersonUpgrades.ts` — for each variant in the 2x/4x pilot decks, add an `AndersonVariant` with 1 Basic + 5 Elite rows.
6. Run the validator. It surfaces missing entries by `(ship, position, key)`.

### 12.2 Adding a new Anderson upgrade variant

The 4x pilot deck page N introduces a new variant for TIE/in Interceptor:

```ts
// anderson/AndersonUpgrades.ts
TIEIN: [
  // ...existing variants
  {
    basic: row(STEALTH_DEVICE, 1),
    elite: [
      row(SQUAD_LEADER,    4),
      row(LIEUTENANT_SAI,  4),
      row(DEL_MEEKO,       5),
      row(COMMANDANT_GORAN, 6),
      row(NASH_WINDRIDER,  6),
    ],
  },
],

function row(upgrade: Upgrade, initiative: number): UpgradeRow {
  return { source: 'ANDERSON', upgrade, initiative };
}
```

The `Upgrade` objects (`STEALTH_DEVICE`, `SQUAD_LEADER`, etc.) live in a flat `andersonUpgrades` map keyed by camelCase identifier. Add new ones to that map; do not inline anonymous objects in the variant tree.

---

## 13. Migration sequence (Phase 4 / 5)

Typed dependencies cascade, so order matters:

1. `icons.ts` — establishes `IconKey`.
2. `Maneuvers.ts` — establishes `Position`, `ManeuverCode`, presentation map (depends on icons).
3. `Ships.ts` — establishes `ShipId`, `AiEngine`, `UpgradeSource`.
4. `shared/coreUpgrades.ts` — establishes canonical `HULL_UPGRADE`, `SHIELD_UPGRADE`.
5. `fga/FgaUpgrades.ts` + `fga/CommunityUpgrades.ts` — convert tuple `[u, i, x]` → discriminated `UpgradeRow`.
6. `fga/{Maneuvers, Fga*Selection, FgaPositionSelection}` — convert.
7. `__validate__.ts` — write and verify against known-good FGA data.
8. `anderson/*` — populate from PDFs; validator surfaces gaps.
9. `hinny/*` — delete (Phase 6).
10. `src/data/index.ts` — barrel re-exports.

---

## 14. Anti-patterns — do not

- **Do not store JSX in data files.** New upgrades carry `description: string` and `icons: IconKey[]`. The renderer composes them. Existing JSX-laden upgrades get migrated as their containing tables get migrated.
- **Do not skip the validator.** If you're adding a new ship or upgrade, run validation before declaring done. CI will block you anyway, but find it locally.
- **Do not key maneuver tables on display strings** (`"R2-3 front"`). Use the `Position` enum identifier (`R3_FRONT`).
- **Do not introduce a third overloaded meaning to a tuple slot.** Use named record fields. The discriminated `UpgradeRow` is the model.
- **Do not silently drop a ship from one engine's table while still listing that engine in `Ships[X].ai`.** The validator will catch it, but don't make it work and call it done — fix one or the other.
- **Do not create `Upgrade` objects inline in upgrade variants.** Add to the engine's flat upgrades map first, then reference. Otherwise the canonical-identity check for Hull/Shield Upgrade breaks.
- **Do not import `react` in `src/data/`.** The data tree must remain renderer-agnostic. Icons reference `IconKey`; the component layer translates to JSX.
- **Do not call `Math.random()` inside data files.** Randomization is a runtime concern, lives in `src/components/ai/upgrades/` or equivalent.

---

## 15. Source-of-truth provenance

The data tables originate from external HotAC documents. When a table changes, update both the data file *and* the provenance line so future contributors know what to diff against.

| Engine | Table | Source document | Last reviewed |
|---|---|---|---|
| Anderson | `anderson/Maneuvers.ts` | `docs/anderson/AI_All_Empire_SHIPCARDS_ALL.pdf` (rasterized to `pages/p-NN.png`) | 2026-05-02 |
| Anderson | `anderson/AndersonUpgrades.ts` | `docs/anderson/AI_Alternative_Empire_PILOTCARDS_2x.pdf`, `..._4x.pdf` | 2026-05-02 |
| Anderson | `anderson/AndersonAbilities.ts`, `AndersonPhases.ts` | Same as Maneuvers (per-card bottom panels and System/End Phase boxes) | 2026-05-02 |
| FGA | `fga/Maneuvers.ts` | (existing data, original source not in repo) | unknown — pre-2026 |
| FGA | `fga/FgaUpgrades.ts` | (existing data + comment-block table at `UpgradesGenerator.js:561-569`) | unknown — pre-2026 |
| FGA | `fga/CommunityUpgrades.ts` | (existing data, community-sourced) | unknown — pre-2026 |
| Shared | `shared/coreUpgrades.ts` | Hand-defined to consolidate Hull/Shield Upgrade identity | 2026-05-02 |

PDFs are gitignored — they live locally in `docs/anderson/`. To regenerate the rasterized pages on a new machine: `pdftoppm -r 150 -png docs/anderson/AI_All_Empire_SHIPCARDS_ALL.pdf docs/anderson/pages/p`.

---

## 16. Edge cases & open questions

- **Lambda's Flee Threshold = 5** is the only non-zero in the Anderson PDF. Confirm during transcription.
- **TIE/rb Heavy has two near-identical pages** (15, 16). Determine whether they're duplicates, two pilots, or front/back. One vs two `AiCard` entries depending.
- **TIE/d Defender Elite (page 7)** is a separate card from the base Defender (page 6) — see §7 variant modeling.
- **Sith Infiltrator** and **Phantom** both have System Phase + cloak mechanics. Their phase descriptions may need icons not yet in `xwing-miniatures-font`. Audit during Phase 5.
- **Pilot init vs ship init.** `Ships.ts` carries a default; each `AiCard.pilotInitiative` overrides. SquadStats reads from the card.
- **Hull/Shield bonus is current, not cumulative.** When an upgrade is removed (variant change), the bonus is subtracted. `App.js:161-170` does this today; typed equivalent in Phase 4.
- **Anderson variant choice is per-squad, not per-upgrade.** Players pick one variant at squad creation; mixing variants requires a new squad. Confirm UX during Phase 5.
