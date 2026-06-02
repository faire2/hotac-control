/**
 * Radial station-assembly placer. Turns a declarative `HullNode` tree (anchored
 * at a hub) into flat, already-positioned polygons + emplacement tokens the
 * `<MissionMap>` renderer can draw directly. Pure geometry: no React, no DOM.
 *
 * The placer builds the station *outward* from the hub. For each child arm it:
 *   1. casts a ray from the parent centre along the arm angle to find the exact
 *      point where it crosses the parent's outline (so connectors touch the
 *      real boundary, not an approximate radius),
 *   2. draws a connector rectangle of the assembly's standard width from that
 *      boundary point outward by `gap`, and
 *   3. places the child so its connector *port* sits at the connector's far end
 *      and rotates it so the port faces back toward the parent.
 *
 * Because every child is oriented from its port, a `bay`'s straight wide wall
 * always faces outward and its hub side always necks down to exactly the
 * connector width.
 */

import type { HullEmplacement, HullNode } from '../../data/scenarios/types';
import type { ResolvedToken } from './missionMapModel';

export type HullPoly = readonly (readonly [number, number])[];

export interface PlacedStation {
  polys: readonly HullPoly[];
  tokens: readonly ResolvedToken[];
}

type Pt = readonly [number, number];

const DEG = Math.PI / 180;
const DEFAULT_GAP = 0.5;
const BAY_NECK = 0.3;
const EMPLACEMENT_SPACING = 0.6;

function dir(deg: number): Pt {
  return [Math.cos(deg * DEG), Math.sin(deg * DEG)];
}

/** Rotate `p` by `deg` (screen coords: +x right, +y down, clockwise positive). */
function rotate(p: Pt, deg: number): Pt {
  const a = deg * DEG;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
}

function place(p: Pt, center: Pt, deg: number): Pt {
  const r = rotate(p, deg);
  return [r[0] + center[0], r[1] + center[1]];
}

/**
 * Local outline of a node, origin at the body centre, with its connector port
 * centred at the top (toward −Y, i.e. toward the parent). `portDist` is how far
 * the port sits from the centre along −Y.
 */
function localOutline(node: HullNode, connectorWidth: number): { pts: Pt[]; portDist: number } {
  const s = node.size;
  if (node.shape === 'hex') {
    // Flat-top: a flat edge centred at the top (toward the parent), so a hex docks
    // against its neighbour edge-to-edge, never on a vertex. portDist is the
    // apothem (centre → edge midpoint), not the circumradius.
    const pts: Pt[] = [];
    for (let k = 0; k < 6; k++) {
      const th = (-120 + k * 60) * DEG;
      pts.push([s * Math.cos(th), s * Math.sin(th)]);
    }
    return { pts, portDist: s * Math.cos(30 * DEG) };
  }
  if (node.shape === 'square') {
    return {
      pts: [
        [-s, -s],
        [s, -s],
        [s, s],
        [-s, s],
      ],
      portDist: s,
    };
  }
  if (node.shape === 'triangle') {
    return {
      pts: [
        [0, s],
        [-s * 0.92, -s * 0.6],
        [s * 0.92, -s * 0.6],
      ],
      portDist: s * 0.6,
    };
  }
  // bay: neck (port) at top, body widening to a straight outer wall at the bottom.
  const d = node.depth ?? s;
  const cw = connectorWidth / 2;
  return {
    pts: [
      [-cw, -d / 2 - BAY_NECK],
      [cw, -d / 2 - BAY_NECK],
      [s, -d / 2],
      [s, d / 2],
      [-s, d / 2],
      [-s, -d / 2],
    ],
    portDist: d / 2 + BAY_NECK,
  };
}

/**
 * Resolve the *face* of `poly` an arm should dock against. The arm's `deg` only
 * picks which edge: we cast a ray along it, take the edge it exits through, and
 * return that edge's midpoint plus its outward-pointing normal. Mounting along
 * the normal (rather than the raw `deg`) is what makes connectors sit flush on
 * the hull instead of meeting it at a guessed angle.
 */
