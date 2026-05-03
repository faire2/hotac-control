import React from "react";
import {Button} from "react-bootstrap";
import {PSN} from "../Maneuvers";

export const FgaStressedPositionSelection = (props) =>
    <div className="d-button-container">
        <Button variant="info" onClick={() => props.setTargetPosition(PSN.STRSBULL)}
                className="d-button r3-bull"> <i className="xwi x-token-lock-outline"/> </Button>
        <Button variant="info" onClick={() => props.setTargetPosition(PSN.STRSFRONT)}
                className="d-button r3-front"> <i className="xwi x-token-lock-outline"/> </Button>
        <Button variant="info" onClick={() => props.setTargetPosition(PSN.STRSFRONTSIDE)}
                className="d-button r3-front-side"> <i className="xwi x-token-lock-outline"/> </Button>
        <Button variant="info" onClick={() => props.setTargetPosition(PSN.STRSREAR)}
                className="d-button r3-rear"> <i className="xwi x-token-lock-outline"/> </Button>
        <Button variant="info" onClick={() => props.setTargetPosition(PSN.STRSREARSIDE)}
                className="d-button r3-rear-side"> <i className="xwi x-token-lock-outline"/> </Button>
    </div>;
