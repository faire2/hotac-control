import React from 'react';
import {Ships} from "../Ships";

export default function fgaShipActions(props) {
    switch (props.shipType) {
        case Ships.TIEIN.id:
            return <TIEIN/>;
        case Ships.TIELN.id:
            return <TIELN/>;
        case Ships.TIESA.id:
            return <TIESA/>;
        case Ships.VT49.id:
            return <VT49/>;
        case Ships.TIEADVX.id:
            return <TIEADVX/>;
        case Ships.TIEDEF.id:
            return <TIEDEF/>;
        case Ships.TIEPH.id:
            return <TIEPH/>;
        case Ships.LAMBDA.id:
            return <LAMBDA/>;
        default:
            console.log("Component ShipActions didn't recognize shipType: " + props.shipType);
    }
}

const TIELN = () => (
    <ol>
        <li>Resolve <i className="xwi x-crit"/>.</li>
        <li><i className="xwi x-barrelroll"/> to avoid target's arc and still get a shot.</li>
        <li><i className="xwi x-barrelroll"/> to get a shot.</li>
        <li><i className="xwi x-focus"/> if you have a shot.</li>
        <li><i className="xwi x-barrelroll"/> to avoid target's arc.</li>
        <li><i className="xwi x-evade"/>.</li>
    </ol>
);

const TIEIN = () => (
    <ol>
        <li>Resolve <i className="xwi x-crit"/>.</li>
        <li><i className="xwi x-focus"/> <i className="xwi x-linked"/><i className="xwir x-barrelroll"/>/<i
            className="xwir x-boost"/> to avoid target's arc and still get a shot.
        </li>
        <li><i className="xwi x-boost"/> <i className="xwi x-linked"/><i className="xwir x-barrelroll"/> or <i
            className="xwi x-barrelroll"/> <i className="xwi x-linked"/><i className="xwir x-boost"/> to get a
            shot.
        </li>
        <li><i className="xwi x-focus"/> if hou have a shot.</li>
        <li><i className="xwi x-boost"/> <i className="xwi x-linked"/><i className="xwir x-barrelroll"/> or <i
            className="xwi x-barrelroll"/> <i className="xwi x-linked"/><i className="xwir x-boost"/> to avoid
            target's arc.
        </li>
        <li><i className="xwi x-evade"/>.</li>
    </ol>
);

const TIESA = () => (
    <ol>
        <li>Resolve <i className="xwi x-crit"/>.</li>
        <li><i className="xwir x-reload"/> if no charges on equipped <i className="xwi x-missile"/> or <i
            className="xwi x-torpedo"/>.
        </li>
        <li><i className="xwi x-barrelroll"/> (<i className="xwi x-linked"/><i className="xwir x-lock"/>) to avoid
            target's arc and still get a shot.
        </li>
        <li><i className="xwi x-barrelroll"/> (<i className="xwi x-linked"/><i className="xwir x-lock"/>) to get a
            shot.
        </li>
        <li><i className="xwi x-lock"/>.</li>
        <li><i className="xwi x-barrelroll"/> to avoid target's arc.</li>
        <li><i className="xwi x-focus"/>.</li>
    </ol>
);

const VT49 = () => (
    <ol>
        <li>Resolve <i className="xwi x-crit"/>.</li>
        <li>If target is in no arc, <i className="xwi x-rotatearc"/> to get a shot.</li>
        <li>If target has not yet moved and ship is not in an enemy arc, <i className="xwi x-lock"/>.</li> {/*todo harmonize with advx*/}
        <li>If target has already moved, <i className="xwi x-lock"/>.</li>
        <li><i className="xwi x-reinforce"/> (prio: <i className="xwi x-fullfrontarc"/>, <i
            className="xwi x-fullreararc"/> if within arc of 2 or more enemies in that full arc.
        </li>
        <li><i className="xwi x-focus"/>.</li>
    </ol>
);

const TIEADVX = () => (
    <ol>
        <li>Resolve <i className="xwi x-crit"/>.</li>
        <li>If target has not moved yer, <i className="xwi x-lock"/> target if not in any enemy's arc.</li>
        <li>If target has already moved, <i className="xwi x-lock"/> target.</li>
        <li>If target has already moved, <i className="xwi x-focus"/> <i className="xwi x-linked"/><i
            className="xwir x-barrelroll"/> to avoid target's arc and still get a shot.
        </li>
        <li>If target has already moved, <i className="xwi x-focus"/> <i className="xwi x-linked"/><i
            className="xwir x-barrelroll"/> to get a shot.
        </li>
        <li><i className="xwi x-barrelroll"/> to avoid target's arc.</li>
        <li><i className="xwi x-focus"/>.</li>
    </ol>
);

const TIEDEF = () => (
    <ol>
        <li>Resolve <i className="xwi x-crit"/>.</li>
        <li>If target has already moved, <i className="xwi x-lock"/> target.</li>
        <li>If target has already moved, <i className="xwi x-barrelroll"/> or <i className="xwi x-boost"/> to get a
            shot. {/* todo: the steps 3 and 4 should probably be switched */}
        </li>
        <li>If target has already moved, <i className="xwi x-barrelroll"/> or <i className="xwi x-boost"/> to get in
            range 1 and still get a shot.
        </li>
        <li><i className="xwi x-barrelroll"/> or <i className="xwi x-boost"/> to avoid target's arc.</li>
        <li><i className="xwi x-evade"/> if ship is not already evading.</li>
        <li><i className="xwi x-focus"/>.</li>
    </ol>
);

const TIEPH = () => (
    <ol>
        <li>Resolve <i className="xwi x-crit"/>.</li>
        <li><i className="xwi x-cloak"/> if you don't have a shot.</li>
        <li><i className="xwi x-evade"/> if ship is not already evading.</li>
        <li><i className="xwir x-barrelroll"/> to avoid target's arc and still get a shot.
        </li>
        <li><i className="xwi x-focus"/> if you have a shot.</li>
    </ol>
);

const LAMBDA = () => (
    <ol>
        <li>Resolve <i className="xwi x-crit"/>.</li>
        <li><i className="xwi x-focus"/> if you have a shot.</li>
        <li><i className="xwi x-reinforce"/> (prio: <i className="xwi x-fullfrontarc"/>, <i
            className="xwi x-fullreararc"/> if within arc of 2 or more enemies in that full arc.
        </li>
        <li><i className="xwi x-coordinate"/> nearest friendly ship.</li>
        <li><i className="xwir x-jam"/> target.</li>
        <li><i className="xwi x-focus"/>.</li>
    </ol>


);
