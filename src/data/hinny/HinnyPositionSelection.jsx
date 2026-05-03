import React from "react";
import {Button} from "react-bootstrap";
import {PSN} from "../Maneuvers";

export const HinnyPositionSelection = (props) =>
    <div className="d-button-container">
        <Button variant="success" onClick={() => props.setTargetPosition(PSN.R3FRONT)}
                className="d-button r3-front"> <i className="xwi x-token-lock-outline"/> </Button>
        <Button variant="success" onClick={() => props.setTargetPosition(PSN.R3FRONTSIDE)}
                className="d-button r3-front-side"> <i className="xwi x-token-lock-outline"/> </Button>
        <Button variant="success" onClick={() => props.setTargetPosition(PSN.R3REARSIDE)}
                className="d-button r3-rear"> <i className="xwi x-token-lock-outline"/> </Button>
        <Button variant="success" onClick={() => props.setTargetPosition(PSN.R3REAR)}
                className="d-button r3-rear-side"> <i className="xwi x-token-lock-outline"/> </Button>

        <Button variant="danger" onClick={() => props.setTargetPosition(PSN.R1FRONT)}
                className="d-button r1-front"> <i className="xwi x-token-lock-outline"/> </Button>
        <Button variant="danger" onClick={() => props.setTargetPosition(PSN.R1FRONTSIDE)}
                className="d-button r1-front-side"> <i className="xwi x-token-lock-outline"/> </Button>
        <Button variant="danger" onClick={() => props.setTargetPosition(PSN.R1REARSIDE)}
                className="d-button r1-rear"> <i className="xwi x-token-lock-outline"/> </Button>
        <Button variant="danger" onClick={() => props.setTargetPosition(PSN.R1REAR)}
                className="d-button r1-rear-side"> <i className="xwi x-token-lock-outline"/> </Button>
    </div>;
