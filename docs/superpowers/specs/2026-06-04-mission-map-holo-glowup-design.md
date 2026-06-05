# Mission Map & Briefing — Holograph Glow-Up

**Date:** 2026-06-04
**Status:** Design approved, pending implementation plan
**Scope:** Visual redesign of `MissionMap` and the full `ScenarioBriefingModal` into a striking, crisp, in-universe holographic readout. No behavior or data-layer changes.

## Goal

The app frames the UI as a Rebel pilot's tactical display. The mission map and its briefing
modal should read as an **in-universe holoprojector readout** — crisp and readable, but striking.
Visual language draws on canonical Imperial display art (Star Destroyer / TIE schematics:
deep blue-black field, fine bright-blue + white line work, wireframe craft, edge tick-scales,
corner registration brackets, sparing red alert markers, CRT bloom/scanlines/vignette).

This is a **glow-up**, not a rebuild: extend the app's existing holo cockpit vocabulary
(`App.cockpit.css`, `Squad.cockpit.css`) rather than invent a parallel style.

## Locked decisions

- **Intensity:** Bold holo overhaul (full holoprojector look). Readability is a hard constraint.
- **Motion:** Subtle ambient motion (scanline drift, faint flicker/bloom breathing). Must honor
  `prefers-reduced-motion` → static. **No radar sweep** — revised 2026-06-04: a rotating sweep
  read as modern-HUD rather than Star Wars. The SW idiom is a backlit holo projection on a glass
  panel (flat bright line-work + glass sheen), so atmosphere is a static glass sheen instead.
- **Scope:** Whole briefing modal re-skinned as a unified holo console, with the map as centerpiece.
- **Rendering strategy:** Hybrid (approach C) — crisp vector *geometry* + one shared SVG bloom
  filter in the SVG; full-surface atmosphere (scanlines, vignette, sweep, flicker) and chrome in CSS.
- **Ships:** Keep the Squad card's silhouette basis (filled bright-cyan ships-font silhouette with
  soft double-bloom); the map may add minimal tactical chrome (hostile = red + corner reticle ticks).

## Non-goals (YAGNI)

- No React 18 bump, no react-bootstrap removal (pin-lift allows it later; out of scope here).
- No change to `missionMapModel.ts` resolver contract or any scenario data unless a purely
  additive derived field is needed; data-layer invariants and the validator stay green.
- No new runtime dependencies. No CSS-in-JS. No Tailwind.
- No 3D/perspective projection — the map stays a top-down tactical board (grid positions are
  functional). Depth is implied via gradient/bloom only.

## Architecture — layered composition

The map renders as a back-to-front stack so each concern is independent and tunable:

```
.holoframe (CSS container — diegetic readout frame)
 ├─ layer 0  CSS  near-black field + whisper of center lift
 ├─ layer 1  SVG  <MissionMap> — crisp vector geometry (one shared bloom filter)
 └─ layer 2  CSS  ::before  scanlines (fine repeating-linear-gradient, slow upward drift)
```
(Earlier drafts had a radar-sweep layer and a glass sheen/vignette ::after layer; both
removed — see Motion decision. Crispness/contrast now comes from bright lines on near-black.)

Rationale for hybrid: SVG filters are better at stroke-glow that must hug each vector; CSS is
better at full-surface effects and cheap GPU animation, trivially gated by `prefers-reduced-motion`,
and reuses the cockpit idiom already in the app. The existing `mm-glow` SVG filter is the seed
for the shared bloom.

## File touch-list

- `src/components/scenarios/MissionMap.tsx` — refactor SVG drawing into clear sub-component blocks
  (`Defs`, `Frame`, `Grid`, `Zones`, `Hazards`, `Structures`, `Tokens`, `Vectors`). Geometry +
  bloom only. Single file retained (cohesive; imports/validator expect it). No resolver contract change.
- `src/components/scenarios/MissionMap.css` — grows from 18 lines into the layer/atmosphere/motion
  stylesheet; owns the `.holoframe` wrapper, scanlines, vignette, sweep, flicker, reduced-motion.
