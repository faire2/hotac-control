import { useState } from 'react';
import type { Campaign } from '../../data/scenarios/types';
import { findScenario } from '../../data/scenarios/registry';
import { findArc } from '../../data/campaigns/arcs';

interface Props {
  campaign: Campaign;
  onPickMission: (missionId: string) => void;
}

/**
 * Between-missions screen for an active campaign.
 *
 * Two layouts driven by `campaign.freePickFromDeck`:
 *
 * - **Random draw** (default, faithful to printed rules): a face-down
 *   deck with a "Draw next mission" button. The button picks a random
 *   arc head and routes straight to its briefing — no preview.
 *
 * - **Free pick** (campaign-setting opt-in): every arc head shown
 *   face-up; the player clicks whichever they want.
 *
 * If the deck is empty, the campaign is finished — caller should not
 * route here, but render a fallback message just in case.
 */
export function DeckPickView({ campaign, onPickMission }: Props) {
  if (campaign.deck.length === 0) {
    return (
      <div className="container py-4">
        <h3>Campaign complete</h3>
        <p className="text-muted">
          {campaign.status === 'rebelVictory'
            ? 'All arcs discarded. Rebel campaign victory.'
            : campaign.status === 'imperialVictory'
              ? 'Imperial campaign victory.'
              : 'No active arcs left in the deck.'}
        </p>
      </div>
    );
  }

  return campaign.freePickFromDeck ? (
    <FreePickDeck campaign={campaign} onPickMission={onPickMission} />
  ) : (
    <RandomDrawDeck campaign={campaign} onPickMission={onPickMission} />
  );
}

function FreePickDeck({ campaign, onPickMission }: Props) {
  return (
    <div className="container py-4">
      <h3>Pick the next mission</h3>
      <p className="text-muted small mb-3">
        Free-pick mode: choose any active arc head. Mission outcomes
        decide what happens to the deck (advance, discard, reshuffle).
      </p>
      <div className="row">
        {campaign.deck.map((entry) => {
          const arc = findArc(entry.arcId);
          const mission = findScenario(entry.headMissionId);
          if (!arc || !mission) return null;
          const playable = arc.missionIds.indexOf(mission.id) + 1;
          const total = arc.missionIds.length;
          return (
            <div key={entry.arcId} className="col-md-6 mb-3">
              <button
                type="button"
                className="btn btn-outline-primary text-left w-100 p-3"
                onClick={() => { onPickMission(mission.id); }}
              >
                <div className="small text-muted">
                  {arc.title} · part {playable.toString()} of {total.toString()}
                </div>
                <div className="font-weight-bold">{mission.title}</div>
                {mission.subtitle ? (
                  <div className="small text-muted">{mission.subtitle}</div>
                ) : null}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RandomDrawDeck({ campaign, onPickMission }: Props) {
  const [drawn, setDrawn] = useState<{ arcTitle: string; missionId: string; missionTitle: string; subtitle?: string; part: number; total: number } | null>(null);

  function draw() {
    const idx = Math.floor(Math.random() * campaign.deck.length);
    const entry = campaign.deck[idx];
    const arc = findArc(entry.arcId);
    const mission = findScenario(entry.headMissionId);
    if (!arc || !mission) return;
    setDrawn({
      arcTitle: arc.title,
      missionId: mission.id,
      missionTitle: mission.title,
      subtitle: mission.subtitle,
      part: arc.missionIds.indexOf(mission.id) + 1,
      total: arc.missionIds.length,
    });
  }

  if (drawn !== null) {
    return (
      <div className="container py-4">
        <h3>Mission drawn</h3>
        <div className="card mt-3 mb-3 p-3" style={{ maxWidth: 600 }}>
          <div className="small text-muted">
            {drawn.arcTitle} · part {drawn.part.toString()} of {drawn.total.toString()}
          </div>
          <div className="h4 mb-1">{drawn.missionTitle}</div>
          {drawn.subtitle ? (
            <div className="small text-muted mb-2">{drawn.subtitle}</div>
          ) : null}
        </div>
        <button
          type="button"
          className="btn btn-primary mr-2"
          onClick={() => { onPickMission(drawn.missionId); }}
        >
          Start briefing
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => { setDrawn(null); }}
        >
          Discard &amp; redraw
        </button>
        <p className="text-muted small mt-2 mb-0">
          (Redraw is offered for convenience — strict rules don&apos;t allow it.)
        </p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h3>Draw the next mission</h3>
      <p className="text-muted small mb-3">
        {campaign.deck.length.toString()} arc{campaign.deck.length === 1 ? '' : 's'} in the deck.
        Click Draw to reveal the next mission.
      </p>
      <button type="button" className="btn btn-primary btn-lg" onClick={draw}>
        Draw next mission
      </button>
    </div>
  );
}
