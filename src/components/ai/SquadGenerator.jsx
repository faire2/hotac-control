import React from 'react';
import {Squad} from "./Squad";

export default function SquadGenerator(props) {
    let i = 0;
    let squadId = 0;
    return (
        <div className="row shipStats">
            {props.squadrons.map(function (squad) {
                squadId = i;
                i++;
                return <div key={i} className="col-l-3 col-m-4 pl-5">
                    <Squad squad={squad} squadId={squadId} />
                </div>;
            })
            }
        </div>
    )
};