- `src/components/scenarios/ScenarioBriefingModal.tsx` — structural class hooks for the re-skin
  (no logic/behavior change).
- `src/components/scenarios/ScenarioBriefingModal.css` — **new**, collocated. Briefing-specific
  structure (header/toggles, transmission panel, objectives, footer). Leans on the global
  `.modal-content` cockpit theme for the frame.
- `missionMapModel.ts` — untouched unless a purely additive derived field proves necessary.
- Possibly +1–2 CSS tokens (e.g. `--accent-holo-wire`) added alongside the existing `--accent-*`.

## Visual language — the map

| Element | Current | New |
|---|---|---|
| Field & depth | flat navy | radial depth gradient (lit center, dark edges), reinforced by CSS vignette |
| Grid | uniform dashed cyan | two-tier hierarchy: hairline minor cells + brighter major thirds, faint bloom; `+` registration ticks at major intersections |
| Board border | thin rectangle | corner **registration brackets** (`⌐ ¬ ⌙ ⌟`) |
| Edge framing | none | **tick-scale rulers** down the margins + Aurebesh-style corner hash labels |
| Zones | uniform dashed rects | crisp corner-bracket outlines, scanline-textured fill, dotted alignment line to nearest edge tick; hue still `holo/warn/danger` |
| Ships | flat single-char `XWingShip` glyph | **ships-font silhouette** (same as Squad card) bright-cyan + double-bloom; hostiles red + corner reticle ticks; heading rotation supported |
| Objectives/relay/transport/station/hull | distinct silhouettes (good) | keep silhouettes, unify on stroke+bloom+wireframe treatment |
| Hazards (asteroid/mine/ion) | decent geometry | keep geometry, add consistent line-glow; red used sparingly |
| Approach vectors | chevron+number (clear) | keep, restyle to bracket/bloom vocabulary |

**Palette discipline:** cyan = friendly/neutral structure; amber = caution; red = hostile/alert
(reserved and sparse, as the references use it).

### Ship rendering detail

- **Preferred:** `<foreignObject>` hosting the exact `<i className="xwing-miniatures-ship
  xwing-miniatures-ship-{slug}">` the Squad card uses — pixel-identical, reuses the existing
  `SHIP_GLYPH` (ShipId → slug) map from `SquadStats.tsx`.
- **Fallback (if foreignObject misbehaves under the SVG viewBox / screenshots):** a TS
  `ShipId → ships-font codepoint` map rendered via SVG `<text font-family="xwing-miniatures-ships">`.
  Codepoints mirror the `content:` values in `src/fonts/xwing-miniatures.css`.
- The map's current `SHIP_GLYPH_CHAR` retires once the ships-font silhouette lands.

## Atmosphere & motion (CSS)

- **Scanlines:** low-opacity fine `repeating-linear-gradient`, slow upward drift. Idiom matches
  `.squad-mfd-scanlines`.
- **Vignette + bloom haze:** radial-gradient darkening corners + faint cyan haze (`screen` /
  `plus-lighter` blend) lifting off geometry.
- **Field:** near-black with only a whisper of center lift. No vignette, no glass sheen — revised
  2026-06-04 after comparing to the reference schematics, which are crisp and high-contrast
  edge-to-edge (the sheen/vignette washed out the crispness). Atmosphere is now scanlines + flicker
  only; contrast comes from bright line-work on near-black.
- **Line contrast:** structural lines (board border, registration brackets, major edge ticks) lifted
  to `--accent-holo-bright`; major grid in full `--accent-holo`; minor grid a crisp solid hairline
  (not dashed) kept subordinate by opacity.
- **Flicker:** subliminal brightness breathing (~1–2%), never strobing.
- **`prefers-reduced-motion`:** disables scanline drift + flicker; styling otherwise identical (static).

## Whole-modal re-skin

The briefing modal becomes one instrument readout, extending the inherited cockpit `.modal-content`
frame:

- **Header / toggles:** rank / number / engine / upgrades `ToggleButtonGroup`s restyled as crisp
  segmented holo selectors (bracket framing, glow on active).
- **Briefing text:** faint-bordered "transmission" panel with a diegetic label (e.g. `▸ MISSION
  BRIEFING`); headings use existing `--display`/`--mono` vocabulary.
