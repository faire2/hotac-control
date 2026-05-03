import { useContext } from 'react';
import Variables from './Variables';
import { GlobalSquadsValuesContext, ShipHandlingContext } from '../../../context/Contexts';

interface Props {
  squadId: number;
}

export function ShipsVariables({ squadId }: Props) {
  const shipCtx = useContext(ShipHandlingContext);
  const globalCtx = useContext(GlobalSquadsValuesContext);
  if (!shipCtx || !globalCtx) return null;
  const squadron = shipCtx.squadrons[squadId];
  if (!squadron) return null;

  return (
    <div>
      <ShipsHeader />
      {squadron.ships.map((ship, keyIndex) => (
        <Variables key={keyIndex} keyIndex={keyIndex} ship={ship} squadId={squadId} />
      ))}
      <br />
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={() => shipCtx.handleAddShip(squadId)}
      >
        Add a ship to squadron
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm btnRemoveShip"
        onClick={() => globalCtx.handleSquadRemoval(squadId)}
      >
        Remove whole squadron
      </button>
    </div>
  );
}

const ShipsHeader = () => (
  <div>
    <div className="row">
      <div className="col-3"><h3>ID:</h3></div>
      <div className="col-4"><h3>Shields:</h3></div>
      <div className="col-4"><h3>Hull:</h3></div>
      <div className="col-1" />
    </div>
  </div>
);
