import { Ships } from '../../data/Ships';
import type { ShipId } from '../../data/Ships';
import type { UpgradeRow } from '../../data/UpgradeRow';

interface Props {
  shipType: ShipId;
  upgrades: readonly UpgradeRow[];
}

export const SquadStats = ({ shipType, upgrades }: Props) => {
  const ship = Ships[shipType];
  const lastRow = upgrades[upgrades.length - 1];
  const initiative = lastRow?.initiative ?? ship.initiative;
  const xp = xpForRow(lastRow);

  return (
    <div>
      <div className="row backgroundBlue">
        <div className="col-3"><h3>Init.:</h3></div>
        <div className="col-3"><h3>Attack:</h3></div>
        <div className="col-3"><h3>Agility:</h3></div>
        <div className="col-3"><h3>XP:</h3></div>
      </div>
      <div className="row text-center ship-stats">
        <div className="col-3"><div>{initiative}</div></div>
        <div className="col-3">
          {ship.attack.map((a, index) => (
            <span key={index}>
              {a.attack}{a.damage}
            </span>
          ))}
        </div>
        <div className="col-3"><div>{ship.agility}</div></div>
        <div className="col-3"><div>{xp}</div></div>
      </div>
    </div>
  );
};

function xpForRow(row: UpgradeRow | undefined): number | string {
  if (!row) return 0;
  if (row.source === 'COMMUNITY') return row.xpCost;
  if (row.source === 'FGA') return row.tier;
  return '—'; // Anderson rows have no XP cost (initiative-gated only)
}
