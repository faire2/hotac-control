import type { ReactNode } from 'react';
import { Ships } from '../../data/Ships';
import type { ShipId } from '../../data/Ships';
import type { UpgradeRow } from '../../data/UpgradeRow';

interface Props {
  shipType: ShipId;
  upgrades: readonly UpgradeRow[];
  headerExtra?: ReactNode;
}

export const SquadStats = ({ shipType, upgrades, headerExtra }: Props) => {
  const ship = Ships[shipType];
  const lastRow = upgrades.at(-1);
  const initiative = lastRow?.initiative ?? ship.initiative;
  const xp = xpForRow(lastRow);

  return (
    <div className="squadStats">
      <div className="statsHeader">
        <div className="statCell">Init</div>
        <div className="statCell">Attack</div>
        <div className="statCell">Agility</div>
        <div className="statCell">XP</div>
        {headerExtra && <div className="statCell statCellAi">{headerExtra}</div>}
      </div>
      <div className="statsValues">
        <div className="statCell">{initiative}</div>
        <div className="statCell">
          {ship.attack.map((a, index) => (
            <span key={index}>
              {a.attack}{a.damage}
            </span>
          ))}
        </div>
        <div className="statCell">{ship.agility}</div>
        <div className="statCell">{xp}</div>
        {headerExtra && <div className="statCell statCellAi" />}
      </div>
    </div>
  );
};

function xpForRow(row: UpgradeRow | undefined): number | string {
  if (!row) return 0;
  if (row.source === 'COMMUNITY') return row.xpCost;
  if (row.source === 'FGA') return row.tier;
  return '—';
}
