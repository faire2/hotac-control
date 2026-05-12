import { useContext, useState } from 'react';
import Select from 'react-select';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { AI, Ships } from '../../data/Ships';
import type { AiEngine } from '../../data/Ships';
import { PSN } from '../../data/Maneuvers';
import type { Position } from '../../data/Maneuvers';
import { ShipsVariables } from './variables/ShipsVariables';
import { SquadStats } from './SquadStats';
import SquadActionsCarousel from './actionsCarousel/SquadActionsCarousel';
import { TargetPosition } from './maneuvers/TargetPosition';
import UpgradesCard from './upgrades/UpgradesCard';
import { GlobalSquadsValuesContext, TargetPositionContext, approachDisplay } from '../../context/Contexts';
import type { Squadron } from '../../context/Contexts';
import './Squad.cockpit.css';

interface Props {
  squad: Squadron;
  squadId: number;
}

const SQUAD_NAMES = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
  'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi',
  'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
].map((n) => ({ value: n, label: n }));

const SQUAD_NAME_FALLBACK = { value: 'Squadron designation', label: 'Squadron designation' };

const DESIGNATION_PREFIXES = ['SQN', 'WNG', 'FLT', 'RDR', 'GAR'];

function designationFor(squadId: number): string {
  const prefix = DESIGNATION_PREFIXES[squadId % DESIGNATION_PREFIXES.length];
  const num = (squadId * 17 + 113).toString().padStart(4, '0').slice(-4);
  return `${prefix}-${num}`;
}

/* Decorative cockpit-MFD chrome wrapping the squad card. The ship
 * watermark glyph is rendered inside SquadStats (see SquadStats.tsx)
 * so it lives in the same container as the stat values it sits
 * behind — its bounding box is then naturally constrained by the
 * stats bar, no hand-tuned offsets needed. All children here are
 * aria-hidden — none of this conveys gameplay information. */
function CockpitFrame({ designation }: { designation: string }) {
  return (
    <>
      <svg
        className="squad-mfd-frame"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon points="0,0 88,0 100,8 100,100 0,100" />
      </svg>
      <div className="squad-mfd-scanlines" aria-hidden="true" />
      <div className="squad-mfd-ruler" aria-hidden="true" />
      <div className="squad-mfd-designation" aria-hidden="true">{designation}</div>
      <div className="squad-mfd-aurebesh" aria-hidden="true">
        <svg viewBox="0 0 132 14">
          {/* fake-Aurebesh geometric glyphs — decorative, not transcribed */}
          <path d="M2 13 L7 1 L12 13 M4 9 L10 9" />
          <path d="M18 1 L18 13 M18 2 L23 2 L23 6 L18 6 M18 8 L23 8 L23 12 L18 12" />
          <path d="M30 1 L36 1 L36 7 L30 7 L36 13 L30 13" />
          <path d="M42 1 L42 13 L48 13 M42 1 L48 1 M42 7 L46 7" />
          <path d="M54 1 L54 13 M54 1 L60 4 L54 7 M54 13 L60 10" />
          <path d="M66 1 L72 1 L72 13 L66 13 Z M66 7 L72 7" />
          <path d="M78 13 L84 1 L90 13" />
          <path d="M96 1 L96 13 M102 1 L102 13 M96 7 L102 7" />
          <path d="M108 1 L114 1 L114 13 M108 1 L108 13 L114 13" />
          <path d="M120 1 L126 1 L126 7 L120 7 L120 13 L126 13" />
        </svg>
      </div>
    </>
  );
}

