import { useState } from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './fonts/xwing-miniatures.css';
// The .ttf files are loaded via the @font-face declarations in
// xwing-miniatures.css. Vite resolves those url() refs natively. CRA
// required separate JS-side imports of the TTFs to copy them into the
// build output; under Vite those imports are not just redundant, they
// shadow the @font-face fetch for the icon font (Vite serves them with
// `?import=` as JS modules, and the browser caches that URL ahead of
// the @font-face fetch). Do not re-add them.

import { AI, Ships, UPGRADES } from './data/Ships';
import type { AiEngine, ShipId, UpgradeSource } from './data/Ships';
import SquadGenerator from './components/ai/SquadGenerator';
import { GlobalSquadsValuesContext, ShipHandlingContext } from './context/Contexts';
import type { ShipInstance, Squadron } from './context/Contexts';
import getUpgrades from './components/ai/upgrades/UpgradesGenerator';
import { countExtraHullAndShield } from './data/shared/coreUpgrades';
import type { UpgradeRow } from './data/UpgradeRow';
import { runValidator } from './data/__validate__';
import { LoadScenarioModal } from './components/scenarios/LoadScenarioModal';
import { ScenarioBriefingModal } from './components/scenarios/ScenarioBriefingModal';
import { EndScenarioModal } from './components/scenarios/EndScenarioModal';
import { findScenario, resolveSquad } from './data/scenarios';
import type { PlayerCount, ScenarioSquad } from './data/scenarios/types';

if (import.meta.env.DEV) {
  runValidator();
}

const RANK_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

function freshSquadron(shipType: ShipId, playersRank: number): Squadron {
  const upgrades = getUpgrades(shipType, playersRank, UPGRADES.FGA, false);
  const extras = countExtraHullAndShield(upgrades.map((r) => r.upgrade));
  const baseStats = Ships[shipType];
  return {
    id: crypto.randomUUID(),
    shipType,
    isElite: false,
    upgradesSource: UPGRADES.FGA,
    upgrades,
    ships: [
      {
        tokenId: 0,
        hull: baseStats.hull + extras.extraHull,
        shields: baseStats.shields + extras.extraShield,
      },
    ],
  };
}

function spawnFromScenarioSquad(
  squad: ScenarioSquad,
  playerCount: PlayerCount,
  avgRebelInit: number,
  playersRank: number,
  upgradesSource: UpgradeSource,
): Squadron[] {
  const resolved = resolveSquad(squad, { playerCount, avgRebelInit });
  if (resolved.ships.length === 0) return [];
  const byShipType = new Map<ShipId, number>();
  for (const id of resolved.ships) byShipType.set(id, (byShipType.get(id) ?? 0) + 1);
  return Array.from(byShipType.entries()).map(([shipType, count]) => {
    const upgrades = squad.noUpgrades
      ? []
      : getUpgrades(shipType, playersRank, upgradesSource, false);
    const extras = countExtraHullAndShield(upgrades.map((r) => r.upgrade));
    const baseStats = Ships[shipType];
    return {
      id: crypto.randomUUID(),
      shipType,
      isElite: false,
      upgradesSource,
      upgrades,
      scenarioSquadName: squad.name,
      ships: Array.from({ length: count }, () => ({
        tokenId: 0,
        hull: baseStats.hull + extras.extraHull,
        shields: baseStats.shields + extras.extraShield,
      })),
    };
  });
}

function squadShouldSpawnAt(squad: ScenarioSquad, round: number): boolean {
  switch (squad.arrival.kind) {
    case 'setup':
      return round === 1;
    case 'turn':
    case 'rolledTurn':
      return round === squad.arrival.turn;
  }
}

