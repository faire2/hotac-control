import React from 'react';
import {Ships} from "../Ships";

export default function fgaAttack(props) {
    switch (props.shipType) {
        case Ships.TIELN.id:
            return <TIELN/>;
        case Ships.TIEIN.id:
            return <TIEIN/>;
        case Ships.TIEADVX:
            return <TIEADVX/>;
        case Ships.TIESA.id:
            return <TIESA/>;
        case Ships.TIEDEF.id:
            return <TIEDEF/>;
        case Ships.TIEPH.id:
            return <TIEPH/>;
        case Ships.LAMBDA.id:
            return <LAMBDA/>;
        case Ships.VT49.id:
            return <VT49/>;
        default:
            console.log("Component Attack didn't recognize shipType: " + props.shipType);
    }
}

const TIELN = () => (
    <ol>
        <li>Nearest enemy</li>
    </ol>
);

const TIEIN = () => (
    <ol>
        <li>Nearest enemy</li>
    </ol>
);

const TIEADVX = () => (
    <ol>
        <li>Ship that is locked (prio: <i className="xwi x-missile"/>, <i className="xwi x-frontarc"/></li>
        <li>Nearest enemy</li>
    </ol>
);

const TIESA = () => (
    <ol>
        <li>Ship that is locked (prio: <i className="xwi x-torpedo"/>, <i className="xwi x-missile"/>, <i className="xwi x-frontarc"/></li>
        <li>Nearest enemy (prio: <i className="xwi x-missile"/>, <i className="xwi x-frontarc"/>)</li>
    </ol>
);

const TIEDEF = () => (
    <ol>
        <li>Ship that is locked (prio: <i className="xwi x-missile"/>, <i className="xwi x-cannon"/>, <i className="xwi x-frontarc"/>)</li>
        <li>Nearest enemy (prio: <i className="xwi x-missile"/>, <i className="xwi x-cannon"/>, <i className="xwi x-frontarc"/>)</li>
    </ol>
);

const TIEPH = () => (
    <ol>
        <li>Nearest enemy</li>
    </ol>
);

const LAMBDA = () => (
    <ol>
        <li>Nearest enemy (prio: <i className="xwi x-cannon"/>, <i className="xwi x-frontarc"/>, <i className="xwi x-reararc"/>)</li>
        <li>If allowed by <i className="xwi x-gunner"/>, nearest enemy (prio: <i className="xwi x-reararc"/></li>
    </ol>
);

const VT49 = () => (
    <ol>
        <li>Ship that is locked (prio: <i className="xwi x-torpedo"/>, <i className="x-singleturretarc"/>)</li>
        <li>Nearest enemy</li>
    </ol>
);