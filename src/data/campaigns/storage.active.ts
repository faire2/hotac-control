/**
 * Single import point for the active `CampaignStore` implementation.
 *
 * Today: localStorage. When the Neon-backed REST impl lands, change this
 * file and only this file — every consumer imports `campaignStore` from
 * here, never the concrete backend module.
 */

import type { CampaignStore } from './storage';
import { localStorageCampaignStore } from './storage.localStorage';

export const campaignStore: CampaignStore = localStorageCampaignStore;
