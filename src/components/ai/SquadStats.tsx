import { Ships } from '../../data/Ships';
import type { ShipId } from '../../data/Ships';
import type { UpgradeRollMeta } from '../../context/Contexts';

interface Props {
  shipType: ShipId;
  /** Upgrade-roll bookkeeping. Absent for mission-fixed / ally /
   * `noUpgrades` squads — the Init column then falls back to
   * `ship.initiative`. */
  rollMeta?: UpgradeRollMeta;
  /** Mission-fixed initiative (allies). Wins over rollMeta + ship default. */
  initiativeOverride?: number;
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
  OUTER_RIM_SMUGGLER: 'yt1300lightfreighter',
};

export const SquadStats = ({ shipType, rollMeta, initiativeOverride }: Props) => {
  const ship = Ships[shipType];
  const initiative = initiativeOverride ?? rollMeta?.initiative ?? ship.initiative;
  const glyphSlug = SHIP_GLYPH[shipType];

  return (
    <div className="squadStats">
      <div className="statsHeader">
        {/* Empty cell aligned over the ship-glyph column — no label
         * needed; the glyph itself is self-explanatory. */}
        <div className="statCell statCell--ship" aria-hidden="true" />
        <div className="statCell statCell--init">Init</div>
        <div className="statCell statCell--attack">Attack</div>
        <div className="statCell statCell--agility">Agility</div>
      </div>
      <div className="statsValues">
        <div className="statCell statCell--ship">
          {/* Ship-class glyph from the X-Wing miniatures icon font.
           * Real grid cell (was an absolute-positioned watermark) so
           * it aligns with the rest of the stat row by construction. */}
          <i
            className={`squad-mfd-glyph xwing-miniatures-ship xwing-miniatures-ship-${glyphSlug}`}
            aria-hidden="true"
          />
        </div>
        <div className="statCell statCell--init">{initiative}</div>
        <div className="statCell statCell--attack">
          {ship.attack.map((a, index) => (
            <span key={index}>
              {a.attack}{a.damage}
            </span>
          ))}
        </div>
        <div className="statCell statCell--agility">{ship.agility}</div>
      </div>
    </div>
  );
};
