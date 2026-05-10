/**
 * Hook for loading + persisting the currently-active campaign.
 *
 * Pass the active campaign id (from `AppMode`) and get back the Campaign
 * record plus an `update(...)` helper that mutates and persists in one go.
 *
 * - On id change: loads from storage. `loading` is true between request
 *   and arrival.
 * - On null id: clears state. Used when leaving campaign mode.
 * - `update(updater)` is a functional setter — returns the saved campaign
 *   so callers can immediately transition mode based on its new state.
 */

import { useEffect, useState } from 'react';
import type { Campaign } from '../data/scenarios/types';
import { campaignStore } from '../data/campaigns/storage.active';

export interface UseCampaignResult {
  campaign: Campaign | null;
  loading: boolean;
  /** Functional update + save. Returns the saved record. */
  update: (updater: (c: Campaign) => Campaign) => Promise<Campaign | null>;
  /** Force a re-read from storage (e.g. after external save). */
  reload: () => Promise<void>;
}

export function useCampaign(campaignId: string | null): UseCampaignResult {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campaignId === null) {
      setCampaign(null);
      return;
    }
    setLoading(true);
    let cancelled = false;
    void campaignStore.load(campaignId).then((c) => {
      if (!cancelled) {
        setCampaign(c);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  async function update(updater: (c: Campaign) => Campaign): Promise<Campaign | null> {
    if (campaign === null) return null;
    const next = updater(campaign);
    setCampaign(next);
    await campaignStore.save(next);
    return next;
  }

  async function reload(): Promise<void> {
    if (campaignId === null) return;
    const c = await campaignStore.load(campaignId);
    setCampaign(c);
  }

  return { campaign, loading, update, reload };
}
