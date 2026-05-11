import type { ReactNode } from 'react';
import { Ships } from '../../data/Ships';
import type { ShipId } from '../../data/Ships';
import type { UpgradeRollMeta } from '../../context/Contexts';

interface Props {
  shipType: ShipId;
  /** Upgrade-roll bookkeeping. Absent for mission-fixed / ally / `noUpgrades`
   * squads — the Init column falls back to `ship.initiative` and the XP
   * column shows `0`. */
  rollMeta?: UpgradeRollMeta;
  headerExtra?: ReactNode;
}

export const SquadStats = ({ shipType, rollMeta, headerExtra }: Props) => {
  const ship = Ships[shipType];
  const initiative = rollMeta?.initiative ?? ship.initiative;
  const xp = rollMeta?.xp ?? 0;

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
