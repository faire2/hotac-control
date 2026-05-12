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

/* Maps internal ShipId to the slug used by the xwing-miniatures-ships
 * icon font (see src/fonts/xwing-miniatures.css L578+). The font key
 * becomes the watermark glyph behind the stats bar of each squad card. */
const SHIP_GLYPH: Record<ShipId, string> = {
  TIELN: 'tielnfighter',
  TIEIN: 'tieinterceptor',
  TIESA: 'tiesabomber',
  VT49: 'vt49decimator',
  TIEADVX: 'tieadvancedx1',
  TIEDEF: 'tieddefender',
  TIEPH: 'tiephphantom',
  LAMBDA: 'lambdaclasst4ashuttle',
  TIESK: 'tieskstriker',
  TIERP: 'tiereaper',
  TIEADVV1: 'tieadvancedv1',
  TIERBA: 'tieagaggressor',
  TIERBH: 'tieagaggressor',
  TIECP: 'tiecapunisher',
  STARWING: 'alphaclassstarwing',
  SITH: 'sithinfiltrator',
  HWK290: 'hwk290lightfreighter',
  GR75: 'gr75mediumtransport',
  OUTER_RIM_SMUGGLER: 'yt2400lightfreighter',
};

export const SquadStats = ({ shipType, rollMeta, headerExtra }: Props) => {
  const ship = Ships[shipType];
  const initiative = rollMeta?.initiative ?? ship.initiative;
  const xp = rollMeta?.xp ?? 0;
  const glyphSlug = SHIP_GLYPH[shipType];

  return (
    <div className="squadStats">
      <div className="statsHeader">
        <div className="statCell statCell--init">Init</div>
        <div className="statCell statCell--attack">Attack</div>
        <div className="statCell statCell--agility">Agility</div>
        <div className="statCell statCell--xp">XP</div>
        {headerExtra && <div className="statCell statCellAi">{headerExtra}</div>}
      </div>
      <div className="statsValues">
        {/* Watermark holo-glyph — child of the values row (the lower
         * half of the stats bar) so it sits behind the numerals, not
         * the header labels above. Decorative only. */}
        <i
          className={`squad-mfd-glyph xwing-miniatures-ship xwing-miniatures-ship-${glyphSlug}`}
          aria-hidden="true"
        />
        <div className="statCell statCell--init">{initiative}</div>
        <div className="statCell statCell--attack">
          {ship.attack.map((a, index) => (
            <span key={index}>
              {a.attack}{a.damage}
            </span>
          ))}
        </div>
        <div className="statCell statCell--agility">{ship.agility}</div>
        <div className="statCell statCell--xp">{xp}</div>
        {headerExtra && <div className="statCell statCellAi" />}
      </div>
    </div>
  );
};
