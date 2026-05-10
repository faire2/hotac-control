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

  return (
    <div className="shipsBlock">
      <ShipsHeader />
      {squadron.ships.map((ship, keyIndex) => (
        <Variables key={keyIndex} keyIndex={keyIndex} ship={ship} squadId={squadId} />
      ))}
      <div className="d-flex flex-nowrap justify-content-between mt-2">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => { shipCtx.handleAddShip(squadId); }}
        >
          Add ship
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => { globalCtx.handleSquadRemoval(squadId); }}
        >
          Remove squad
        </button>
      </div>
    </div>
  );
}

const ShipsHeader = () => (
  <div className="d-flex flex-nowrap align-items-center shipRow shipRowHeader">
    <div className="shipCellId"><strong>ID</strong></div>
    <div className="shipCellCounter"><strong>Shields</strong></div>
    <div className="shipCellCounter"><strong>Hull</strong></div>
    <div className="shipCellRemove" />
  </div>
);
