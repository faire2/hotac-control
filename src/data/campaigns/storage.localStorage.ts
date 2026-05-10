/**
 * `CampaignStore` backed by localStorage.
 *
 * Storage shape (single key `hotac.v1`):
 *
 *   {
 *     version: 1,
 *     campaigns: { [id]: Campaign }
 *   }
 *
 * One blob, one read, one write. Simpler than a key-per-campaign and easy
 * to migrate to a server-side `GET /api/state` later. The version field
 * lets future shape changes ship a migration without breaking existing
 * users — bump the version, write a `migrate(oldVersion, raw): Persisted`
 * arm in `loadRaw`.
 *
 * Promise-based even though localStorage is synchronous; this API matches
 * `storage.ts:CampaignStore` so the eventual Neon impl drops in cleanly.
 */

import type { Campaign, CampaignSummary } from '../scenarios/types';
import type { CampaignStore } from './storage';

const STORAGE_KEY = 'hotac.v1';
const CURRENT_VERSION = 1 as const;

interface Persisted {
  version: typeof CURRENT_VERSION;
  campaigns: Record<string, Campaign>;
}

function emptyState(): Persisted {
  return { version: CURRENT_VERSION, campaigns: {} };
}

function loadRaw(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return emptyState();
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    if (parsed.version !== CURRENT_VERSION) {
      // Future: dispatch on parsed.version → migration. For now, drop
      // unknown-version data rather than corrupt the user's saves.
      console.warn(
        `[campaign storage] unknown version ${String(parsed.version)} — discarding existing data.`,
      );
      return emptyState();
    }
    return {
      version: CURRENT_VERSION,
      campaigns: parsed.campaigns ?? {},
    };
  } catch (e) {
    console.warn('[campaign storage] failed to read:', e);
    return emptyState();
  }
}

function writeRaw(state: Persisted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Quota exceeded / private mode / disabled — campaigns aren't
    // recoverable but at least the app doesn't crash.
    console.warn('[campaign storage] failed to write:', e);
  }
}

function summarize(c: Campaign, totalArcs: number): CampaignSummary {
  return {
    id: c.id,
    name: c.name,
    status: c.status,
    rebelPoints: c.rebelPoints,
    imperialPoints: c.imperialPoints,
    completedArcs: c.completedArcs.length,
    totalArcs,
    updatedAt: c.updatedAt,
  };
}

/**
 * `totalArcs` is the count of arcs this campaign was created with — needed
 * for progress display ("3 of 5"). For now, derived as
 * `deck.length + completedArcs.length` since deck always contains active
 * arc heads and completedArcs holds discarded ones. Pre-intro state
 * (deck = [intro]) shows 1/1 which is fine.
 */
function totalArcsFor(c: Campaign): number {
  return c.deck.length + c.completedArcs.length;
}

export const localStorageCampaignStore: CampaignStore = {
  list(): Promise<readonly CampaignSummary[]> {
    const state = loadRaw();
    const summaries = Object.values(state.campaigns)
      .map((c) => summarize(c, totalArcsFor(c)))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    return Promise.resolve(summaries);
  },

  load(id: string): Promise<Campaign | null> {
    const state = loadRaw();
    return Promise.resolve(state.campaigns[id] ?? null);
  },

  save(campaign: Campaign): Promise<void> {
    const state = loadRaw();
    state.campaigns[campaign.id] = { ...campaign, updatedAt: Date.now() };
    writeRaw(state);
    return Promise.resolve();
  },

  delete(id: string): Promise<void> {
    const state = loadRaw();
    if (id in state.campaigns) {
      const next = Object.fromEntries(
        Object.entries(state.campaigns).filter(([k]) => k !== id),
      );
      writeRaw({ ...state, campaigns: next });
    }
    return Promise.resolve();
  },
};
