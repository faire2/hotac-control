import Modal from 'react-bootstrap/Modal';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { SCENARIOS } from '../../data/scenarios/registry';
import { requiredModelsFor } from '../../data/scenarios/requiredModels';
import { ownsRequiredModels } from '../../data/campaigns/settings';
import type { AiEngine, UpgradeSource } from '../../data/Ships';
import type { PlayerCount } from '../../data/scenarios/types';
import { EngineToggle } from '../shared/EngineToggle';
import { UpgradeSourceToggle } from '../shared/UpgradeSourceToggle';

const RANK_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const PLAYER_COUNT_OPTIONS: PlayerCount[] = [1, 2, 3, 4, 5, 6];

interface Props {
  show: boolean;
  ownedModels: readonly string[];
  playerCount: PlayerCount;
  playersRank: number;
  aiEngine: AiEngine;
  upgradesSource: UpgradeSource;
  onPlayerCountChange: (n: PlayerCount) => void;
  onPlayersRankChange: (n: number) => void;
  onAiEngineChange: (engine: AiEngine) => void;
  onUpgradesSourceChange: (source: UpgradeSource) => void;
  onHide: () => void;
  onSelect: (scenarioId: string) => void;
}

/**
 * Scenario picker. The player count + players' rank controls live here so
 * the squad can be set up alongside the scenario choice in a single modal —
 * removes the need for a separate rank toggle in the top bar when no
 * scenario is active.
 */
export function LoadScenarioModal({
  show,
  ownedModels,
  playerCount,
  playersRank,
  aiEngine,
  upgradesSource,
  onPlayerCountChange,
  onPlayersRankChange,
  onAiEngineChange,
  onUpgradesSourceChange,
  onHide,
  onSelect,
}: Props) {
  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Load scenario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3 d-flex flex-wrap align-items-center" style={{ gap: '0.75rem 1.25rem' }}>
          <div className="d-flex align-items-center">
            <span className="mr-2">Players&apos; rank:</span>
            <ToggleButtonGroup
              type="radio"
              name="load-scenario-rank"
              size="sm"
              value={playersRank}
              onChange={(value: number) => { onPlayersRankChange(value); }}
            >
              {RANK_OPTIONS.map((n) => (
                <ToggleButton key={n} value={n} variant="outline-primary">
                  {n}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="d-flex align-items-center">
            <span className="mr-2">Players:</span>
            <ToggleButtonGroup
              type="radio"
              name="load-scenario-players"
              size="sm"
              value={playerCount}
              onChange={(value: number) => { onPlayerCountChange(value as PlayerCount); }}
            >
              {PLAYER_COUNT_OPTIONS.map((n) => (
                <ToggleButton key={n} value={n} variant="outline-primary">
                  {n}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="d-flex align-items-center">
            <span className="mr-2">Engine:</span>
            <EngineToggle
              name="load-scenario-ai"
              value={aiEngine}
              onChange={onAiEngineChange}
            />
          </div>
          <div className="d-flex align-items-center">
            <span className="mr-2">Upgrades:</span>
            <UpgradeSourceToggle
              name="load-scenario-upgrades"
              value={upgradesSource}
              onChange={onUpgradesSourceChange}
            />
          </div>
        </div>
        <div className="d-flex flex-column">
          {SCENARIOS.map((s) => {
            const required = requiredModelsFor(s);
            const playable = ownsRequiredModels(required, ownedModels);
            const missing = required.filter(
              (r) => !ownedModels.some((o) => o.toLowerCase() === r.toLowerCase()),
            );
            return (
              <button
                key={s.id}
                type="button"
                className={`btn text-left mb-2 ${playable ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
                disabled={!playable}
                onClick={() => {
                  onSelect(s.id);
                  onHide();
                }}
              >
                <div className="font-weight-bold">{s.title}</div>
                {s.subtitle ? <div className="small text-muted">{s.subtitle}</div> : null}
                {!playable && missing.length > 0 ? (
                  <div className="small text-danger">
                    Requires: {missing.join(', ')}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
}
