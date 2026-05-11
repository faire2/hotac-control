import Modal from 'react-bootstrap/Modal';
import type { Outcome, OutcomeNext, Scenario } from '../../data/scenarios/types';
import { findScenario } from '../../data/scenarios/registry';

export type EndOutcomeKind = 'victory' | 'defeat';

interface Props {
  show: boolean;
  scenario: Scenario;
  /** Called when the player picks Rebel victory or Imperial victory. */
  onResolve: (kind: EndOutcomeKind) => void;
  /** Cancel without recording an outcome (returns to free play). */
  onClose: () => void;
}

function describeNext(next: OutcomeNext): string {
  switch (next.kind) {
    case 'arcLink': {
      const target = findScenario(next.missionId);
      return target ? `Arc continues: ${target.title}` : `Arc continues: ${next.missionId}`;
    }
    case 'arcDiscard':
      return 'Arc complete — removed from the deck';
    case 'reshuffle':
      return 'Mission stays — deck reshuffles';
    case 'replay':
      return 'Replay this mission';
    case 'campaignStart':
      return 'Begin the full campaign';
    case 'campaignEnd':
      return 'Campaign ends';
    default: {
      const _exhaustive: never = next;
      return _exhaustive;
    }
  }
}

function OutcomePanel({
  label,
  outcome,
  buttonLabel,
  buttonClass,
  onClick,
}: {
  label: string;
  outcome: Outcome;
  buttonLabel: string;
  buttonClass: string;
  onClick: () => void;
}) {
  const next = describeNext(outcome.next);
  return (
    <div className="mb-3">
      <strong>{label}:</strong>
      <p className="mb-1">{outcome.text}</p>
      <div className="text-muted small mb-2">
        <span>{next}</span>
        {outcome.rebelPoints ? (
          <span className="badge badge-success ml-2">
            +{outcome.rebelPoints.toString()} Rebel VP
          </span>
        ) : null}
        {outcome.imperialPoints ? (
          <span className="badge badge-danger ml-2">
            +{outcome.imperialPoints.toString()} Imperial VP
          </span>
        ) : null}
      </div>
      <button type="button" className={`btn btn-sm ${buttonClass}`} onClick={onClick}>
        {buttonLabel}
      </button>
    </div>
  );
}

export function EndScenarioModal({ show, scenario, onResolve, onClose }: Props) {
  return (
    <Modal show={show} onHide={onClose} centered scrollable size="lg">
      <Modal.Header closeButton className="scenarioModalHeader">
        <Modal.Title>
          {scenario.title} — Mission End
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Mission Objectives</h5>
        <ul>
          {scenario.objectives.map((obj, i) => (
            <li key={i}>
              <strong>{obj.kind === 'primary' ? 'Primary' : 'Bonus'}:</strong> {obj.text}
              {obj.reward ? <span className="badge badge-xp ml-2">{obj.reward}</span> : null}
            </li>
          ))}
        </ul>

        <h5 className="mt-4">Outcomes</h5>
        <OutcomePanel
          label="Rebel Victory"
          outcome={scenario.victory}
          buttonLabel="Rebel victory"
          buttonClass="btn-success"
          onClick={() => { onResolve('victory'); }}
        />
        <OutcomePanel
          label="Imperial Victory"
          outcome={scenario.defeat}
          buttonLabel="Imperial victory"
          buttonClass="btn-danger"
          onClick={() => { onResolve('defeat'); }}
        />
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel — return to free play
        </button>
      </Modal.Footer>
    </Modal>
  );
}
