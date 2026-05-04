import { Squad } from './Squad';
import type { Squadron } from '../../context/Contexts';

interface Props {
  squadrons: readonly Squadron[];
}

export default function SquadGenerator({ squadrons }: Props) {
  return (
    <div className="shipStats">
      {squadrons.map((squad, squadId) => (
        <div key={squad.id} className="squadCol pl-5">
          <Squad squad={squad} squadId={squadId} />
        </div>
      ))}
    </div>
  );
}
