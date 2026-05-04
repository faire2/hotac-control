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

import { Ships, UPGRADES } from './data/Ships';
import type { ShipId, UpgradeSource } from './data/Ships';
import SquadGenerator from './components/ai/SquadGenerator';
import { GlobalSquadsValuesContext, ShipHandlingContext } from './context/Contexts';
import type { ShipInstance, Squadron } from './context/Contexts';
import getUpgrades from './components/ai/upgrades/UpgradesGenerator';
import { countExtraHullAndShield } from './data/shared/coreUpgrades';
import type { UpgradeRow } from './data/UpgradeRow';
import { runValidator } from './data/__validate__';

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

function App() {
  const [squadrons, setSquadrons] = useState<Squadron[]>([]);
  const [playersRank, setPlayersRank] = useState(2);
  const [round, setRound] = useState(1);

  function handleNewShipSelection(value: ShipId) {
    setSquadrons((prev) => [...prev, freshSquadron(value, playersRank)]);
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
        }}
      >
        <ShipHandlingContext.Provider
          value={{ squadrons, handleAddShip, handleShipRemoval: handleRemoveShip, handleShipChange }}
        >
          <div className="row menu d-flex align-items-center">
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
          </div>
          <SquadGenerator squadrons={squadrons} onAddShip={handleNewShipSelection} />
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
