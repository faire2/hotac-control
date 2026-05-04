import { useState } from 'react';
import type { ShipId } from '../data/Ships';
import { ShipPickerModal } from './ShipPickerModal';

interface Props {
  onAddShip: (shipType: ShipId) => void;
}

export function AddSquadronCard({ onAddShip }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <button
        type="button"
        className="addSquadronCard"
        aria-label="Add new squadron"
        onClick={() => setShowPicker(true)}
      >
        +
      </button>
      <ShipPickerModal
        show={showPicker}
        onHide={() => setShowPicker(false)}
        onSelect={onAddShip}
      />
    </>
  );
}
