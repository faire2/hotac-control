# Modular station assembly

How the holo wireframe of an assemblable station (hex hub + arms + bays +
turbolaser junctions) is authored and drawn. This is the `hull` map feature.

- **Spec/types:** `src/data/scenarios/types.ts` (`HullNode`, `HullArm`).
- **Placer (pure geometry):** `src/components/scenarios/stationAssembly.ts`.
- **Wiring:** `resolveMissionMap` in `missionMapModel.ts` calls `placeStation`.
- **Renderer:** `<MissionMap>` (`MissionMap.tsx`) draws the resulting polygons.
- **Worked example:** `src/data/scenarios/refuelingStation3.ts`.

For the surrounding map spec (zones, asteroids, tokens, vectors) see
[`SCENARIOS.md`](./SCENARIOS.md). This doc is *only* the `hull` feature.

## The mental model: build outward from the hub

You author a **tree**, not coordinates. The root node is anchored at the
feature's `at` cell; every child hangs off a parent via an `arm`. The placer
(`placeStation`) walks the tree and emits flat, already-positioned polygons +
emplacement tokens. You never place a child by hand — you say "attach this
module to that parent, on the face pointing roughly *this* way."

```ts
{ kind: 'hull', at: [4.5, 2.4], connectorWidth: 0.26,
  root: {
    shape: 'hex', size: 0.8, rotate: 30,
    emplacements: [{ label: 'F' }, { label: 'C' }, { label: 'F' }],
    arms: [
      { angle: -120, direct: true, to: { shape: 'square', size: 0.34, emplacements: [{ label: 'T' }] } },
      { angle: 180,  gap: 0.22,    to: { shape: 'square', size: 0.28, emplacements: [{ label: 'S' }],
        arms: [ /* hex junction → gated turbolasers */ ] } },
    ],
  } }
```

## How a child docks (the one thing to internalise)

`HullArm.angle` **only selects which face** of the parent the child attaches
to. The placer casts a ray from the parent centre along `angle`, finds the
polygon edge it exits through, and then mounts the child along that edge's
**outward normal** — its midpoint, perpendicular to the face. So:

- The child sits **flush** on the face, centred on it, regardless of the exact
  `angle`. `angle: -118` and `angle: -122` dock on the same hex face identically.
- You **cannot** get an arbitrary diagonal dock. To move a child, pick the
  `angle` that exits the face you want. To split one face into two ports, you
  need an intermediate junction node (see the turbolaser hexes).
- The child is rotated so its **port** (its own connection point, always at
  local top / −Y) faces back toward the parent.

Coordinate convention is screen-space: **+x right, +y down, clockwise
positive**. `angle` 0 = right, 90 = down, −90 = up, 180 = left.

## Shapes and their ports

`localOutline` defines each shape's outline and its `portDist` (centre → port).
The port is what docks against the parent.

| `shape` | Port (where it connects) | Notes |
|---|---|---|
| `hex` | **flat top edge**, port at the apothem | Flat-top by default so hexes dock **edge-to-edge, never on a vertex**. Use `rotate: 30` for a pointy-top hub. |
| `square` | top edge, port at half-side | Emplacement tile. |
| `triangle` | top, port below the apex | Small junction node. |
| `bay` | necked top edge at connector width | Body widens to a straight outer wall; hub side necks down — never ends in a point. Landing bay / turbolaser wedge. |

### `rotate` (hex hubs especially)

`HullNode.rotate` adds degrees to the node's **outline and the faces children
dock against**, but **not** its emplacement labels. That decoupling is why the
refueling-station hub renders pointy-top (`rotate: 30`) while its `F C F` row
stays horizontal. If you rotate a node and the labels look wrong, that's the
intended split — labels track the inbound frame, geometry tracks `rotate`.

## Arm options

| Field | Default | Effect |
|---|---|---|
| `angle` | — | Selects the parent face (see above). |
| `gap` | `0.5` | Length of the connector rectangle from face to child port. |
| `direct` | `false` | No connector segment — child abuts the hull (forces `gap = 0`). Use for tiles flush on the hub (the hub turbolasers, the bays). |
| `to` | — | The child `HullNode`. |

`connectorWidth` (on the feature, default `0.28`) is the width of every
connector rectangle **and** the bay neck. One value keeps the whole station's
plumbing consistent.

## Player-count gating

Any node reached via an arm whose `to.playerCount` exceeds the current count is
pruned — **with its entire subtree and its inbound connector**. This is how the
station grows turbolasers as the table fills (the gated hex junctions and their
`T` tiles appear at 3/4/5/6 players). Omit `playerCount` on `placeStation` to
render every module regardless.

## Tuning constants (in `stationAssembly.ts`)

These are global to all stations — change with that in mind (only the refueling
station uses bays today).

- `DEFAULT_GAP = 0.5` — connector length when an arm omits `gap`.
- `BAY_NECK = 0.3` — how far the bay neck rises above the body; **larger =
  steeper neck taper**. Also feeds `portDist`, so it nudges bay distance slightly.
- `EMPLACEMENT_SPACING = 0.6` — gap between emplacement labels in a row.

## Authoring workflow

1. Edit the tree in the scenario data file. Sizes/gaps are in **grid cells**.
2. Preview: Menu → Load scenario → pick the mission; the map renders in the
   briefing modal. Check multiple player counts to see gated arms appear.
3. Iterate on `angle` (face selection), `gap`/`direct` (how tight), `size`/
   `depth` (proportions), `rotate` (hub orientation). Shape *taper* lives in the
   `localOutline`/constant code, not the data.

### Pitfalls (don't relearn these)

- **Vertex docking.** A hex docked at a point means it's pointy-top where you
  wanted flat-top — fix the orientation, don't fudge the angle. Hexes are
  flat-top by default precisely so junctions meet edge-to-edge.
- **Chasing an exact diagonal with `angle`.** It won't work — the normal, not
  the angle, sets the dock direction. Add a junction node instead.
- **Rotating labels with the hull.** They don't rotate with `rotate` by design.
- **Bay ending in a point.** It can't; the neck is clamped to `connectorWidth`.
  If it looks pinched, adjust `connectorWidth` or `BAY_NECK`, not the outline.
