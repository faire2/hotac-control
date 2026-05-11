import Modal from 'react-bootstrap/Modal';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { AI, UPGRADES } from '../../data/Ships';
import type { AiEngine, UpgradeSource } from '../../data/Ships';
import type { PlayerCount, Scenario } from '../../data/scenarios/types';
import { Rule } from '../Rule';

const RANK_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const PLAYER_COUNT_OPTIONS: PlayerCount[] = [1, 2, 3, 4, 5, 6];
const AI_OPTIONS: AiEngine[] = [AI.FGA, AI.ANDERSON];
const UPGRADE_OPTIONS: UpgradeSource[] = [UPGRADES.COMMUNITY, UPGRADES.FGA, UPGRADES.ANDERSON];

interface Props {
  show: boolean;
  scenario: Scenario;
  mode: 'start' | 'view';
  playerCount: PlayerCount;
  playersRank: number;
  aiEngine: AiEngine;
  upgradesSource: UpgradeSource;
  onPlayerCountChange?: (n: PlayerCount) => void;
  onPlayersRankChange?: (n: number) => void;
  onAiEngineChange?: (engine: AiEngine) => void;
  onUpgradesSourceChange?: (source: UpgradeSource) => void;
  onStart?: () => void;
  onBack?: () => void;
  onHide: () => void;
}

export function ScenarioBriefingModal({
  show,
  scenario,
  mode,
  playerCount,
  playersRank,
  aiEngine,
  upgradesSource,
  onPlayerCountChange,
  onPlayersRankChange,
  onAiEngineChange,
  onUpgradesSourceChange,
  onStart,
  onBack,
  onHide,
}: Props) {
  const briefingParas = scenario.briefing.split(/\n\s*\n/);
  const isStart = mode === 'start';

  return (
    <Modal show={show} onHide={onHide} centered scrollable size="lg">
      <Modal.Header closeButton className="scenarioModalHeader">
        <div className="w-100">
          <Modal.Title>
            {scenario.title}
            {scenario.subtitle ? <span className="ml-2">— {scenario.subtitle}</span> : null}
            <span className="ml-2 small">{scenario.version}</span>
          </Modal.Title>
          <div className="scenarioHeaderControls">
            <div className="d-flex align-items-center">
              <span className="control-label">Players&apos; rank:</span>
              <ToggleButtonGroup
                type="radio"
                name="briefing-rank"
                size="sm"
                value={playersRank}
                onChange={(value: number) => onPlayersRankChange?.(value)}
              >
                {RANK_OPTIONS.map((n) => (
                  <ToggleButton key={n} value={n} variant="outline-light">
                    {n}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
            <div className="d-flex align-items-center">
              <span className="control-label">Number:</span>
              <ToggleButtonGroup
                type="radio"
                name="briefing-players"
                size="sm"
                value={playerCount}
                onChange={(value: number) => onPlayerCountChange?.(value as PlayerCount)}
              >
                {PLAYER_COUNT_OPTIONS.map((n) => (
                  <ToggleButton key={n} value={n} variant="outline-light">
                    {n}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
            <div className="d-flex align-items-center">
              <span className="control-label">Engine:</span>
              <ToggleButtonGroup
                type="radio"
                name="briefing-ai"
                size="sm"
                value={aiEngine}
                onChange={(value: AiEngine) => onAiEngineChange?.(value)}
              >
                {AI_OPTIONS.map((eng) => (
                  <ToggleButton key={eng} value={eng} variant="outline-light">
                    {eng}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
            <div className="d-flex align-items-center">
              <span className="control-label">Upgrades:</span>
              <ToggleButtonGroup
                type="radio"
                name="briefing-upgrades"
                size="sm"
                value={upgradesSource}
                onChange={(value: UpgradeSource) => onUpgradesSourceChange?.(value)}
              >
                {UPGRADE_OPTIONS.map((src) => (
                  <ToggleButton key={src} value={src} variant="outline-light">
                    {src}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <h5>Mission Briefing</h5>
        {briefingParas.map((p, i) => (
          <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{p}</p>
        ))}

        <div className="scenarioMap mt-4">
          <pre style={{ fontSize: '0.85em', lineHeight: 1.1 }}>{scenario.mapDiagram}</pre>
        </div>
        <ul className="small">
          {scenario.mapNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>

        <h5 className="mt-4">Mission Objectives</h5>
        <ul>
          {scenario.objectives.map((obj, i) => (
            <li key={i}>
              <strong>{obj.kind === 'primary' ? 'Primary' : 'Bonus'}:</strong> {obj.text}
              {obj.reward ? <span className="badge badge-xp ml-2">{obj.reward}</span> : null}
            </li>
          ))}
        </ul>

        {(() => {
          // Entries flagged `coveredOnSquadCard` are surfaced inline on the
          // squad card; skip them in the briefing for now. The flag + full
          // text stay in data for future toggling.
          const visibleRules = scenario.specialRules?.filter((r) => !r.coveredOnSquadCard) ?? [];
          if (visibleRules.length === 0) return null;
          return (
            <>
              <h5 className="mt-4">Special Rules</h5>
              {visibleRules.map((rule, i) => (
                <div key={i} className="specialRule">
                  <h6>{rule.title}</h6>
                  {rule.body.split(/\n\s*\n/).map((para, j) => (
                    <p key={j} style={{ whiteSpace: 'pre-wrap' }}>
                      <Rule text={para} />
                    </p>
                  ))}
                </div>
              ))}
            </>
          );
        })()}
      </Modal.Body>
      <Modal.Footer>
        {isStart ? (
          <>
            {onBack ? (
              <button type="button" className="btn btn-outline-secondary" onClick={onBack}>
                Back
              </button>
            ) : null}
            <button type="button" className="btn btn-primary" onClick={onStart}>
              Start scenario
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={onHide}>
            Close
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
