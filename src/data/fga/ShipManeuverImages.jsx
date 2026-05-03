import {Ships} from "../Ships";
import React from "react";

export default function ShipManeuverImages(props) {
    switch (props.shipType) {
        case Ships.TIEIN.id:
            return <TIEIN/>;
        case Ships.TIELN.id:
            return <TIELN/>;
        case Ships.TIESA.id:
            return <TIESA/>;
        case Ships.VT49.id:
            return <VT49/>;
        default:
            console.log("Component ShipActions didn't recognize shipType: " + props.shipType);
    }
}

const TIELN = () => <img src={require('./ManeuverImages/tieln.png')} className="man_dial_img" alt="Tie-Fighter"/>;
const TIEIN = () => <img src={require('./ManeuverImages/tiein.png')} className="man_dial_img" alt="Tie-Interceptor"/>;
const TIESA = () => <img src={require('./ManeuverImages/tiesa.png')} className="man_dial_img" alt="Tie-Bomber"/>;
const VT49 = () => <img src={require('./ManeuverImages/vt49.png')} className="man_dial_img" alt="Decimator"/>;

