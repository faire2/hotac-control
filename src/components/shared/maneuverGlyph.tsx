/**
 * Shared `Maneuver` → SVG/Icon glyph renderer.
 *
 * Extracted from `SquadManeuverGenerator` so the AI-ships reference gallery
 * can render the per-position maneuver matrix without re-implementing the
 * lookup table. The squad runtime picks ONE cell per roll; the gallery
 * shows the whole row.
 */

import { MVRS } from '../../data/Maneuvers';
import type { Maneuver } from '../../data/Maneuvers';

interface ManeuverPresentation {
  speed: string;
  iconClass: string;
}

const MANEUVER_PRESENTATION: Partial<Record<Maneuver, ManeuverPresentation>> = {
  [MVRS.STRAIGHT1]: { speed: '1', iconClass: 'xwm x-straight' },
  [MVRS.STRAIGHT1BLUE]: { speed: '1', iconClass: 'xwmb x-straight' },
  [MVRS.STRAIGHT2]: { speed: '2', iconClass: 'xwm x-straight' },
  [MVRS.STRAIGHT2BLUE]: { speed: '2', iconClass: 'xwmb x-straight' },
  [MVRS.STRAIGHT3]: { speed: '3', iconClass: 'xwm x-straight' },
  [MVRS.STRAIGHT3BLUE]: { speed: '3', iconClass: 'xwmb x-straight' },
  [MVRS.STRAIGHT4]: { speed: '4', iconClass: 'xwm x-straight' },
  [MVRS.STRAIGHT4BLUE]: { speed: '4', iconClass: 'xwmb x-straight' },
  [MVRS.STRAIGHT5]: { speed: '5', iconClass: 'xwm x-straight' },
  [MVRS.STRAIGHT5BLUE]: { speed: '5', iconClass: 'xwmb x-straight' },
  [MVRS.BANK1]: { speed: '1', iconClass: 'xwm x-bankright' },
  [MVRS.BANK1OPPOSITE]: { speed: '1', iconClass: 'xwm x-bankleft' },
  [MVRS.BANK1BLUE]: { speed: '1', iconClass: 'xwmb x-bankright' },
  [MVRS.BANK1BLUEOPPOSITE]: { speed: '1', iconClass: 'xwmb x-bankleft' },
  [MVRS.BANK2]: { speed: '2', iconClass: 'xwm x-bankright' },
  [MVRS.BANK2OPPOSITE]: { speed: '2', iconClass: 'xwm x-bankleft' },
  [MVRS.BANK2BLUE]: { speed: '2', iconClass: 'xwmb x-bankright' },
  [MVRS.BANK2BLUEOPPOSITE]: { speed: '2', iconClass: 'xwmb x-bankleft' },
  [MVRS.BANK3]: { speed: '3', iconClass: 'xwm x-bankright' },
  [MVRS.BANK3OPPOSITE]: { speed: '3', iconClass: 'xwm x-bankleft' },
  [MVRS.BANK3RED]: { speed: '3', iconClass: 'xwmr x-bankright' },
  [MVRS.TURN1]: { speed: '1', iconClass: 'xwm x-turnright' },
  [MVRS.TURN1RED]: { speed: '1', iconClass: 'xwmr x-turnright' },
  [MVRS.TURN2]: { speed: '2', iconClass: 'xwm x-turnright' },
  [MVRS.TURN2RED]: { speed: '2', iconClass: 'xwmr x-turnright' },
  [MVRS.TURN2BLUE]: { speed: '2', iconClass: 'xwmb x-turnright' },
  [MVRS.TURN2BLUEOPPOSITE]: { speed: '2', iconClass: 'xwmb x-turnleft' },
  [MVRS.TURN3]: { speed: '3', iconClass: 'xwm x-turnright' },
  [MVRS.TURN2OPPOSITE]: { speed: '2', iconClass: 'xwm x-turnleft' },
  [MVRS.TURN3OPPOSITE]: { speed: '3', iconClass: 'xwm x-turnleft' },
  [MVRS.SEGNOR3RED]: { speed: '3', iconClass: 'xwmr x-sloopright' },
  [MVRS.SEGNOR3REDOPPOSITE]: { speed: '3', iconClass: 'xwmr x-sloopleft' },
  [MVRS.TALLON3RED]: { speed: '3', iconClass: 'xwmr x-trollright' },
  [MVRS.TALLON3REDOPPOSITE]: { speed: '3', iconClass: 'xwmr x-trollleft' },
  [MVRS.KOIOGRAN3RED]: { speed: '3', iconClass: 'xwmr x-kturn' },
  [MVRS.KOIOGRAN4]: { speed: '4', iconClass: 'xwm x-kturn' },
  [MVRS.KOIOGRAN4RED]: { speed: '4', iconClass: 'xwmr x-kturn' },
  [MVRS.KOIOGRAN5RED]: { speed: '5', iconClass: 'xwmr x-kturn' },
  [MVRS.STATIONARYRED]: { speed: '', iconClass: 'xwmr x-stop' },
  [MVRS.REVERSESTRAIGHT1RED]: { speed: '1', iconClass: 'xwmr x-reversestraight' },
  [MVRS.REVERSEBANK1RED]: { speed: '1', iconClass: 'xwmr x-reversebankright' },
  [MVRS.REVERSEBANK2RED]: { speed: '2', iconClass: 'xwmr x-reversebankright' },
};

export function renderManeuverGlyph(maneuver: Maneuver) {
  const presentation = MANEUVER_PRESENTATION[maneuver];
  if (!presentation) {
    return (
      <div className="xw-man">
        <span className="red">?{maneuver}</span>
      </div>
    );
  }
  return (
    <div className="xw-man">
      {presentation.speed}
      <i className={presentation.iconClass} />
    </div>
  );
}
