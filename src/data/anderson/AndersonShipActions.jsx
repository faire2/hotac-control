import React from 'react';

/**
 * Anderson "Select Action" priority lists per ship.
 * Phase 5a stub renderer; Phase 5b transcribes from PDF.
 */
export default function andersonShipActions(props) {
    return <Stub shipType={props.shipType} step="Select Action" />;
}

const Stub = ({shipType, step}) => (
    <ol>
        <li><span className="red">TODO (phase 5b):</span> transcribe Anderson "{step}" priorities for {shipType} from docs/anderson/pages/p-NN.png</li>
    </ol>
);
