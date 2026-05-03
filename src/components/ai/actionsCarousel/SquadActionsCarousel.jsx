import React, {useState} from "react";
import SquadActions from "./SquadActions";
import SquadTargetSelection from "./SquadTargetSelection";
import SquadAttack from "./SquadAttack";

export default function SquadActionsCarousel(props) {
    const aiEngine = props.aiEngine;
    const shipType = props.shipType;

    const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
    const content = [
        <SquadTargetSelection aiEngine={aiEngine} shipType={shipType}/>,
        <SquadActions aiEngine={aiEngine} shipType={shipType}/>,
        <SquadAttack aiEngine={aiEngine} shipType={shipType}/>
    ];
    const headline = [
        <h3>Target for maneuver:</h3>,
        <h3>Select and perform action:</h3>,
        <h3>Target for attack:</h3>
    ];

    function handleArrowClick(direction) {
        let newIndex = currentSlideIndex;
        if (direction === DIRECTIONS.LEFT) {
            newIndex = (currentSlideIndex < 1) ? content.length - 1 : currentSlideIndex - 1;
        } else if (direction === DIRECTIONS.RIGHT) {
            newIndex = (currentSlideIndex > content.length - 2) ? 0 : currentSlideIndex + 1;
        } else {
            console.log("Unknown direction in function handleArrowClick: " + direction)
        }
        setCurrentSlideIndex(newIndex);
        console.log("New image index is: " + newIndex);
    }

    return (
        <div>
            {headline[currentSlideIndex]}
            <div className="carousel">
            <div id="carousel-indicators-container" className="align-middle">
                <ul>
                    {content.map((item, index) => {
                        if (index === currentSlideIndex) return <li key={index} className="indicator active"></li>
                        return <li key={index} className="indicator"></li>
                    })}
                </ul>
            </div>

                {content[currentSlideIndex]}
                <Arrow direction={DIRECTIONS.LEFT} handleArrowClick={() => handleArrowClick(DIRECTIONS.LEFT)}
                       glyph="<"/>
                <Arrow direction={DIRECTIONS.RIGHT} handleArrowClick={() => handleArrowClick(DIRECTIONS.RIGHT)}
                       glyph=">"/>
            </div>

        </div>
    )
};

const Arrow = ({direction, handleArrowClick, glyph}) => (
    <div className={"slide-arrow " + direction} onClick={() => handleArrowClick(direction)}>
        {glyph}
    </div>
);

const DIRECTIONS = Object.freeze({
        LEFT: "left",
        RIGHT: "right",
    }
);