import { Squad } from './Squad';
import { AddSquadronCard } from '../AddSquadronCard';
import type { Squadron } from '../../context/Contexts';
import type { ShipId } from '../../data/Ships';

interface Props {
  squadrons: readonly Squadron[];
  onAddShip: (shipType: ShipId) => void;
}

export default function SquadGenerator({ squadrons, onAddShip }: Props) {
  return (
    <div className="row shipStats">
      {squadrons.map((squad, squadId) => (
        <div key={squad.id} className="col-lg-3 col-md-4 pl-5">
          <Squad squad={squad} squadId={squadId} />
        </div>
      ))}
      <div className="col-lg-3 col-md-4 pl-5">
        <AddSquadronCard onAddShip={onAddShip} />
      </div>
    </div>
  );
}
