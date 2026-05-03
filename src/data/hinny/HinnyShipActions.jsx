import React from 'react';
import {Ships} from "../Ships";

export default function hinnyShipActions(props) {
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

const TIELN = () => (
    <ol>
        <li>Remove 1 stress token or take <i className="xwi xwing-miniatures-font-crit"/> action.</li>
        <li><i className="xwi x-barrelroll"/> to avoid target's firing arc and
            still have it in your firing arc.
        </li>
        <li><i className="xwi x-barrelroll"/> to get target in your firing arc.</li>
        <li><i className="xwi x-focus"/> if you have target in your firing arc.</li>
        <li><i className="xwi x-barrelroll"/> to avoid target's firing arc.</li>
        <li><i className="xwi x-evade"/></li>
    </ol>
);

const TIEIN = () => (
    <ol>
        <li>Remove 1 stress token or take <i className="xwi xwing-miniatures-font-crit"/> action.</li>
        <li><i className="xwi x-focus"/> <i className="xwi x-linked"/><i className="xwi x-barrelroll"/> to avoid
            target's
            firing arc and still have it in your firing arc.
        </li>
        <li><i className="xwi x-focus"/> <i className="xwi x-linked"/><i className="xwi x-boost"/> to avoid target's
            firing arc and still have it in your firing arc
        </li>
        <li><i className="xwi x-focus"/> <i className="xwi x-linked"/><i className="xwi x-barrelroll"/> to get target in
            your firing arc or improve attack.
        </li>
        <li><i className="xwi x-focus"/> <i className="xwi x-linked"/><i className="xwi x-boost"/> to get target in
            your firing arc or improve attack.
        </li>
        <li><i className="xwi x-barrelroll"/> <i className="xwi x-linked"/><i className="xwi x-boost"/> to get target in
            your firing arc.
        </li>
        <li><i className="xwi x-boost"/> <i className="xwi x-linked"/><i className="xwi x-barrelroll"/> to get target in
            your firing arc.
        </li>
        <li><i className="xwi x-focus"/> if you have target in the target arc</li>
        <li><i className="xwi x-evade"/> <i className="xwi x-linked"/><i className="xwi x-barrelroll"/> to avoid your
            target's firing arc.
        </li>
        <li><i className="xwi x-evade"/> <i className="xwi x-linked"/><i className="xwi x-boost"/> to avoid your target's
            firing arc.
        </li>
        <li><i className="xwi x-evade"/>.</li>
    </ol>
);

const TIESA = () => (
    <ol>
        <li>Remove 1 stress token or take <i className="xwi xwing-miniatures-font-crit"/> action.</li>
        <li><i className="xwi x-reload"></i> if there are no charges on your <i className="xwi x-torpedo"></i> or
            <i className="xwi x-missile"></i>.</li>
        <li><i className="xwi x-barrelroll"/> <i className="xwi x-linked"/><i className="xwi x-lock"/> target, to avoid
            target's firing arc and still get it in your firing arc.
        </li>
        <li><i className="xwi x-barrelroll"/> <i className="xwi x-linked"/><i className="xwi x-lock"/> target, to get
            target in your firing arc.
        </li>
        <li><i className="xwi x-lock"/> target if it is in your firing arc.</li>
        <li><i className="xwi x-barrelroll"/> <i className="xwi x-linked"/><i className="xwi x-lock"/> target, to avoid
            target's firing arc.
        </li>
        <li><i className="xwi x-reload"></i> if there are inactive charges on <i className="xwi x-torpedo"></i> or
            <i className="xwi x-missile"></i>.</li>
        <li><i className="xwi x-focus"/>.</li>
    </ol>
);

const VT49 = () => (
    <ol>
        <li>Remove 1 stress token or take <i className="xwi xwing-miniatures-font-crit"/> action.</li>
        <li><i className="xwi x-rotatearc"/> to get target in your firing arc.</li>
        <li><i className="xwi x-reinforce"/> (fore) if 2 or more ships in front of you have you in firing arc.</li>
        <li><i className="xwi x-reinforce"/> (aft) if 2 or more ships behind you have you in firing arc.</li>
        <li><i className="xwi x-lock"/> target.</li>
        {/* todo: onvalidates need of further steps*/}
        <li><i className="xwi x-focus"/> if there is a target in your firing arc.</li>
        <li><i className="xwi x-coordinate"/> the nearest friendly ship.</li>
    </ol>
);