export function Squad({ squad, squadId }: Props) {
  const shipType = squad.shipType;
  const ship = Ships[shipType];
  const isAlly = ship.ai.length === 0;
  const globalValues = useContext(GlobalSquadsValuesContext);
  const scenarioAiEngine = globalValues?.scenarioAiEngine;

  const [targetPosition, setTargetPosition] = useState<Position | readonly Position[]>([PSN.R3FRONT]);
  const [maneuverRandNum, setManeuverRandNum] = useState(1);
  const [localAiEngine, setLocalAiEngine] = useState<AiEngine>(AI.FGA);
  const [stressed, setStressed] = useState(false);

  const aiEngine = scenarioAiEngine ?? localAiEngine;

  function handleSetTargetPosition(position: Position | readonly Position[]) {
    setManeuverRandNum(Math.floor(Math.random() * 6));
    setTargetPosition(position);
  }

  function handleStress() {
    setStressed((s) => !s);
  }

  function handleSetAi(ai: AiEngine) {
    setTargetPosition(PSN.R1FRONT);
    setStressed(false);
    setLocalAiEngine(ai);
  }

  const aiToggle = scenarioAiEngine ? null : (
    <ToggleButtonGroup
      type="radio"
      name={`ai-engine-${String(squadId)}`}
      value={aiEngine}
      size="sm"
      onChange={(value: AiEngine) => { handleSetAi(value); }}
    >
      {ship.ai.includes(AI.FGA) && <ToggleButton value={AI.FGA}>{AI.FGA}</ToggleButton>}
      {ship.ai.includes(AI.ANDERSON) && <ToggleButton value={AI.ANDERSON}>{AI.ANDERSON}</ToggleButton>}
    </ToggleButtonGroup>
  );

  return (
    <TargetPositionContext.Provider
      value={{
        shipType,
        maneuverRandNum,
        aiEngine,
        setAiEngine: handleSetAi,
        targetPosition,
        setTargetPosition: handleSetTargetPosition,
        stressed,
        handleStress,
      }}
    >
      <div
        className={
          isAlly
            ? 'squadContainer squadContainerAlly squad-mfd'
            : 'squadContainer squad-mfd'
        }
      >
        <CockpitFrame designation={designationFor(squadId)} />
        <div className="squad-mfd-content">
          <div className="row align-items-center no-gutters squad-mfd-titlebar">
            <div className="col-8 pr-2">
              <h3 className="squadTitle" title={ship.name}>{ship.name}</h3>
            </div>
            <div className="col-4">
              {squad.scenarioMeta ? (
                <div className="scenarioSquadName">
                  {squad.scenarioMeta.squadName}
                  {squad.isElite ? <span className="badge badge-warning ml-2">Elite</span> : null}
                </div>
              ) : (
                <Select
                  options={SQUAD_NAMES}
                  defaultValue={SQUAD_NAMES[squadId] ?? SQUAD_NAME_FALLBACK}
                  classNamePrefix="squad-mfd-sq"
                />
              )}
            </div>
          </div>
          {squad.scenarioMeta && (
            <div className="scenarioSquadMeta small text-muted">
              <span>
                Approach:{' '}
                <strong>
                  {approachDisplay(squad.scenarioMeta)}
                </strong>
              </span>
              <span className="ml-3">
                Arrived: turn {squad.scenarioMeta.arrivedAtRound.toString()}
              </span>
              {squad.scenarioMeta.huntsPlayerIndex !== undefined && (
                <span className="ml-3">
                  Hunts: <strong>player {squad.scenarioMeta.huntsPlayerIndex.toString()}</strong>
                </span>
              )}
            </div>
          )}
          <SquadStats shipType={shipType} rollMeta={squad.rollMeta} headerExtra={aiToggle} />
          <ShipsVariables squadId={squadId} />
          <div className="row no-gutters align-items-stretch">
            <div className="col-6 pr-1 d-flex flex-column">
              <TargetPosition />
            </div>
            <div className="col-6 pl-1 d-flex flex-column">
              <SquadActionsCarousel
                aiEngine={aiEngine}
                shipType={shipType}
                aiTag={squad.scenarioMeta?.aiTag}
                behaviorDescription={squad.scenarioMeta?.behaviorDescription}
              />
            </div>
          </div>
          <UpgradesCard squadId={squadId} />
        </div>
      </div>
    </TargetPositionContext.Provider>
  );
}
