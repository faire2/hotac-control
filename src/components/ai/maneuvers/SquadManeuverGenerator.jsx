import React, {useContext} from "react";
import {AI} from "../../../data/Ships";
import {hinnyManeuvers} from "../../../data/hinny/Maneuvers"
import {fgaManeuvers} from "../../../data/fga/Maneuvers"
import {MVRS} from "../../../data/Maneuvers";
import {TargetPositionContext} from "../../../context/Contexts";

export default function SquadManeuverGenerator(props) {
    const positionContext = useContext(TargetPositionContext);
    let maneuvers;
    switch (positionContext.aiEngine) {
        case AI.HINNY:
            maneuvers = hinnyManeuvers;
            break;
        case AI.FGA:
            maneuvers = fgaManeuvers;
            console.log("fga maneuvers");
            break;
        default:
            console.log("Unknown AI engine in SquadManeuver: " + positionContext.aiEngine)
    }
    console.log(("Type, position, number: " + positionContext.shipType + ", "  + positionContext.targetPosition + ", "  + positionContext.maneuverRandNum));
    const maneuver = maneuvers[positionContext.shipType][positionContext.targetPosition][positionContext.maneuverRandNum];

    switch (maneuver) {
        case MVRS.STRAIGHT1:
            return <div className="xw-man">1<i className="xwm x-straight"/></div>;
        case MVRS.STRAIGHT1BLUE:
            return <div className="xw-man">1<i className="xwmb x-straight"/></div>;
        case MVRS.STRAIGHT2:
            return <div className="xw-man">2<i className="xwm x-straight"/></div>;
        case MVRS.STRAIGHT2BLUE:
            return <div className="xw-man">2<i className="xwmb x-straight"/></div>;
        case MVRS.STRAIGHT3:
            return <div className="xw-man">3<i className="xwm x-straight"/></div>;
        case MVRS.STRAIGHT3BLUE:
            return <div className="xw-man">3<i className="xwmb x-straight"/></div>;
        case MVRS.STRAIGHT4:
            return <div className="xw-man">4<i className="xwm x-straight"/></div>;
        case MVRS.STRAIGHT4BLUE:
            return <div className="xw-man">4<i className="xwmb x-straight"/></div>;
        case MVRS.STRAIGHT5:
            return <div className="xw-man">5<i className="xwm x-straight"/></div>;
        case MVRS.STRAIGHT5BLUE:
            return <div className="xw-man">5<i className="xwmb x-straight"/></div>;
        case MVRS.BANK1:
            return <div className="xw-man">1<i className="xwm x-bankright"/></div>;
        case MVRS.BANK1OPPOSITE:
            return <div className="xw-man">1<i className="xwm x-bankleft"/></div>;
        case MVRS.BANK1BLUE:
            return <div className="xw-man">1<i className="xwmb x-bankright"/></div>;
        case MVRS.BANK1BLUEOPPOSITE:
            return <div className="xw-man">1<i className="xwmb x-bankleft"/></div>;
        case MVRS.BANK2:
            return <div className="xw-man">2<i className="xwm x-bankright"/></div>;
        case MVRS.BANK2OPPOSITE:
            return <div className="xw-man">2<i className="xwm x-bankleft"/></div>;
        case MVRS.BANK2BLUE:
            return <div className="xw-man">2<i className="xwmb x-bankright"/></div>;
        case MVRS.BANK2BLUEOPPOSITE:
            return <div className="xw-man">2<i className="xwmb x-bankleft"/></div>;
        case MVRS.BANK3:
            return <div className="xw-man">3<i className="xwm x-bankright"/></div>;
        case MVRS.BANK3RED:
            return <div className="xw-man">3<i className="xwmr x-bankright"/></div>;
        case MVRS.BANK3OPPOSITE:
            return <div className="xw-man">3<i className="xwm x-bankleft"/></div>;
        case MVRS.TURN1:
            return <div className="xw-man">1<i className="xwm x-turnright"/></div>;
        case MVRS.TURN1RED:
            return <div className="xw-man">1<i className="xwmr x-turnright"/></div>;
        case MVRS.TURN2:
            return <div className="xw-man">2<i className="xwm x-turnright"/></div>;
        case MVRS.TURN2RED:
            return <div className="xw-man">2<i className="xwmr x-turnright"/></div>;
        case MVRS.TURN2BLUE:
            return <div className="xw-man">2<i className="xwmb x-turnright"/></div>;
        case MVRS.TURN2BLUEOPPOSITE:
            return <div className="xw-man">2<i className="xwmb x-turnleft"/></div>;
        case MVRS.TURN3:
            return <div className="xw-man">3<i className="xwm x-turnright"/></div>;
        case MVRS.TURN2OPPOSITE:
            return <div className="xw-man">2<i className="xwm x-turnleft"/> </div>;
        case MVRS.TURN3OPPOSITE:
            return <div className="xw-man">3<i className="xwm x-turnleft"/> </div>;
        case MVRS.SEGNOR3RED:
            return <div className="xw-man">3<i className="xwmr x-sloopright"/> </div>;
        case MVRS.SEGNOR3REDOPPOSITE:
            return <div className="xw-man">3<i className="xwmr x-sloopleft"/> </div>
        case MVRS.TALLON3RED:
            return <div className="xw-man">3<i className="xwmr x-trollright"/> </div>;
        case MVRS.TALLON3REDOPPOSITE:
            return <div className="xw-man">3<i className="xwmr x-trollleft"/> </div>;
        case MVRS.KOIOGRAN3RED:
            return <div className="xw-man">3<i className="xwmr x-kturn"/> </div>;
        case MVRS.KOIOGRAN4:
            return <div className="xw-man">4<i className="xwm x-kturn"/> </div>;
        case MVRS.KOIOGRAN4RED:
            return <div className="xw-man">4<i className="xwmr x-kturn"/> </div>;
        case MVRS.KOIOGRAN5RED:
            return <div className="xw-man">5<i className="xwmr x-kturn"/> </div>;
        case MVRS.STATIONARYRED:
            return <div className="xw-man"><i className="xwmr x-stop"/> </div>;
        case MVRS.REVERSESTRAIGHT1RED:
            return <div className="xw-man">1<i className="xwmr x-reversestraight"/> </div>;
        case MVRS.REVERSEBANK1RED:
            return <div className="xw-man">1<i className="xwmr x-reversebankright"/> </div>;
        case MVRS.REVERSEBANK2RED:
            return <div className="xw-man">2<i className="xwmr x-reversebankright"/> </div>;
        default:
            console.log("Component Maneuvers didn't recognize maneuver: " + positionContext.maneuver);
    }
}