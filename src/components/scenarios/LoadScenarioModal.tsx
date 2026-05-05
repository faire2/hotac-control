import Modal from 'react-bootstrap/Modal';
import { SCENARIOS } from '../../data/scenarios';

interface Props {
  show: boolean;
  onHide: () => void;
  onSelect: (scenarioId: string) => void;
}

export function LoadScenarioModal({ show, onHide, onSelect }: Props) {
  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Load scenario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-column">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              className="btn btn-outline-primary text-left mb-2"
              onClick={() => {
                onSelect(s.id);
                onHide();
              }}
            >
              <div className="font-weight-bold">{s.title}</div>
              {s.subtitle ? <div className="small text-muted">{s.subtitle}</div> : null}
            </button>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}
