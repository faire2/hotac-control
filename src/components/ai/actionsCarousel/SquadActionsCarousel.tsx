import { useRef, useState } from 'react';
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
  /** True if the squad is elite — Anderson reads a different priority
   * list when available (e.g. TIE Defender Elite vs base). FGA has no
   * elite/non-elite split. */
  isElite: boolean;
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
  isElite,
  aiTag,
  behaviorDescription,
}: Props) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const content = [
    <SquadTargetSelection
      key="target"
      aiEngine={aiEngine}
      shipType={shipType}
      isElite={isElite}
      aiTag={aiTag}
      behaviorDescription={behaviorDescription}
    />,
    <SquadActions key="actions" aiEngine={aiEngine} shipType={shipType} isElite={isElite} />,
    <SquadAttack key="attack" aiEngine={aiEngine} shipType={shipType} isElite={isElite} />,
  ];
  const headlines = ['Maneuver tgt', 'Actions', 'Attack tgt'];

  function handleArrowClick(direction: Direction) {
    if (direction === DIRECTIONS.LEFT) {
      setCurrentSlideIndex((i) => (i < 1 ? content.length - 1 : i - 1));
    } else {
      setCurrentSlideIndex((i) => (i > content.length - 2 ? 0 : i + 1));
    }
  }

  // Swipe support via Pointer Events — works uniformly for touch,
  // mouse, and pen. `setPointerCapture` locks subsequent move/up
  // events to the carousel even if the cursor leaves its bounds
  // mid-drag. `preventDefault` on pointerdown suppresses the native
  // text-selection drag on mouse; trade-off documented in the
  // accompanying message. Horizontal drag of ≥ 40 px (clearly
  // dominating vertical) navigates slides.
  const pointerStartRef = useRef<{ x: number; y: number; id: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    pointerStartRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    // mouse: suppress native text selection during drag.
    // touch: preventDefault would also kill vertical native scroll, so skip.
    if (e.pointerType === 'mouse') {
      e.preventDefault();
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    const start = pointerStartRef.current;
    if (!start || start.id !== e.pointerId) return;
    pointerStartRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // pointer may already be released; ignore.
    }
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      handleArrowClick(dx < 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
    }
  }

  function onPointerCancel(e: React.PointerEvent) {
    if (pointerStartRef.current?.id === e.pointerId) {
      pointerStartRef.current = null;
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleArrowClick(DIRECTIONS.LEFT);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleArrowClick(DIRECTIONS.RIGHT);
    }
  }

  return (
    <div className="actionsCarousel">
      <h3 className="squadSectionHeader">{headlines[currentSlideIndex]}</h3>
      <div
        className="carousel"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
        role="region"
        aria-label="Squad actions carousel"
        tabIndex={0}
      >
        <div className="carousel-slide">{content[currentSlideIndex]}</div>
        <div id="carousel-indicators-container" className="align-middle">
          <Arrow direction={DIRECTIONS.LEFT} onClick={() => { handleArrowClick(DIRECTIONS.LEFT); }} glyph="‹" />
          <ul>
            {content.map((_, index) => (
              <li
                key={index}
                className={`indicator${index === currentSlideIndex ? ' active' : ''}`}
                onClick={() => { setCurrentSlideIndex(index); }}
              />
            ))}
          </ul>
          <Arrow direction={DIRECTIONS.RIGHT} onClick={() => { handleArrowClick(DIRECTIONS.RIGHT); }} glyph="›" />
        </div>
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
