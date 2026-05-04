import Modal from 'react-bootstrap/Modal';
import { Ships } from '../data/Ships';
import type { ShipId } from '../data/Ships';

interface Props {
  show: boolean;
  onHide: () => void;
  onSelect: (shipType: ShipId) => void;
}

export function ShipPickerModal({ show, onHide, onSelect }: Props) {
  const ships = Object.keys(Ships) as ShipId[];

  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Add squadron</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-column">
          {ships.map((id) => (
            <button
              key={id}
              type="button"
              className="btn btn-outline-primary text-left mb-2"
              onClick={() => {
                onSelect(id);
                onHide();
              }}
            >
              {Ships[id].name}
            </button>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}
