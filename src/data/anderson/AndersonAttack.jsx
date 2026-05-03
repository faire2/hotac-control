import React from 'react';

/**
 * Anderson "Attack Target" priority lists per ship.
 * Phase 5a stub renderer; Phase 5b transcribes from PDF.
 */
export default function andersonAttack(props) {
    return <Stub shipType={props.shipType} step="Attack Target" />;
}

const Stub = ({shipType, step}) => (
    <ol>
        <li><span className="red">TODO (phase 5b):</span> transcribe Anderson "{step}" priorities for {shipType} from docs/anderson/pages/p-NN.png</li>
    </ol>
);
