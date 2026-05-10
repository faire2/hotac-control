/**
 * Campaign persistence — abstract interface.
 *
 * The single source of truth for "where do saved campaigns live". Today:
 * localStorage. Tomorrow: a Neon-backed REST API behind OAuth. The
 * interface stays the same; only the impl swaps.
 *
 * Promise-based (even though the localStorage impl is synchronous) so the
 * API doesn't change on the DB swap.
 *
 * Consumers should depend on `CampaignStore` and the active impl (chosen
 * in `storage.active.ts` — single import point), never on a specific
 * backend module.
 */

import type { Campaign, CampaignSummary } from '../scenarios/types';

export interface CampaignStore {
  /** Compact list for the Open dialog. Sorted by `updatedAt` desc. */
  list(): Promise<readonly CampaignSummary[]>;
  /** Full record. Returns `null` if id is unknown. */
  load(id: string): Promise<Campaign | null>;
  /** Upsert. Sets `updatedAt`. */
  save(campaign: Campaign): Promise<void>;
  /** Idempotent. */
  delete(id: string): Promise<void>;
}
