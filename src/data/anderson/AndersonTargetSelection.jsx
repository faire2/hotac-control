import React from 'react';

/**
 * Anderson "Select Target" priority lists per ship.
 *
 * Phase 5a: stub renderer. Each ship returns a TODO placeholder until the
 * priority text is transcribed from `docs/anderson/pages/p-NN.png` in Phase 5b.
 *
 * Mirrors the FGA renderer shape so the dispatch in
 * `components/ai/actionsCarousel/SquadTargetSelection.ts` works uniformly.
 */
export default function andersonTargetSelection(props) {
    return <Stub shipType={props.shipType} step="Select Target" />;
}

const Stub = ({shipType, step}) => (
    <ol>
        <li><span className="red">TODO (phase 5b):</span> transcribe Anderson "{step}" priorities for {shipType} from docs/anderson/pages/p-NN.png</li>
    </ol>
);
