/**
 * Browse every authored mission map on one page.
 *
 * One card per `Scenario`, grouped by `CampaignArc`. Cards render a
 * 4-player `<MissionMap>` thumbnail (or the ASCII `mapDiagram` as a
 * fallback for scenarios without a `map` set). Clicking a card hands
 * the scenario id to the parent, which opens the briefing modal in
 * `view` mode on top of this one.
 *
 * Decoupled from `AppMode`: open/close is a single boolean. Always
 * available from the menu, in every mode, without touching campaign
 * state.
 */

import Modal from 'react-bootstrap/Modal';
import { CAMPAIGN_ARCS } from '../../data/campaigns/arcs';
import { findScenario } from '../../data/scenarios/registry';
import type { Scenario } from '../../data/scenarios/types';
import { MissionMap } from './MissionMap';
import './MissionMapsGalleryModal.css';

interface Props {
  show: boolean;
  onHide: () => void;
  onPick: (scenarioId: string) => void;
}

const THUMB_PLAYER_COUNT = 4;

export function MissionMapsGalleryModal({ show, onHide, onPick }: Props) {
  return (
    <Modal show={show} onHide={onHide} centered scrollable size="xl">
      <Modal.Header closeButton className="scenarioModalHeader">
        <Modal.Title>Mission maps</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {CAMPAIGN_ARCS.map((arc) => {
          const scenarios = arc.missionIds
            .map((id) => findScenario(id))
            .filter((s): s is Scenario => s !== undefined);
          if (scenarios.length === 0) return null;
          return (
            <section key={arc.id} className="missionMapsArc">
              <h5 className="missionMapsArcTitle">{arc.title}</h5>
              <div className="missionMapsGrid">
                {scenarios.map((s) => (
                  <MissionCard
                    key={s.id}
                    scenario={s}
                    arcTitle={arc.title}
                    onClick={() => { onPick(s.id); }}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onHide}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
}

function MissionCard({
  scenario,
  arcTitle,
  onClick,
}: {
  scenario: Scenario;
  arcTitle: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="missionMapsCard" onClick={onClick}>
      <div className="missionMapsCardHead">
        <span className="missionMapsCardTitle">
          {scenario.title}
          {scenario.subtitle ? <span className="missionMapsCardSubtitle"> — {scenario.subtitle}</span> : null}
        </span>
        <span className="missionMapsCardArc">{arcTitle}</span>
      </div>
      <div className="missionMapsCardBody">
        {scenario.map ? (
          <MissionMap scenario={scenario} playerCount={THUMB_PLAYER_COUNT} />
        ) : (
          <pre className="missionMapsAsciiFallback">{scenario.mapDiagram}</pre>
        )}
      </div>
    </button>
  );
}
