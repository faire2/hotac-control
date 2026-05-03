import React, {useContext} from "react";

import TargetPositionDiagram from "./TargetPositionDiagram";
import ToggleButton from "react-bootstrap/ToggleButton";
import {AI, Ships} from "../../../data/Ships";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import {TargetPositionContext} from "../../../context/Contexts";
import SquadManeuverGenerator from "./SquadManeuverGenerator";

export function TargetPosition(props) {
    const positionContext = useContext(TargetPositionContext);
    return (
        <div className="d-flex flex-column justify-content-center">
            <h3>Maneuvers:</h3>
            <ToggleButtonGroup type="radio" name="radio" value={positionContext.aiEngine}
                               onChange={e => positionContext.setAiEngine(e)}>
                    <ToggleButton value={AI.FGA}>{AI.FGA}</ToggleButton>
                {Ships[positionContext.shipType].ai.includes(AI.HINNY) ?
                <ToggleButton value={AI.HINNY}>{AI.HINNY}</ToggleButton> : ""}
            </ToggleButtonGroup>
            {/*  Handles visibility of the check-box according to selected Ai engine */
                positionContext.aiEngine === AI.FGA &&
                <label>
                    <input type="checkbox" value={positionContext.stressed}
                           onChange={e => positionContext.handleStress(e)}/>
                    Is ship stressed?
                </label>}
            <TargetPositionDiagram/>
            <SquadManeuverGenerator/>
        </div>
    )
}