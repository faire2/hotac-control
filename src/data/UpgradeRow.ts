/**
 * Discriminated upgrade-row union.
 *
 * The legacy positional triple `[upgrade, initiative, xp]` overloaded slot
 * `[2]` with three different meanings (cumulative XP in Hinny, flat constant
 * in Community, tier 1/2/3 in FGA). This union pins meaning per source so
 * old code that read `row[2]` blindly is now a type error — callers must
 * narrow on `source` before reading source-specific fields.
 *
 * See `docs/DATA-LAYER.md` §6 for the full rationale.
 */

import type { Upgrade } from './shared/coreUpgrades';

export type FgaUpgradeRow = {
  source: 'FGA';
  upgrade: Upgrade;
  initiative: number;
  /** XP tier 1/2/3 — drives the FGA `getFgaUpgrades` rank-ladder filter. */
  tier: 1 | 2 | 3;
};

export type CommunityUpgradeRow = {
  source: 'COMMUNITY';
  upgrade: Upgrade;
  initiative: number;
  /** XP cost (legacy data — always present, not always meaningful). */
  xpCost: number;
};

export type AndersonUpgradeRow = {
  source: 'ANDERSON';
  upgrade: Upgrade;
  /** Initiative threshold at which this upgrade becomes available. */
  initiative: number;
};

export type UpgradeRow = FgaUpgradeRow | CommunityUpgradeRow | AndersonUpgradeRow;

export function fgaRow(upgrade: Upgrade, initiative: number, tier: 1 | 2 | 3): FgaUpgradeRow {
  return { source: 'FGA', upgrade, initiative, tier };
}

export function communityRow(upgrade: Upgrade, initiative: number, xpCost: number): CommunityUpgradeRow {
  return { source: 'COMMUNITY', upgrade, initiative, xpCost };
}

export function andersonRow(upgrade: Upgrade, initiative: number): AndersonUpgradeRow {
  return { source: 'ANDERSON', upgrade, initiative };
}
