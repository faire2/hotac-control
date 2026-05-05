import Modal from 'react-bootstrap/Modal';
import type { Scenario } from '../../data/scenarios/types';

interface Props {
  show: boolean;
  scenario: Scenario;
  onClose: () => void;
}

export function EndScenarioModal({ show, scenario, onClose }: Props) {
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
        <div className="mb-3">
          <strong>Rebel Victory:</strong>
          <p className="mb-0">{scenario.victory.rebel}</p>
        </div>
        <div>
          <strong>Imperial Victory:</strong>
          <p className="mb-0">{scenario.victory.imperial}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
}
