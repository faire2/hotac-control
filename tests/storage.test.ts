import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { localStorageCampaignStore } from '../src/data/campaigns/storage.localStorage';
import { newCampaign } from '../src/data/campaigns/factory';

// Minimal localStorage shim for the Node test environment.
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
  clear(): void {
    this.data.clear();
  }
}

beforeEach(() => {
  (globalThis as { localStorage?: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
});

afterEach(() => {
  (globalThis as { localStorage?: Storage }).localStorage = undefined;
});

describe('localStorageCampaignStore', () => {
  it('returns empty list on first read', async () => {
    expect(await localStorageCampaignStore.list()).toEqual([]);
  });

  it('round-trips a saved campaign', async () => {
    const campaign = newCampaign({ name: 'Test run', includeIntro: true });
    await localStorageCampaignStore.save(campaign);
    const loaded = await localStorageCampaignStore.load(campaign.id);
    expect(loaded?.id).toBe(campaign.id);
    expect(loaded?.name).toBe('Test run');
    expect(loaded?.deck).toHaveLength(1);
  });

  it('returns null for unknown id', async () => {
    expect(await localStorageCampaignStore.load('does-not-exist')).toBeNull();
  });

  it('list summaries reflect saved campaigns sorted by updatedAt desc', async () => {
    const a = newCampaign({ name: 'First', includeIntro: false });
    await localStorageCampaignStore.save(a);
    // Bump time so the second save's updatedAt is strictly later.
    await new Promise((r) => setTimeout(r, 5));
    const b = newCampaign({ name: 'Second', includeIntro: false });
    await localStorageCampaignStore.save(b);

    const list = await localStorageCampaignStore.list();
    expect(list.map((s) => s.name)).toEqual(['Second', 'First']);
    expect(list[0].status).toBe('active');
  });

  it('delete is idempotent and removes from list', async () => {
    const c = newCampaign({ name: 'Doomed', includeIntro: false });
    await localStorageCampaignStore.save(c);
    expect((await localStorageCampaignStore.list()).length).toBe(1);

    await localStorageCampaignStore.delete(c.id);
    expect(await localStorageCampaignStore.load(c.id)).toBeNull();
    expect(await localStorageCampaignStore.list()).toEqual([]);

    // Idempotent — delete on missing id is a no-op.
    await localStorageCampaignStore.delete(c.id);
    expect(await localStorageCampaignStore.list()).toEqual([]);
  });

  it('save updates updatedAt and preserves other fields', async () => {
    const c = newCampaign({ name: 'Mutating', includeIntro: false });
    await localStorageCampaignStore.save(c);
    const first = await localStorageCampaignStore.load(c.id);
    await new Promise((r) => setTimeout(r, 5));

    const mutated = { ...c, rebelPoints: 3 };
    await localStorageCampaignStore.save(mutated);
    const second = await localStorageCampaignStore.load(c.id);

    expect(second?.rebelPoints).toBe(3);
    expect((second?.updatedAt ?? 0)).toBeGreaterThanOrEqual(first?.updatedAt ?? 0);
    expect(second?.id).toBe(c.id);
  });

  it('survives an unparseable raw blob (treats as empty)', async () => {
    localStorage.setItem('hotac.v1', '{not json');
    expect(await localStorageCampaignStore.list()).toEqual([]);
  });

  it('discards data with an unknown version', async () => {
    localStorage.setItem(
      'hotac.v1',
      JSON.stringify({ version: 99, campaigns: { foo: { id: 'foo' } } }),
    );
    expect(await localStorageCampaignStore.list()).toEqual([]);
  });
});
