import Modal from 'react-bootstrap/Modal';

interface Props {
  show: boolean;
  onPickCampaign: () => void;
  onPickScenario: () => void;
  onPickFreePlay: () => void;
  onClose: () => void;
}

/**
 * Three-option picker shown when the player selects Menu → New.
 *
 * - **Campaign**: routes to the Campaign Setup flow (name + arcs +
 *   exclusions). Played missions are tracked, points accumulate, deck
 *   advances via Outcome.next.
 * - **Scenario**: routes to the existing single-scenario picker. Plays
 *   one mission at a time, no campaign progression.
 * - **Free Play**: ad-hoc squadron building, no scenario, no progression.
 *   Default landing mode.
 */
export function NewGamePickerModal({
  show,
  onPickCampaign,
  onPickScenario,
  onPickFreePlay,
  onClose,
}: Props) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>New game</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted small mb-3">
          Pick how you want to play. You can switch any time via Menu.
        </p>
        <div className="d-flex flex-column">
          <button
            type="button"
            className="btn btn-outline-primary text-left mb-2"
            onClick={() => { onPickCampaign(); onClose(); }}
          >
            <div className="font-weight-bold">Campaign</div>
            <div className="small text-muted">
              Run a full campaign with arc progression, points, and deck mechanics.
            </div>
          </button>
          <button
            type="button"
            className="btn btn-outline-primary text-left mb-2"
            onClick={() => { onPickScenario(); onClose(); }}
          >
            <div className="font-weight-bold">Scenario</div>
            <div className="small text-muted">
              Play a single mission with no campaign tracking.
            </div>
          </button>
          <button
            type="button"
            className="btn btn-outline-primary text-left"
            onClick={() => { onPickFreePlay(); onClose(); }}
          >
            <div className="font-weight-bold">Free Play</div>
            <div className="small text-muted">
              Build squadrons manually for AI testing.
            </div>
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
