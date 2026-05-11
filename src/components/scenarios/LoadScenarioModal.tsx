import Modal from 'react-bootstrap/Modal';
import { SCENARIOS } from '../../data/scenarios/registry';
import { requiredModelsFor } from '../../data/scenarios/requiredModels';
import { ownsRequiredModels } from '../../data/campaigns/settings';

interface Props {
  show: boolean;
  ownedModels: readonly string[];
  onHide: () => void;
  onSelect: (scenarioId: string) => void;
}

export function LoadScenarioModal({ show, ownedModels, onHide, onSelect }: Props) {
  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Load scenario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-column">
          {SCENARIOS.map((s) => {
            const required = requiredModelsFor(s);
            const playable = ownsRequiredModels(required, ownedModels);
            const missing = required.filter(
              (r) => !ownedModels.some((o) => o.toLowerCase() === r.toLowerCase()),
            );
            return (
              <button
                key={s.id}
                type="button"
                className={`btn text-left mb-2 ${playable ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
                disabled={!playable}
                onClick={() => {
                  onSelect(s.id);
                  onHide();
                }}
              >
                <div className="font-weight-bold">{s.title}</div>
                {s.subtitle ? <div className="small text-muted">{s.subtitle}</div> : null}
                {!playable && missing.length > 0 ? (
                  <div className="small text-danger">
                    Requires: {missing.join(', ')}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
}
