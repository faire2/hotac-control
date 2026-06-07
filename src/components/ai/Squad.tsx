import { useContext, useState } from 'react';
import Select from 'react-select';
import { AI, Ships } from '../../data/Ships';
import type { AiEngine } from '../../data/Ships';
import { PSN } from '../../data/Maneuvers';
import type { Position } from '../../data/Maneuvers';
import { ShipsVariables } from './variables/ShipsVariables';
import { SquadStats } from './SquadStats';
import SquadActionsCarousel from './actionsCarousel/SquadActionsCarousel';
import { TargetPosition } from './maneuvers/TargetPosition';
import { AllyManeuverDial } from './maneuvers/AllyManeuverDial';
import { AllyActions } from './AllyActions';
import UpgradesCard from './upgrades/UpgradesCard';
import { GlobalSquadsValuesContext, TargetPositionContext, approachDisplay } from '../../context/Contexts';
import type { Squadron } from '../../context/Contexts';
import './Squad.cockpit.css';

interface Props {
  squad: Squadron;
  squadId: number;
}

interface DesignationOption {
  value: string;
  label: string;
}

const SQUAD_NAMES: readonly DesignationOption[] = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
  'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi',
  'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
].map((n) => ({ value: n, label: n }));

const SQUAD_NAME_FALLBACK: DesignationOption = {
  value: 'Squadron designation',
  label: 'Squadron designation',
};

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
  // "Ally" mode means render the player-piloted maneuver matrix + action
  // bar instead of the AI position scope + carousel. Two ways to get here:
  //   - the ship type carries no AI (HWK-290 / GR-75 / Outer Rim Smuggler) —
  //     standard rebel-ally setup; OR
  //   - the squadron carries an `ally` profile even though the ship type
  //     does have AI — the Defector flow in defection-2 spawns a captured
  //     TIE Defender flying for the Rebels, ai-coded but matrix-rendered.
  const isAlly = ship.ai.length === 0 || squad.ally !== undefined;
  const globalValues = useContext(GlobalSquadsValuesContext);
  // AI engine is set globally via the New / Load / Campaign-setup
  // modals. We fall back to the ship's first supported engine if the
  // ship doesn't support the globally-chosen one — keeps allies and
  // out-of-deck ships behaving sensibly.
  const scenarioAiEngine = globalValues?.scenarioAiEngine ?? AI.FGA;
  const aiEngine: AiEngine = ship.ai.includes(scenarioAiEngine)
    ? scenarioAiEngine
    : ship.ai[0] ?? AI.FGA;

  const [targetPosition, setTargetPosition] = useState<Position | readonly Position[]>([PSN.R3FRONT]);
  const [maneuverRandNum, setManeuverRandNum] = useState(1);
  const [stressed, setStressed] = useState(false);

  // Squadron designation dropdown options. For scenario-spawned squads
  // the prescribed name is prepended as the default-selected option so
  // it shows up in the dropdown without polluting the Greek-letter list.
  const scenarioOption = squad.scenarioMeta
    ? { value: squad.scenarioMeta.squadName, label: squad.scenarioMeta.squadName }
    : null;
  const pickerOptions = scenarioOption ? [scenarioOption, ...SQUAD_NAMES] : SQUAD_NAMES;
  const initialDesignation =
    scenarioOption ?? SQUAD_NAMES[squadId] ?? SQUAD_NAME_FALLBACK;

  // Click-to-edit designation: by default we render the big styled text
  // (much nicer than the compact dropdown control); clicking it swaps to
  // the Select for picking a new designation, then we swap back. State
  // lives in the component since it's a UI affordance only — the chosen
  // designation isn't persisted yet (no scenario writes back to squad).
  const [designation, setDesignation] = useState(initialDesignation);
  const [editingDesignation, setEditingDesignation] = useState(false);

  function handleSetTargetPosition(position: Position | readonly Position[]) {
    setManeuverRandNum(Math.floor(Math.random() * 6));
    setTargetPosition(position);
  }

  function handleStress() {
    setStressed((s) => !s);
  }

  return (
    <TargetPositionContext.Provider
      value={{
        shipType,
        maneuverRandNum,
        aiEngine,
        setAiEngine: () => undefined, // AI engine is now globally controlled
        targetPosition,
        setTargetPosition: handleSetTargetPosition,
        stressed,
        handleStress,
        maneuverOverride: squad.scenarioMeta?.maneuverOverride,
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
          <div className="d-flex align-items-center squad-mfd-titlebar">
            <h3 className="squadTitle flex-grow-1 mr-3" title={ship.name}>{ship.name}</h3>
            <div className="squad-mfd-titlebar-picker">
              {editingDesignation ? (
                <Select
                  autoFocus
                  defaultMenuIsOpen
                  options={pickerOptions}
                  value={designation}
                  onChange={(opt: DesignationOption | null) => {
                    if (opt) setDesignation(opt);
                    setEditingDesignation(false);
                  }}
                  onBlur={() => { setEditingDesignation(false); }}
                  classNamePrefix="squad-mfd-sq"
                />
              ) : (
                <button
                  type="button"
                  className="squad-mfd-designation-trigger"
                  aria-label={`Squadron designation ${designation.label} — click to change`}
                  onClick={() => { setEditingDesignation(true); }}
                >
                  {designation.label}
                </button>
              )}
              {squad.scenarioMeta && squad.isElite ? (
                <span className="badge badge-warning ml-2">Elite</span>
              ) : null}
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
          <SquadStats
            shipType={shipType}
            rollMeta={squad.rollMeta}
            initiativeOverride={squad.initiativeOverride}
          />
          <ShipsVariables squadId={squadId} />
          <div className="row no-gutters align-items-stretch">
            <div className="col-6 pr-1 d-flex flex-column">
              {isAlly ? (
                <AllyManeuverDial dial={squad.ally?.dial ?? []} />
              ) : (
                <TargetPosition />
              )}
            </div>
            <div className="col-6 pl-1 d-flex flex-column">
              {isAlly ? (
                <AllyActions actions={squad.ally?.actions ?? []} />
              ) : (
                <SquadActionsCarousel
                  aiEngine={aiEngine}
                  shipType={shipType}
                  isElite={squad.isElite}
                  aiTag={squad.scenarioMeta?.aiTag}
                  behaviorDescription={squad.scenarioMeta?.behaviorDescription}
                />
              )}
            </div>
          </div>
          <UpgradesCard squadId={squadId} />
        </div>
      </div>
    </TargetPositionContext.Provider>
  );
}
