import Modal from 'react-bootstrap/Modal';
import type { ShipId } from '../../data/Ships';

export interface Arrival {
  /** Scenario squad name (Alpha, Beta, ...) */
  squadName: string;
  shipType: ShipId;
  shipName: string;
  count: number;
  isElite: boolean;
  /** Pre-resolved approach label (vector edge / map letter / "Bay 1" / "?"). */
  approach: string;
  /** Rebel player number this arrival hunts (1-based), if assigned. */
  huntsPlayerIndex?: number;
}

interface Props {
  arrivals: readonly Arrival[];
  onClose: () => void;
}

function pluralize(name: string, count: number): string {
  return count === 1 ? name : `${name}s`;
}

export function ArrivalNotificationModal({ arrivals, onClose }: Props) {
  const show = arrivals.length > 0;
  return (
    <Modal show={show} onHide={onClose} centered size="sm">
      <Modal.Header closeButton className="scenarioModalHeader">
        <Modal.Title>New ships arrived!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul className="mb-0 pl-3">
          {arrivals.map((a, i) => (
            <li key={i}>
              <strong>{a.count}× {pluralize(a.shipName, a.count)}</strong>
              {a.isElite ? <span className="badge badge-warning ml-1">Elite</span> : null}
              {' '}labelled as <strong>{a.squadName}</strong>
              {' '}approaching from <strong>{a.approach}</strong>
              {a.huntsPlayerIndex !== undefined ? (
                <>{' '}— hunts <strong>player {a.huntsPlayerIndex.toString()}</strong></>
              ) : null}
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Acknowledge
        </button>
      </Modal.Footer>
    </Modal>
  );
}