- **Map:** wrapped in the `.holoframe` with title strip + corner data — centerpiece.
- **Objectives / special rules:** holo bullet ticks; `badge-xp` keeps meaning, gains holo styling;
  primary vs bonus by hue.
- **Footer:** Back / Start scenario / Close as holo buttons consistent with the rest.
- **Constraint:** layout/structure and behavior unchanged — purely a re-skin. `react-bootstrap`
  Modal retained.

## Verification

- **Visual:** re-render the five representative scenarios that exercise every feature type and
  compare before/after at 2× scale:
  - Local Trouble (asteroids only — baseline)
  - Imperial Entanglements (minefield + transport)
  - Cloak and Dagger (ion storms + station)
  - Capture Refueling Station (station + hull + asteroids)
  - Secure the Holonet (station + hull + relay + asteroids — richest)
  Use the established playwright-core render pipeline (`/tmp/maps5.mjs` pattern).
- **Reduced motion:** verify animations stop under `prefers-reduced-motion: reduce`.
- **Readability:** every label/badge/token legible at the modal's actual rendered size, not just 2×.
- **Build gate:** `npm run lint && npm test && npm run build` green. Data-layer validator unaffected
  (no data/resolver change). Pre-existing failures, if any, called out separately.

## Element treatments (finalized through iteration, 2026-06-04)

Grounded in the reference readouts (swtfa11/13/14, io1/io3/io5): SW consoles never
enclose a region with a dashed box — they use solid contours, corner brackets, or hatch fills,
and draw solid bodies as faceted wireframes.

- **Zone enclosure (no dashed borders):**
  - *Neutral (holo)* → faint tint fill + **corner brackets** (open edges), clipped corners on rects.
  - *Danger* → **diagonal red hatch** (`mm-hatch-danger` pattern) + solid bright edge. Hatch is
    reserved for real threats so it keeps its "stay out" meaning.
  - *Warn (amber)* → calm solid edge + tint (no hatch).
  - Discs / quarter-discs / triangles → solid edges (dashes removed), hatch fill when danger.
  - *Neutral rect* also carries a faint solid full edge (not just brackets) so large zones read.
  - *Neutral band* (edge strips, e.g. escape edges): stronger tint + a bright glowing **inner edge**
    on the board-facing side (a full outline is invisible since the other sides hug the border).
- **GR-75 transport** → symmetric elongated **lozenge** (ellipse), dense transverse cargo ribbing,
  dorsal spine, and forward cargo-clamp **prongs** at the bow — per the canonical top-down view, not
  a tapered teardrop.
- **Stations:**
  - *Emplacement modules* (hull assembly) get a dedicated `structure` token branch — clipped-corner
    holo box + inner frame + mono function letter (F/C/T/S). The assembler now threads each node's
    rotation (`deg`) onto the token (`structure.angle`) so the **box rotates to align with its tilted
    docking bay / arm**, while the letter stays upright. Fixes the "upright box on a tilted panel" look.
  - *Bar* preset → docking platform: clipped-corner deck, corner brackets, approach chevrons, centre
    landing target.
  - *Tri-hub* → concentric hub ring + core ring + docking lights at the arm tips.
- **Asteroids** → faint fill + 1–2 internal **facet lines** ("scanned rock"). **Debris** → small
  filled chips, visually distinct from full rocks.
- **Margin instrumentation** (corner squares only — vector-badge-free; all `aria-hidden`):
  a small **dial-gauge bezel** (ticks + reading wedge), short **fake-Aurebesh strips** (same idiom
  as the squad card), and a tiny **bar-graph readout**. Adds in-universe density without touching
  the play grid.

## Risks

- **foreignObject fidelity** under SVG viewBox scaling/screenshots — mitigated by the SVG-`<text>`
  codepoint fallback.
- **Animation/perf** on low-end machines — mitigated by CSS-only animation, low layer count, and
  reduced-motion gating.
- **Over-glow hurting readability** — palette discipline + readability check at real render size;
  bloom/scanline opacity tuned conservatively.
