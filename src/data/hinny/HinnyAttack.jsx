import React from 'react';
import {Ships} from "../Ships";

export default function hinnyAttack(props) {
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
            console.log("Component attack didn't recognize shipType: " + props.shipType);
    }
}

const TIELN = () => (
    <ol>
        <li>Attack nearest enemy in ship's arc.</li>
        <li>Attack nearest enemy remote in ship's arc.</li>
    </ol>
);

const TIEIN = () => (
    <ol>
        <li>Attack nearest enemy in ship's arc.</li>
        <li>Attack nearest enemy remote in ship's arc.</li>
    </ol>
);

const TIESA = () => (
    <ol>
        <li>Attack nearest enemy in ship's arc.</li>
        <li>Attack nearest enemy remote in ship's arc.</li>
    </ol>
);

const VT49 = () => (
    <ol>
        <li>Attack nearest enemy in ship's arc.</li>
        <li>Attack nearest enemy remote in ship's arc.</li>
    </ol>
);