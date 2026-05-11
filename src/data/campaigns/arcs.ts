/**
 * Story-arc registry.
 *
 * Five main story arcs plus the introductory single-mission arc. The last
 * mission of each arc is the Campaign Victory Point opportunity (resolved
 * via the `arcDiscard` outcome).
 *
 * Mission progression within an arc is driven by `Outcome.next.arcLink`,
 * not by the order of `missionIds` here. The order in the array is the
 * canonical "Part I → Part II → ..." reading sequence — used as the
 * default fallback if `startMissionId` is omitted.
 */

import type { CampaignArc } from '../scenarios/types';

export const introduction: CampaignArc = {
  id: 'intro',
  title: 'Welcome to the Aturi Cluster',
  missionIds: ['local-trouble'],
  startMissionId: 'local-trouble',
  isIntro: true,
};

export const captureOfficerArc: CampaignArc = {
  id: 'capture-officer',
  title: 'Capture Officer',
  missionIds: [
    'capture-officer-1',
    'capture-officer-2',
    'capture-officer-3',
  ],
  startMissionId: 'capture-officer-1',
};

export const refuelingStationArc: CampaignArc = {
  id: 'refueling-station',
  title: 'The Refueling Station',
  missionIds: [
    'refueling-station-1',
    'refueling-station-2',
    'refueling-station-3',
  ],
  startMissionId: 'refueling-station-1',
};

export const minefieldsArc: CampaignArc = {
  id: 'minefields',
  title: 'Minefields',
  missionIds: [
    'minefields-1',
    'minefields-2',
    'minefields-3',
  ],
  startMissionId: 'minefields-1',
};

export const chasingPhantomsArc: CampaignArc = {
  id: 'chasing-phantoms',
  title: 'Chasing Phantoms',
  missionIds: [
    'chasing-phantoms-1',
    'chasing-phantoms-2',
    'chasing-phantoms-3',
    'chasing-phantoms-4',
  ],
  startMissionId: 'chasing-phantoms-1',
};

export const defectionArc: CampaignArc = {
  id: 'defection',
  title: 'Defection',
  missionIds: [
    'defection-1',
    'defection-2',
    'defection-3',
  ],
  startMissionId: 'defection-1',
};

export const CAMPAIGN_ARCS: readonly CampaignArc[] = Object.freeze([
  introduction,
  captureOfficerArc,
  refuelingStationArc,
  minefieldsArc,
  chasingPhantomsArc,
  defectionArc,
]);

/** The five non-intro arcs that make up the main campaign deck. */
export const MAIN_CAMPAIGN_ARCS: readonly CampaignArc[] = Object.freeze(
  CAMPAIGN_ARCS.filter((a) => a.isIntro !== true),
);

export function findArc(id: string): CampaignArc | undefined {
  return CAMPAIGN_ARCS.find((c) => c.id === id);
}

export function findArcForMission(missionId: string): CampaignArc | undefined {
  return CAMPAIGN_ARCS.find((c) => c.missionIds.includes(missionId));
}