function App() {
  const [squadrons, setSquadrons] = useState<Squadron[]>([]);
  const [playersRank, setPlayersRank] = useState(2);
  const [round, setRound] = useState(1);
  const [showScenarioPicker, setShowScenarioPicker] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [briefingScenarioId, setBriefingScenarioId] = useState<string | null>(null);
  const [briefingMode, setBriefingMode] = useState<'start' | 'view'>('start');
  const [playerCount, setPlayerCount] = useState<PlayerCount>(2);
  const [scenarioAiEngine, setScenarioAiEngine] = useState<AiEngine>(AI.FGA);
  const [scenarioUpgradesSource, setScenarioUpgradesSource] = useState<UpgradeSource>(UPGRADES.FGA);
  const [showEndScenario, setShowEndScenario] = useState(false);
  const activeScenario = activeScenarioId ? findScenario(activeScenarioId) : undefined;
  const briefingScenario = briefingScenarioId ? findScenario(briefingScenarioId) : undefined;

  function handleNewShipSelection(value: ShipId) {
    setSquadrons((prev) => [...prev, freshSquadron(value, playersRank)]);
  }

  function handlePickerSelect(scenarioId: string) {
    setShowScenarioPicker(false);
    setBriefingScenarioId(scenarioId);
    setBriefingMode('start');
  }

  function handleStartScenario() {
    if (!briefingScenario) return;
    setActiveScenarioId(briefingScenario.id);
    setRound(1);
    const setupSquadrons = briefingScenario.squads
      .filter((sq) => squadShouldSpawnAt(sq, 1))
      .flatMap((sq) =>
        spawnFromScenarioSquad(sq, playerCount, playersRank, playersRank, scenarioUpgradesSource),
      );
    setSquadrons(setupSquadrons);
    setBriefingScenarioId(null);
  }

  function handleScenarioUpgradesSourceChange(source: UpgradeSource) {
    setScenarioUpgradesSource(source);
    setSquadrons((prev) =>
      prev.map((squad) => {
        const newUpgrades = getUpgrades(squad.shipType, playersRank, source, squad.isElite);
        return {
          ...squad,
          upgradesSource: source,
          upgrades: newUpgrades,
          ships: resetHullShieldDelta(squad.upgrades, newUpgrades, squad.ships),
        };
      }),
    );
  }

  function handleBriefingBack() {
    setBriefingScenarioId(null);
    setShowScenarioPicker(true);
  }

  function handleShowBriefing() {
    if (!activeScenarioId) return;
    setBriefingScenarioId(activeScenarioId);
    setBriefingMode('view');
  }

  function handleNextRound() {
    if (!activeScenario) {
      setRound((r) => r + 1);
      return;
    }
    const nextRound = round + 1;
    const newSquadrons = activeScenario.squads
      .filter((sq) => squadShouldSpawnAt(sq, nextRound))
      .flatMap((sq) =>
        spawnFromScenarioSquad(sq, playerCount, playersRank, playersRank, scenarioUpgradesSource),
      );
    setSquadrons((prev) => [...prev, ...newSquadrons]);
    setRound(nextRound);
  }

  function handleEndScenarioClick() {
    setShowEndScenario(true);
  }

  function handleEndScenarioConfirmed() {
    setShowEndScenario(false);
    setActiveScenarioId(null);
    setSquadrons([]);
    setRound(1);
  }

  function handleSquadRemoval(index: number) {
    setSquadrons((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSetUpgradesSource(index: number, upgradesSource: UpgradeSource) {
    setSquadrons((prev) => {
      const next = [...prev];
      const squad = next[index];
      if (!squad) return prev;
      const newUpgrades = getUpgrades(squad.shipType, playersRank, upgradesSource, squad.isElite);
      next[index] = {
        ...squad,
        upgradesSource,
        upgrades: newUpgrades,
        ships: resetHullShieldDelta(squad.upgrades, newUpgrades, squad.ships),
      };
      return next;
    });
  }

  function handleSetPlayersRank(newRank: number) {
    setSquadrons((prev) =>
      prev.map((squad) => {
        const newUpgrades = getUpgrades(squad.shipType, newRank, squad.upgradesSource, squad.isElite);
        return {
          ...squad,
          upgrades: newUpgrades,
          ships: resetHullShieldDelta(squad.upgrades, newUpgrades, squad.ships),
        };
      }),
    );
    setPlayersRank(newRank);
  }

  function handleSetIsElite(index: number, isElite: boolean) {
    setSquadrons((prev) => {
      const next = [...prev];
      const squad = next[index];
      if (!squad) return prev;
      const newUpgrades = getUpgrades(squad.shipType, playersRank, squad.upgradesSource, isElite);
      next[index] = {
        ...squad,
        isElite,
        upgrades: newUpgrades,
        ships: resetHullShieldDelta(squad.upgrades, newUpgrades, squad.ships),
      };
      return next;
    });
  }

  function handleAddShip(squadId: number) {
    setSquadrons((prev) => {
      const next = [...prev];
      const squad = next[squadId];
      if (!squad) return prev;
      const extras = countExtraHullAndShield(squad.upgrades.map((r) => r.upgrade));
      const baseStats = Ships[squad.shipType];
      next[squadId] = {
        ...squad,
        ships: [
          ...squad.ships,
          {
            tokenId: 0,
            hull: baseStats.hull + extras.extraHull,
            shields: baseStats.shields + extras.extraShield,
          },
        ],
      };
      return next;
    });
  }

  function handleRemoveShip(shipIndex: number, squadId: number) {
    setSquadrons((prev) => {
      const next = [...prev];
      const squad = next[squadId];
      if (!squad) return prev;
      next[squadId] = { ...squad, ships: squad.ships.filter((_, i) => i !== shipIndex) };
      return next;
    });
  }

  function handleShipChange(ship: ShipInstance, shipIndex: number, squadId: number) {
    setSquadrons((prev) => {
      const next = [...prev];
      const squad = next[squadId];
      if (!squad) return prev;
      const newShips = [...squad.ships];
      newShips[shipIndex] = ship;
      next[squadId] = { ...squad, ships: newShips };
      return next;
    });
  }

  return (
    <div className="App">
      <GlobalSquadsValuesContext.Provider
        value={{
          playersRank,
          squadrons,
          handleSetIsElite,
          handleSetUpgradesSource,
          handleSquadRemoval,
          scenarioAiEngine: activeScenario ? scenarioAiEngine : undefined,
          scenarioUpgradesSource: activeScenario ? scenarioUpgradesSource : undefined,
        }}
      >
        <ShipHandlingContext.Provider
          value={{ squadrons, handleAddShip, handleShipRemoval: handleRemoveShip, handleShipChange }}
        >
          <div className="row menu d-flex align-items-center">
            {activeScenario ? (
              <>
                <div className="col-auto menu-text">
                  <span className="font-weight-bold">{activeScenario.title}</span>
                  <span className="ml-2 small menu-text-dim">
                    {playerCount.toString()} players of rank {playersRank.toString()}
                  </span>
                </div>
                <div className="col-auto">
                  <button type="button" className="btn btn-scenario-action" onClick={handleShowBriefing}>
                    Briefing
                  </button>
                </div>
                <div className="col-auto d-flex align-items-center menu-text">
                  <span className="mr-2">Round:</span>
                  <span className="counterValue" style={{ margin: '0 10px' }}>{round}</span>
                  <span className="small mr-3 menu-text-dim">/ {activeScenario.turnLimit.toString()}</span>
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-scenario-action"
                    onClick={handleEndScenarioClick}
                  >
                    End scenario
                  </button>
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-scenario-action"
                    onClick={handleNextRound}
                    disabled={round >= activeScenario.turnLimit}
                  >
                    Next round
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowScenarioPicker(true)}
                  >
                    Load Scenario
                  </button>
                </div>
                <div className="col-auto">Set players&apos; rank:</div>
                <ToggleButtonGroup
                  type="radio"
                  name="rank"
                  value={playersRank}
                  onChange={(value: number) => handleSetPlayersRank(value)}
                >
                  {RANK_OPTIONS.map((n) => (
                    <ToggleButton key={n} value={n}>{n}</ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <div className="col-auto d-flex align-items-center">
                  <span className="mr-2">Round:</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-counter"
                    style={{ backgroundColor: '#0062cc', borderColor: '#005cbf' }}
                    aria-label="Decrease round"
                    onClick={() => setRound((r) => Math.max(1, r - 1))}
                  >
                    −
                  </button>
                  <span className="counterValue" style={{ margin: '0 10px' }}>{round}</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-counter"
                    style={{ backgroundColor: '#0062cc', borderColor: '#005cbf' }}
                    aria-label="Increase round"
                    onClick={() => setRound((r) => r + 1)}
                  >
                    +
                  </button>
                </div>
              </>
            )}
          </div>
          <SquadGenerator squadrons={squadrons} onAddShip={handleNewShipSelection} />
          <LoadScenarioModal
            show={showScenarioPicker}
            onHide={() => setShowScenarioPicker(false)}
            onSelect={handlePickerSelect}
          />
          {briefingScenario ? (
            <ScenarioBriefingModal
              show={true}
              scenario={briefingScenario}
              mode={briefingMode}
              playerCount={playerCount}
              playersRank={playersRank}
              aiEngine={scenarioAiEngine}
              upgradesSource={scenarioUpgradesSource}
              onPlayerCountChange={setPlayerCount}
              onPlayersRankChange={handleSetPlayersRank}
              onAiEngineChange={setScenarioAiEngine}
              onUpgradesSourceChange={handleScenarioUpgradesSourceChange}
              onStart={handleStartScenario}
              onBack={handleBriefingBack}
              onHide={() => setBriefingScenarioId(null)}
            />
          ) : null}
          {activeScenario && showEndScenario ? (
            <EndScenarioModal
              show={true}
              scenario={activeScenario}
              onClose={handleEndScenarioConfirmed}
            />
          ) : null}
        </ShipHandlingContext.Provider>
      </GlobalSquadsValuesContext.Provider>
    </div>
  );
}

function resetHullShieldDelta(
  previousUpgrades: readonly UpgradeRow[],
  newUpgrades: readonly UpgradeRow[],
  ships: readonly ShipInstance[],
): ShipInstance[] {
  const previous = countExtraHullAndShield(previousUpgrades.map((r: UpgradeRow) => r.upgrade));
  const next = countExtraHullAndShield(newUpgrades.map((r: UpgradeRow) => r.upgrade));
  return ships.map((s) => ({
    ...s,
    hull: s.hull + next.extraHull - previous.extraHull,
    shields: s.shields + next.extraShield - previous.extraShield,
  }));
}

export default App;
