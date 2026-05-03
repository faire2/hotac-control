import React from 'react';
import {Ships} from "../Ships";

export default function hinnyTargetSelection(props) {
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
            console.log("Component TargetSelection didn't recognize shipType: " + props.shipType);
    }
}

const TIELN = () => (
    <ol>
        <li>Nearest enemy ship in your firing arc</li>
        <li>Nearest enemy ship</li>
    </ol>
);

const TIEIN = () => (
    <ol>
        <li>Nearest enemy ship in your firing arc</li>
        <li>Nearest enemy ship</li>
    </ol>
);

const TIESA = () => (
    <ol>
        <li>Locked enemy ship at range 1-3</li>
        <li>Nearest enemy ship in your firing arc</li>
        <li>Nearest enemy ship</li>
    </ol>
);

const VT49 = () => (
    <ol>
        <li>Nearest enemy ship</li>
    </ol>
);