import React, {useState} from "react";

import {AI, Ships, Stats} from "../../data/Ships";
import {ShipsVariables} from "./variables/ShipsVariables"
import {SquadStats} from "./SquadStats";
import Select from "react-select";
import {PSN} from "../../data/Maneuvers";
import SquadActionsCarousel from "./actionsCarousel/SquadActionsCarousel";
import {TargetPosition} from "./maneuvers/TargetPosition";
import UpgradesCard from "./upgrades/UpgradesCard";
import {TargetPositionContext} from "../../context/Contexts";

export function Squad(props) {
    const squad = props.squad;
    const shipType = props.squad.shipType;
    const squadId = props.squadId;

    /* TARGET POSITION STATE */
    const [targetPosition, setTargetPosition] = useState([PSN.R3FRONT]);
    const [maneuverRandNum, setManeuverRandnum] = useState(1);
    const [aiEngine, setAiEngine] = useState(AI.FGA);
    const [stressed, setStressed] = useState(false);
    const squadNames = [
        {value: "Alpha", label: "Alpha"},
        {value: "Beta", label: "Beta"},
        {value: "Gamma", label: "Gamma"},
        {value: "Delta", label: "Delta"},
        {value: "Epsilon", label: "Epsilon"},
        {value: "Omega", label: "Omega"},
    ];

    // number is randomized here to ensure that re-render of SquadManeuvres will be triggered
    function handleSetTargetPosition(position) {
        setManeuverRandnum(Math.floor(Math.random() * 6));
        setTargetPosition(position);
    }

    function handleStress() {
        setStressed(!stressed);
    }

    function handleSetAi(ai) {
        setTargetPosition(PSN.R1FRONT);
        setStressed(false);
        setAiEngine(ai);
    }

    return (
        <TargetPositionContext.Provider value={{
            shipType: shipType,
            maneuverRandNum: maneuverRandNum,
            aiEngine: aiEngine,
            setAiEngine: handleSetAi,
            targetPosition: targetPosition,
            setTargetPosition: handleSetTargetPosition,
            stressed: stressed,
            handleStress: handleStress
        }}>
            <div className="squadContainer">
                <div className="row">
                    <div className="col-8">
                        <h3>Ship type: {Ships[shipType][Stats.name]}</h3>
                        <SquadStats shipType={shipType} upgrades={squad.upgrades}/>
                        <ShipsVariables squadId={squadId}/>
                        <SquadActionsCarousel aiEngine={aiEngine} shipType={shipType}/>
                    </div>
                    <div className="col-4">
                        <Select options={squadNames}
                                defaultValue={{value: "Squadron designation", label: "Squadron designation"}}/>
                        <TargetPosition />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <UpgradesCard squadId={props.squadId} />
                    </div>
                </div>
            </div>
        </TargetPositionContext.Provider>
    )
}
