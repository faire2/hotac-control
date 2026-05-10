/**
 * Upgrade picker.
 *
 * Given (shipType, playersRank, upgradeSource, isElite), pick a variant from
 * the relevant tree, then filter rows by rank ladder. Returns an array of
 * `UpgradeRow` — the discriminated union from `src/data/UpgradeRow.ts`.
 *
 * Anderson is currently a no-op (Phase 5b transcribes the upgrade trees);
 * returns an empty list rather than throwing so the UI dispatch stays clean.
 */

import { Ships, UPGRADES } from '../Ships';
import type { ShipId, UpgradeSource } from '../Ships';
import type { UpgradeRow } from '../UpgradeRow';
import { FgaUpgrades } from '../fga/FgaUpgrades';
import { CommunityUpgradeTree } from '../fga/CommunityUpgradeTree';
import { FgaUpgradePool } from '../fga/FgaUpgradePool';
import { fgaRow } from '../UpgradeRow';

export default function getUpgrades(
  shipType: ShipId,
  playersRank: number,
  upgradesSource: UpgradeSource,
  isElite: boolean,
): readonly UpgradeRow[] {
  switch (upgradesSource) {
    case UPGRADES.FGA:
      return getFga(shipType, playersRank, isElite);
    case UPGRADES.COMMUNITY:
      return getCommunity(shipType, playersRank, isElite);
    case UPGRADES.ANDERSON:
      // Phase 5b will populate Anderson trees.
      return [];
  }
}

function pickVariant<T>(variants: readonly (readonly T[])[]): T[] {
  if (variants.length === 0) return [];
  const idx = Math.min(
    Math.max(Math.round((Math.random() * 10) / 10 * variants.length) - 1, 0),
    variants.length - 1,
  );
  return [...(variants[idx] ?? [])];
}

function getFga(shipType: ShipId, playersRank: number, isElite: boolean): readonly UpgradeRow[] {
  const variants = FgaUpgrades[shipType] ?? [];
  let rows: UpgradeRow[] = pickVariant(variants);

  // TIELN special handling — see UpgradesGenerator.js comment block (lines 561-569 in legacy).
  if (shipType === Ships.TIELN.id) {
    if (playersRank < 7) {
      rows = [fgaRow(FgaUpgradePool.noUpgrade, 1, 1)];
    }
    if (playersRank > 5) {
      rows = [fgaRow(FgaUpgradePool.shieldUpgrade, 1, 1), ...rows];
    }
  } else {
    rows = filterFgaByRank(rows, playersRank, isElite);
  }

  if (playersRank > 6) {
    rows = [fgaRow(FgaUpgradePool.shieldRegeneration, 1, 1), ...rows];
  }
  return rows;
}

function filterFgaByRank(
  rows: readonly UpgradeRow[],
  playersRank: number,
  isElite: boolean,
): UpgradeRow[] {
  // Tier ladder (DATA-LAYER §6 target): tier 1 = always, tier 2 = mid+, tier 3 = top.
  let xpLevel: 1 | 2 | 3;
  if (playersRank < 2) {
    xpLevel = isElite ? 2 : 1;
    if (!isElite) return [fgaRow(FgaUpgradePool.noUpgrade, 1, 1)];
  } else if (playersRank < 5) {
    xpLevel = isElite ? 2 : 1;
  } else if (playersRank < 6) {
    xpLevel = isElite ? 3 : 1;
  } else {
    xpLevel = isElite ? 3 : 2;
  }
  return rows.filter((r) => r.source !== 'FGA' || r.tier <= xpLevel);
}

function getCommunity(
  shipType: ShipId,
  playersRank: number,
  isElite: boolean,
): readonly UpgradeRow[] {
  const variants = CommunityUpgradeTree[shipType] ?? [];
  const rows = [...pickVariant(variants)];

  if (!isElite || shipType === Ships.TIELN.id) {
    return rows.slice(0, 1);
  }
  if (playersRank <= rows.length) {
    rows.length = playersRank < 3 ? 3 : playersRank + 1;
  }
  return rows;
}
