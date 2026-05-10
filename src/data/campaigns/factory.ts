/**
 * Campaign factory + outcome resolver.
 *
 * Pure functions that produce / advance `Campaign` records. Kept separate
 * from the storage layer so they're trivially testable and the storage
 * impl stays focused on persistence.
 */

import type {
  Campaign,
  CampaignArc,
  DeckEntry,
  Outcome,
  ScenarioOutcomeKind,
} from '../scenarios/types';
import { MAIN_CAMPAIGN_ARCS, findArc, introduction } from './index';
import { STANDARD_MODELS } from './settings';

export interface NewCampaignOptions {
  name: string;
  includeIntro: boolean;
  /** Defaults to STANDARD_MODELS (own everything). */
  ownedModels?: readonly string[];
  /** Defaults to false. */
  lessRandomShips?: boolean;
  /**
   * Defaults to false (faithful draw — random mission from the deck).
   * Set true to let the player pick any deck card freely.
   */
  freePickFromDeck?: boolean;
  /** Subset of MAIN_CAMPAIGN_ARCS arc ids to include. Defaults to all. */
  includedArcIds?: readonly string[];
}

/** Create a fresh `Campaign` record ready to save. */
export function newCampaign(opts: NewCampaignOptions): Campaign {
  const now = Date.now();
  const id = crypto.randomUUID();

  const ownedModels = opts.ownedModels ?? STANDARD_MODELS;
  const arcIds = opts.includedArcIds ?? MAIN_CAMPAIGN_ARCS.map((a) => a.id);

  // Initial deck:
  //  - includeIntro=true  → deck contains only the intro arc head
  //  - includeIntro=false → deck contains heads of every included main arc
  const initialDeck: DeckEntry[] = opts.includeIntro
    ? [{ arcId: introduction.id, headMissionId: introduction.startMissionId ?? introduction.missionIds[0] }]
    : arcIds
        .map((id) => findArc(id))
        .filter((a): a is CampaignArc => a !== undefined)
        .map((a) => ({ arcId: a.id, headMissionId: a.startMissionId ?? a.missionIds[0] }));

  return {
    id,
    name: opts.name,
    includeIntro: opts.includeIntro,
    ownedModels,
    lessRandomShips: opts.lessRandomShips ?? false,
    freePickFromDeck: opts.freePickFromDeck ?? false,
    introducedShipTypes: [],
    deck: initialDeck,
    completedArcs: [],
    currentMissionId: null,
    history: [],
    rebelPoints: 0,
    imperialPoints: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Apply a mission outcome to the campaign, returning the new state.
 * Pure — does not mutate `campaign`.
 *
 * Handles all `OutcomeNext` kinds:
 *   arcLink       — advance the arc's head to the named mission.
 *   arcDiscard    — remove the arc from the deck (arc complete).
 *   reshuffle     — deck unchanged.
 *   replay        — deck unchanged (intro defeat path).
 *   campaignStart — replace intro arc with the main arcs' heads.
 *   campaignEnd   — terminal: status = imperialVictory.
 *
 * Implicit rebel-victory: if the deck becomes empty after `arcDiscard`,
 * status becomes `rebelVictory`.
 */
export function applyOutcome(
  campaign: Campaign,
  missionId: string,
  result: ScenarioOutcomeKind,
  outcome: Outcome,
  shipsToIntroduce: readonly Campaign['introducedShipTypes'][number][] = [],
): Campaign {
  const next = outcome.next;
  const now = Date.now();

  // 1. Append history + accumulate points + introduce ships (rebel-victory only side).
  const history: Campaign['history'] = [
    ...campaign.history,
    {
      missionId,
      result,
      rebelPoints: outcome.rebelPoints ?? 0,
      imperialPoints: outcome.imperialPoints ?? 0,
      resolvedAt: now,
    },
  ];

  const introducedShipTypes =
    result === 'victory' && shipsToIntroduce.length > 0
      ? Array.from(new Set([...campaign.introducedShipTypes, ...shipsToIntroduce]))
      : campaign.introducedShipTypes;

  let deck = campaign.deck;
  let completedArcs = campaign.completedArcs;
  let status: Campaign['status'] = campaign.status;

  // 2. Apply the deck mutation.
  switch (next.kind) {
    case 'arcLink': {
      // Advance the arc that contains the just-played mission to the named next mission.
      deck = deck.map((entry) =>
        entry.headMissionId === missionId
          ? { ...entry, headMissionId: next.missionId }
          : entry,
      );
      break;
    }
    case 'arcDiscard': {
      // Remove the arc whose head matched this mission.
      const removedArc = deck.find((entry) => entry.headMissionId === missionId);
      deck = deck.filter((entry) => entry.headMissionId !== missionId);
      if (removedArc) {
        completedArcs = [...completedArcs, removedArc.arcId];
      }
      // Implicit Rebel Campaign Victory: deck is empty after this discard.
      if (deck.length === 0) {
        status = 'rebelVictory';
      }
      break;
    }
    case 'reshuffle':
    case 'replay': {
      // No deck change (replay is intro-only and behaves as reshuffle for deck purposes).
      break;
    }
    case 'campaignStart': {
      // Discard the intro arc, populate the main deck.
      const introEntry = deck.find((e) => e.arcId === introduction.id);
      const withoutIntro = deck.filter((e) => e.arcId !== introduction.id);
      const mainHeads = MAIN_CAMPAIGN_ARCS.map((a) => ({
        arcId: a.id,
        headMissionId: a.startMissionId ?? a.missionIds[0],
      }));
      deck = [...withoutIntro, ...mainHeads];
      if (introEntry) {
        completedArcs = [...completedArcs, introduction.id];
      }
      break;
    }
    case 'campaignEnd': {
      status = 'imperialVictory';
      break;
    }
  }

  return {
    ...campaign,
    history,
    introducedShipTypes,
    deck,
    completedArcs,
    currentMissionId: null,
    rebelPoints: campaign.rebelPoints + (outcome.rebelPoints ?? 0),
    imperialPoints: campaign.imperialPoints + (outcome.imperialPoints ?? 0),
    status,
    updatedAt: now,
  };
}

/** Touch `updatedAt` and bump `currentMissionId`. Used when the player picks a mission from the deck. */
export function pickMission(campaign: Campaign, missionId: string): Campaign {
  return { ...campaign, currentMissionId: missionId, updatedAt: Date.now() };
}

// Exported once, here, since the type isn't generally useful elsewhere.
export type { ScenarioOutcomeKind } from '../scenarios/types';
