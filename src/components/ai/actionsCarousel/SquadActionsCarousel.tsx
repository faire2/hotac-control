import { useState } from 'react';
import SquadActions from './SquadActions';
import SquadTargetSelection from './SquadTargetSelection';
import SquadAttack from './SquadAttack';
import type { AiEngine, ShipId } from '../../../data/Ships';

const DIRECTIONS = Object.freeze({
  LEFT: 'left',
  RIGHT: 'right',
} as const);

type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];

interface Props {
  aiEngine: AiEngine;
  shipType: ShipId;
  /** Mission-specified behavior tag for scenario-spawned squadrons
   * (Attack/Escort/Strike/Special/Flee*). Rendered under the target-selection
   * panel for player reference. */
  aiTag?: string;
  /** Prose description of the behavior for this mission, sourced from
   * `Scenario.behaviorDescriptions[aiTag]`. Optional. */
  behaviorDescription?: string;
}

export default function SquadActionsCarousel({
  aiEngine,
  shipType,
  aiTag,
  behaviorDescription,
}: Props) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const content = [
    <SquadTargetSelection
      key="target"
      aiEngine={aiEngine}
      shipType={shipType}
      aiTag={aiTag}
      behaviorDescription={behaviorDescription}
    />,
    <SquadActions key="actions" aiEngine={aiEngine} shipType={shipType} />,
    <SquadAttack key="attack" aiEngine={aiEngine} shipType={shipType} />,
  ];
  const headlines = ['Target for maneuver:', 'Select and perform action:', 'Target for attack:'];

  function handleArrowClick(direction: Direction) {
    if (direction === DIRECTIONS.LEFT) {
      setCurrentSlideIndex((i) => (i < 1 ? content.length - 1 : i - 1));
    } else {
      setCurrentSlideIndex((i) => (i > content.length - 2 ? 0 : i + 1));
    }
  }

  return (
    <div className="actionsCarousel">
      <h3 className="squadSectionHeader">{headlines[currentSlideIndex]}</h3>
      <div className="carousel">
        <div id="carousel-indicators-container" className="align-middle">
          <ul>
            {content.map((_, index) => (
              <li
                key={index}
                className={`indicator${index === currentSlideIndex ? ' active' : ''}`}
              />
            ))}
          </ul>
        </div>
        {content[currentSlideIndex]}
        <Arrow direction={DIRECTIONS.LEFT} onClick={() => { handleArrowClick(DIRECTIONS.LEFT); }} glyph="<" />
        <Arrow direction={DIRECTIONS.RIGHT} onClick={() => { handleArrowClick(DIRECTIONS.RIGHT); }} glyph=">" />
      </div>
    </div>
  );
}

interface ArrowProps {
  direction: Direction;
  onClick: () => void;
  glyph: string;
}

function Arrow({ direction, onClick, glyph }: ArrowProps) {
  return (
    <div
      className={`slide-arrow ${direction}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {glyph}
    </div>
  );
}
