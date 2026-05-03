import { Squad } from './Squad';
import type { Squadron } from '../../context/Contexts';

interface Props {
  squadrons: readonly Squadron[];
}

export default function SquadGenerator({ squadrons }: Props) {
  return (
    <div className="row shipStats">
      {squadrons.map((squad, squadId) => (
        <div key={squad.id} className="col-lg-3 col-md-4 pl-5">
          <Squad squad={squad} squadId={squadId} />
        </div>
      ))}
    </div>
  );
}
