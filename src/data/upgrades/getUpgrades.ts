/**
 * Upgrade roller.
 *
 * Given (shipType, playersRank, upgradeSource, isElite), pick a variant from
 * the relevant tree, then filter by rank ladder. Returns the bare upgrade
 * list plus an `UpgradeRollMeta` snapshot — source + initiative override +
 * XP/tier for the XP-column display.
 *
 * Internally we still iterate `UpgradeRow` values (the typed tree shape from
 * `FgaUpgrades` / `CommunityUpgradeTree`) since the per-row tier/xp data
 * drives the filtering. We collapse the rows into `Upgrade[]` + meta at the
 * end so the runtime squadron state doesn't carry roll-time bookkeeping
 * on every row.
 *
 * Anderson is currently a no-op (Phase 5b transcribes the upgrade trees);
 * returns empty upgrades with `xp: '—'` rather than throwing.
 */

import { Ships, UPGRADES } from '../Ships';
import type { ShipId, UpgradeSource } from '../Ships';
import type { UpgradeRow } from '../UpgradeRow';
import { FgaUpgrades } from '../fga/FgaUpgrades';
import { CommunityUpgradeTree } from '../fga/CommunityUpgradeTree';
import { FgaUpgradePool } from '../fga/FgaUpgradePool';
import { fgaRow } from '../UpgradeRow';
import type { Upgrade } from '../shared/coreUpgrades';
import type { UpgradeRollMeta } from '../../context/Contexts';

export interface UpgradeRollResult {
  upgrades: readonly Upgrade[];
  rollMeta: UpgradeRollMeta;
}

export default function getUpgrades(
  shipType: ShipId,
  playersRank: number,
  upgradesSource: UpgradeSource,
  isElite: boolean,
): UpgradeRollResult {
  switch (upgradesSource) {
    case UPGRADES.FGA:
      return collapse(getFga(shipType, playersRank, isElite), UPGRADES.FGA);
    case UPGRADES.COMMUNITY:
      return collapse(getCommunity(shipType, playersRank, isElite), UPGRADES.COMMUNITY);
    case UPGRADES.ANDERSON:
      // Phase 5b will populate Anderson trees.
      return { upgrades: [], rollMeta: { source: UPGRADES.ANDERSON, xp: '—' } };
  }
}

/** Collapse an internal `UpgradeRow[]` into the runtime shape: bare upgrades
 * plus a roll-meta snapshot derived from the last row (highest tier). */
function collapse(rows: readonly UpgradeRow[], source: UpgradeSource): UpgradeRollResult {
  const last = rows.at(-1);
  return {
    upgrades: rows.map((r) => r.upgrade),
    rollMeta: {
      source,
      initiative: last?.initiative,
      xp: xpFromRow(last),
    },
  };
}

function xpFromRow(row: UpgradeRow | undefined): number | string {
  if (!row) return 0;
  if (row.source === 'COMMUNITY') return row.xpCost;
  if (row.source === 'FGA') return row.tier;
  return '—';
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
