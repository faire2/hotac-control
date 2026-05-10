/**
 * Top-level application mode.
 *
 * Four kinds: free play (no scenario, manual squadron building), scenario
 * only (a single mission run, no campaign progression), and two campaign
 * variants — `campaign` while at the deck-pick screen (no active mission)
 * and `campaign` while in a mission (briefing/active/ended).
 *
 * The two campaign variants share `kind: 'campaign'` and `campaignId`, but
 * differ on `phase` (`'deckPick'` vs `'mission'`) and on whether a mission
 * is attached. TypeScript narrowing on `phase` lets call sites read
 * `mode.mission` directly without `null` checks once they've branched.
 *
 * Modal overlays — main-menu dropdown, New-game picker, Open-campaign
 * browser — are NOT separate AppModes. They're rendered on top of the
 * current mode and dismissed independently.
 */

export type AppMode =
  | { kind: 'freePlay' }
  | { kind: 'scenarioOnly'; mission: MissionState }
  | { kind: 'campaign'; campaignId: string; phase: 'deckPick'; mission: null }
  | { kind: 'campaign'; campaignId: string; phase: 'mission'; mission: MissionState };

export interface MissionState {
  scenarioId: string;
  phase: MissionPhase;
}

export type MissionPhase =
  | { kind: 'briefing'; briefingMode: 'start' | 'view' }
  | { kind: 'active'; round: number }
  | { kind: 'ended' };

/** Default landing mode. */
export const FREE_PLAY: AppMode = { kind: 'freePlay' };

// ---- Helpers --------------------------------------------------------------

/** The mission currently being briefed/played/ended, or null if not in a mission. */
export function getActiveMission(mode: AppMode): MissionState | null {
  if (mode.kind === 'freePlay') return null;
  return mode.mission;
}

/** Scenario id of the active mission, or null if not in one. */
export function getActiveScenarioId(mode: AppMode): string | null {
  return getActiveMission(mode)?.scenarioId ?? null;
}

/** Active round counter; 1 outside the `active` phase. */
export function getActiveRound(mode: AppMode): number {
  const m = getActiveMission(mode);
  return m?.phase.kind === 'active' ? m.phase.round : 1;
}

/** Campaign id if in any campaign variant, otherwise null. */
export function getCampaignId(mode: AppMode): string | null {
  return mode.kind === 'campaign' ? mode.campaignId : null;
}

/**
 * Scenario id whose briefing should be shown — either the pre-start briefing
 * (`mission.phase.kind === 'briefing'`) or the during-play overlay
 * (`overlayOpen && active`).
 */
export function getBriefingScenarioId(mode: AppMode, overlayOpen: boolean): string | null {
  const m = getActiveMission(mode);
  if (!m) return null;
  if (m.phase.kind === 'briefing') return m.scenarioId;
  if (overlayOpen && m.phase.kind === 'active') return m.scenarioId;
  return null;
}

/**
 * Briefing mode: 'start' for the pre-start briefing, 'view' otherwise
 * (during-play overlay). Defaults to 'view' if no mission active — caller
 * should also gate on `getBriefingScenarioId`.
 */
export function getBriefingMode(mode: AppMode): 'start' | 'view' {
  const m = getActiveMission(mode);
  if (m?.phase.kind === 'briefing') return m.phase.briefingMode;
  return 'view';
}

/**
 * Return a new mode with the active mission's round set to `round`.
 * No-op if no mission is active or the mission isn't in `active` phase.
 */
export function bumpRound(mode: AppMode, round: number): AppMode {
  // Bail on the variants that don't carry an active mission. After these
  // two early returns, TS knows `mode.mission` exists and is non-null.
  if (mode.kind === 'freePlay') return mode;
  if (mode.kind === 'campaign' && mode.phase === 'deckPick') return mode;
  if (mode.mission.phase.kind !== 'active') return mode;
  const updatedMission: MissionState = {
    ...mode.mission,
    phase: { kind: 'active', round },
  };
  return { ...mode, mission: updatedMission };
}