function faceExit(center: Pt, deg: number, poly: readonly Pt[]): { mid: Pt; normalDeg: number } {
  const d = dir(deg);
  let bestT = -Infinity;
  let bestEdge = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const ex = b[0] - a[0];
    const ey = b[1] - a[1];
    const denom = d[0] * ey - d[1] * ex;
    if (Math.abs(denom) < 1e-9) continue;
    const wx = a[0] - center[0];
    const wy = a[1] - center[1];
    const t = (wx * ey - wy * ex) / denom;
    const u = (wx * d[1] - wy * d[0]) / denom;
    if (t > bestT && u >= -1e-6 && u <= 1 + 1e-6) {
      bestT = t;
      bestEdge = i;
    }
  }
  const a = poly[bestEdge];
  const b = poly[(bestEdge + 1) % poly.length];
  const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let nx = -(b[1] - a[1]);
  let ny = b[0] - a[0];
  if ((mid[0] - center[0]) * nx + (mid[1] - center[1]) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  return { mid, normalDeg: Math.atan2(ny, nx) / DEG };
}

function connectorRect(from: Pt, to: Pt, width: number): HullPoly {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (width / 2);
  const ny = (dx / len) * (width / 2);
  return [
    [from[0] + nx, from[1] + ny],
    [to[0] + nx, to[1] + ny],
    [to[0] - nx, to[1] - ny],
    [from[0] - nx, from[1] - ny],
  ];
}

function emplacementTokens(
  list: readonly HullEmplacement[],
  center: Pt,
  deg: number,
): ResolvedToken[] {
  const n = list.length;
  return list.map((e, i) => {
    const lx = (i - (n - 1) / 2) * EMPLACEMENT_SPACING;
    return { kind: 'structure', at: place([lx, 0], center, deg), label: e.label, tip: e.tip };
  });
}

function walk(
  node: HullNode,
  center: Pt,
  deg: number,
  connectorWidth: number,
  playerCount: number | undefined,
  polys: HullPoly[],
  tokens: ResolvedToken[],
): void {
  const selfDeg = deg + (node.rotate ?? 0);
  const outline = localOutline(node, connectorWidth).pts.map((p) => place(p, center, selfDeg));
  polys.push(outline);
  if (node.emplacements) tokens.push(...emplacementTokens(node.emplacements, center, deg));

  for (const arm of node.arms ?? []) {
    const threshold = arm.to.playerCount;
    if (playerCount !== undefined && threshold !== undefined && playerCount < threshold) continue;

    const { mid: pB, normalDeg } = faceExit(center, arm.angle, outline);
    const md = dir(normalDeg);
    const childPortDist = localOutline(arm.to, connectorWidth).portDist;
    const gap = arm.direct ? 0 : (arm.gap ?? DEFAULT_GAP);
    const childCenter: Pt = [pB[0] + md[0] * (gap + childPortDist), pB[1] + md[1] * (gap + childPortDist)];

    if (!arm.direct) {
      const childPort: Pt = [pB[0] + md[0] * gap, pB[1] + md[1] * gap];
      polys.push(connectorRect(pB, childPort, connectorWidth));
    }
    walk(arm.to, childCenter, normalDeg - 90, connectorWidth, playerCount, polys, tokens);
  }
}

/**
 * Resolve a station assembly anchored at `at` (cell coords) for a player count.
 * Returns the holo outline polygons and the emplacement tokens to render.
 */
export function placeStation(
  root: HullNode,
  at: Pt,
  connectorWidth: number,
  playerCount: number | undefined,
): PlacedStation {
  const polys: HullPoly[] = [];
  const tokens: ResolvedToken[] = [];
  walk(root, at, 0, connectorWidth, playerCount, polys, tokens);
  return { polys, tokens };
}
