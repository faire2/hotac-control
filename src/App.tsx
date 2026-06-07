import { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './fonts/xwing-miniatures.css';
import './App.cockpit.css';
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
import { GlobalSquadsValuesContext, ShipHandlingContext, approachDisplay } from './context/Contexts';
import type { ShipInstance, Squadron } from './context/Contexts';
import getUpgrades from './data/upgrades/getUpgrades';
import { countExtraHullAndShield } from './data/shared/coreUpgrades';
import type { Upgrade } from './data/shared/coreUpgrades';
import { runValidator } from './data/__validate__';
import { LoadScenarioModal } from './components/scenarios/LoadScenarioModal';
import { ScenarioBriefingModal } from './components/scenarios/ScenarioBriefingModal';
import { EndScenarioModal } from './components/scenarios/EndScenarioModal';
import { MissionMapsGalleryModal } from './components/scenarios/MissionMapsGalleryModal';
import { findScenario } from './data/scenarios/registry';
import {
  spawnFromScenarioSquad,
  spawnAlliesFromScenario,
  spawnAllyDynamic,
  priorVectorsFromSquadrons,
  opsForShipsOverride,
} from './data/scenarios/spawn';
import type { SpawnContext } from './data/scenarios/spawn';
import { hasTag } from './data/scenarios/types';
import type {
  PlayerCount,
  Scenario,
  ScenarioSquad,
} from './data/scenarios/types';
import {
  defaultSpawnSettings,
  type SpawnSettings,
} from './data/campaigns/settings';
import type { EndOutcomeKind } from './components/scenarios/EndScenarioModal';
import { findHandler } from './data/scenarios/dynamicSpawnHandlers';
import { DynamicSpawnPromptModal } from './components/scenarios/DynamicSpawnPromptModal';
import type { PendingHandler, HandlerOutcome } from './components/scenarios/DynamicSpawnPromptModal';
import { ArrivalNotificationModal } from './components/scenarios/ArrivalNotificationModal';
import type { Arrival } from './components/scenarios/ArrivalNotificationModal';
import {
  FREE_PLAY,
  bumpRound,
  getActiveMission,
  getActiveRound,
  getActiveScenarioId,
  getBriefingMode,
  getBriefingScenarioId,
} from './state/appMode';
import type { AppMode, MissionState } from './state/appMode';
import { MainMenu } from './components/menu/MainMenu';
import { NewGamePickerModal } from './components/menu/NewGamePickerModal';
import { OpenCampaignModal } from './components/menu/OpenCampaignModal';
import { CampaignSetupModal } from './components/menu/CampaignSetupModal';
import { DeckPickView } from './components/menu/DeckPickView';
import { campaignStore } from './data/campaigns/storage.active';
import { useCampaign } from './state/useCampaign';
import { applyOutcome, pickMission } from './data/campaigns/factory';

if (import.meta.env.DEV) {
  runValidator();
}

/** Enemy (Imperial AI) squads have ≥1 AI engine; rebel-ally NPCs have none. */
function isEnemySquad(squad: Squadron): boolean {
  return Ships[squad.shipType].ai.length > 0;
}

/** Per-ship max hull+shields for a squad, including upgrade extras. Every ship
 * token in the squad shares this cap. */
function squadShipMaxHp(squad: Squadron): number {
  const base = Ships[squad.shipType];
  const extras = countExtraHullAndShield(squad.upgrades);
  return base.hull + extras.extraHull + base.shields + extras.extraShield;
}

/** Hull+shields still missing from enemy ships left on the board — the damage
 * dealt to survivors. Destroyed ships are tallied separately as they're removed. */
function survivingEnemyDamage(squadrons: readonly Squadron[]): number {
  let total = 0;
  for (const squad of squadrons) {
    if (!isEnemySquad(squad)) continue;
    const maxHp = squadShipMaxHp(squad);
    for (const ship of squad.ships) {
      total += Math.max(0, maxHp - ship.hull - ship.shields);
    }
  }
  return total;
}

function freshSquadron(
  shipType: ShipId,
  playersRank: number,
  upgradesSource: UpgradeSource,
): Squadron {
  const { upgrades, rollMeta } = getUpgrades(shipType, playersRank, upgradesSource, false);
  const extras = countExtraHullAndShield(upgrades);
  const baseStats = Ships[shipType];
  return {
    id: crypto.randomUUID(),
    shipType,
    isElite: false,
    upgrades,
    rollMeta,
    ships: [
      {
        tokenId: 0,
        hull: baseStats.hull + extras.extraHull,
        shields: baseStats.shields + extras.extraShield,
      },
    ],
  };
}

function arrivalsFromSquadrons(
  squadrons: readonly Squadron[],
  notices: ReadonlyMap<string, string> = new Map(),
): readonly Arrival[] {
  return squadrons.map((sq) => {
    const meta = sq.scenarioMeta;
    const squadName = meta?.squadName ?? '';
    return {
      squadName,
      shipType: sq.shipType,
      shipName: Ships[sq.shipType].name,
      count: sq.ships.length,
      isElite: sq.isElite,
      approach: meta ? approachDisplay(meta) : '?',
      huntsPlayerIndex: meta?.huntsPlayerIndex,
      notice: notices.get(sq.id),
    };
  });
}

function squadShouldSpawnAt(squad: ScenarioSquad, round: number): boolean {
  // Dynamic-spawn squads never auto-arrive: their spawn is driven entirely
  // by the end-of-round handler popup (e.g. Inspection in Secure the
  // Holonet only arrives once the spy's channel has been identified).
  if (hasTag(squad, 'dynamicSpawn')) return false;
  switch (squad.arrival.kind) {
    case 'setup':
      return round === 1;
    case 'turn':
    case 'rolledTurn':
      return round === squad.arrival.turn;
    default: {
      const _exhaustive: never = squad.arrival;
      return _exhaustive;
    }
  }
}

function App() {
  const [squadrons, setSquadrons] = useState<Squadron[]>([]);
  const [playersRank, setPlayersRank] = useState(2);
  const [mode, setMode] = useState<AppMode>(FREE_PLAY);
  // Hull+shield points of enemy ships that have been *removed* (destroyed) this
  // mission. Total damage dealt = this + the missing HP of enemies still on the
  // board, computed at mission end. XP is pooled across pilots in HotAC, so the
  // squad-wide sum is all we need. Reset on mission start.
  const [destroyedEnemyHp, setDestroyedEnemyHp] = useState(0);
  const [briefingOverlayOpen, setBriefingOverlayOpen] = useState(false);
  const [freePlayRound, setFreePlayRound] = useState(1);
  const [showScenarioPicker, setShowScenarioPicker] = useState(false);
  const [playerCount, setPlayerCount] = useState<PlayerCount>(2);
  const [scenarioAiEngine, setScenarioAiEngine] = useState<AiEngine>(AI.FGA);
  const [scenarioUpgradesSource, setScenarioUpgradesSource] = useState<UpgradeSource>(UPGRADES.FGA);
  const [showEndScenario, setShowEndScenario] = useState(false);
  const [pendingArrivals, setPendingArrivals] = useState<readonly Arrival[]>([]);
  const [pendingHandlers, setPendingHandlers] = useState<readonly PendingHandler[]>([]);
  const [resolvedDynamicSquads, setResolvedDynamicSquads] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [showNewGamePicker, setShowNewGamePicker] = useState(false);
  const [showOpenBrowser, setShowOpenBrowser] = useState(false);
  const [showCampaignSetup, setShowCampaignSetup] = useState(false);
  const [showMissionMapsGallery, setShowMissionMapsGallery] = useState(false);
  // Set when a card is clicked in the maps gallery. The briefing modal renders
  // this scenario in `view` mode on top of the gallery; closing the briefing
  // returns to the gallery. Independent of `mode` so opening a map briefing
  // doesn't disturb an in-progress mission.
  const [galleryBriefingScenarioId, setGalleryBriefingScenarioId] = useState<string | null>(null);

  // Derive scenario/round/briefing state via helpers from `appMode.ts`.
  // Briefing has two facets: pre-start (mission.phase = briefing) and
  // during-play overlay (briefingOverlayOpen, while mission.phase = active).
  const activeScenarioId = getActiveScenarioId(mode);
  const round = getActiveRound(mode);
  const modeBriefingScenarioId = getBriefingScenarioId(mode, briefingOverlayOpen);
  // Gallery picks override the mode-derived briefing so opening a map briefing
  // is decoupled from any in-progress mission.
  const briefingScenarioId = galleryBriefingScenarioId ?? modeBriefingScenarioId;
  const briefingMode: 'start' | 'view' =
    galleryBriefingScenarioId !== null ? 'view' : getBriefingMode(mode);
  const activeScenario = activeScenarioId ? findScenario(activeScenarioId) : undefined;
  const briefingScenario = briefingScenarioId ? findScenario(briefingScenarioId) : undefined;

  // Active campaign (loaded from storage when mode.kind === 'campaign').
  const activeCampaignId = mode.kind === 'campaign' ? mode.campaignId : null;
  const { campaign: activeCampaign, update: updateCampaign } = useCampaign(activeCampaignId);

  // Settings used by the spawn pipeline. Campaign mode pulls from the
  // campaign record; free play / scenario-only use safe defaults.
  const effectiveSettings: SpawnSettings = activeCampaign
    ? {
        ownedModels: activeCampaign.ownedModels,
        lessRandomShips: activeCampaign.lessRandomShips,
        introducedShipTypes: activeCampaign.introducedShipTypes,
      }
    : defaultSpawnSettings();

  function handleNewShipSelection(value: ShipId) {
    setSquadrons((prev) => [
      ...prev,
      freshSquadron(value, playersRank, scenarioUpgradesSource),
    ]);
  }

  function handlePickerSelect(scenarioId: string) {
    setShowScenarioPicker(false);
    const mission: MissionState = {
      scenarioId,
      phase: { kind: 'briefing', briefingMode: 'start' },
    };
    setMode({ kind: 'scenarioOnly', mission });
  }

  function handleStartScenario() {
    if (!briefingScenario) return;
    setResolvedDynamicSquads(new Set<string>());
    setDestroyedEnemyHp(0);
    const ctx: SpawnContext = {
      scenario: briefingScenario,
      playerCount,
      avgRebelInit: playersRank,
      playersRank,
      upgradesSource: scenarioUpgradesSource,
      round: 1,
      priorVectors: new Map(),
      settings: effectiveSettings,
    };
    const setupSquadrons = briefingScenario.squads
      .filter((sq) => squadShouldSpawnAt(sq, 1))
      .flatMap((sq) => spawnFromScenarioSquad(sq, ctx));
    const allySquadrons = spawnAlliesFromScenario(briefingScenario, playerCount);
    setSquadrons([...allySquadrons, ...setupSquadrons]);
    // Arrival notification covers only Imperial squad arrivals — allies are
    // placed during setup, not arriving from an edge.
    setPendingArrivals(arrivalsFromSquadrons(setupSquadrons));
    const mission: MissionState = {
      scenarioId: briefingScenario.id,
      phase: { kind: 'active', round: 1 },
    };
    if (mode.kind === 'campaign') {
      setMode({
        kind: 'campaign',
        campaignId: mode.campaignId,
        phase: 'mission',
        mission,
      });
    } else {
      setMode({ kind: 'scenarioOnly', mission });
    }
  }

  function handleScenarioUpgradesSourceChange(source: UpgradeSource) {
    setScenarioUpgradesSource(source);
    setSquadrons((prev) =>
      prev.map((squad) => {
        // Squads without rollMeta (mission-fixed, ally, noUpgrades) opt out of
        // source-driven re-rolls — their upgrade list is authoritative.
        if (!squad.rollMeta) return squad;
        const { upgrades: newUpgrades, rollMeta } = getUpgrades(
          squad.shipType,
          playersRank,
          source,
          squad.isElite,
        );
        return {
          ...squad,
          upgrades: newUpgrades,
          rollMeta,
          ships: resetHullShieldDelta(squad.upgrades, newUpgrades, squad.ships),
        };
      }),
    );
  }

  function handleBriefingBack() {
    setMode(FREE_PLAY);
    setShowScenarioPicker(true);
  }

  function handleShowBriefing() {
    if (!activeScenarioId) return;
    setBriefingOverlayOpen(true);
  }

  function handleHideBriefing() {
    if (galleryBriefingScenarioId !== null) {
      // Close the gallery briefing; the gallery itself stays open underneath.
      setGalleryBriefingScenarioId(null);
    } else if (briefingOverlayOpen) {
      setBriefingOverlayOpen(false);
    } else {
      // Closing the pre-start briefing modal returns to free play.
      setMode(FREE_PLAY);
    }
  }

  function collectPendingHandlers(scenario: Scenario): PendingHandler[] {
    const out: PendingHandler[] = [];
    for (const sq of scenario.squads) {
      const tag = hasTag(sq, 'dynamicSpawn');
      if (!tag) continue;
      const handler = findHandler(tag.handler);
      if (!handler) continue;
      if (!handler.recurring && resolvedDynamicSquads.has(sq.name)) continue;
      out.push({ squadName: sq.name, handler });
    }
    return out;
  }

  function performRoundAdvance(outcomes: readonly HandlerOutcome[]) {
    if (!activeScenario) return;
    const nextRound = round + 1;
    // Reseed priorVectors from already-spawned squadrons so oppositeOf can
    // reach back across rounds (e.g. Bait's Support B references Support A).
    const ctx: SpawnContext = {
      scenario: activeScenario,
      playerCount,
      avgRebelInit: playersRank,
      playersRank,
      upgradesSource: scenarioUpgradesSource,
      round: nextRound,
      priorVectors: priorVectorsFromSquadrons(squadrons),
      settings: effectiveSettings,
    };
    // Auto-spawn squads (round-trigger).
    const autoSpawned = activeScenario.squads
      .filter((sq) => squadShouldSpawnAt(sq, nextRound))
      .flatMap((sq) => spawnFromScenarioSquad(sq, ctx));
    // Dynamic-spawn squads from popup outcomes — same spawn entry point,
    // optionally with synthesized composition ops.
    const dynamicSpawned: Squadron[] = [];
    for (const o of outcomes) {
      if (!o.decision.spawn) continue;
      const squad = activeScenario.squads.find((s) => s.name === o.squadName);
      if (!squad) continue;
      const override = o.decision.shipsOverride;
      const compositionOverride = override
        ? opsForShipsOverride(override.ship, override.count)
        : undefined;
      dynamicSpawned.push(...spawnFromScenarioSquad(squad, ctx, compositionOverride));
    }
    // Dynamic ally spawns (defection-2's Defector flow) — a handler can
    // return `allySpawn` to introduce a rebel-ally squadron mid-mission.
    // The ally inherits its upgrade list from a named source squad; the
    // attached instructions are stamped on the arrival notice so the
    // player remembers to remove the corresponding Imperial ship.
    const dynamicAllies: Squadron[] = [];
    const noticesById = new Map<string, string>();
    for (const o of outcomes) {
      const a = o.decision.allySpawn;
      if (!a) continue;
      const sourceUpgrades = a.upgradesFromSquadName
        ? squadrons.find((sq) => sq.scenarioMeta?.squadName === a.upgradesFromSquadName)
            ?.upgrades ?? []
        : [];
      const ally = spawnAllyDynamic(a.ship, nextRound, sourceUpgrades);
      dynamicAllies.push(ally);
      if (a.instructions) {
        noticesById.set(ally.id, a.instructions);
      }
    }
    const allNew = [...autoSpawned, ...dynamicSpawned, ...dynamicAllies];
    // Mark one-shot handlers that fired as resolved. A handler counts as
    // having fired if EITHER the Imperial-spawn flag flipped to true OR an
    // ally was injected via allySpawn (the Defector flow uses the latter).
    setResolvedDynamicSquads((prev) => {
      const set = new Set(prev);
      for (const o of outcomes) {
        const squad = activeScenario.squads.find((s) => s.name === o.squadName);
        if (!squad) continue;
        const tag = hasTag(squad, 'dynamicSpawn');
        if (!tag) continue;
        const handler = findHandler(tag.handler);
        if (!handler || handler.recurring) continue;
        const fired = o.decision.spawn || o.decision.allySpawn !== undefined;
        if (fired) set.add(o.squadName);
      }
      return set;
    });
    setSquadrons((prev) => [...prev, ...allNew]);
    setMode((m) => bumpRound(m, nextRound));
    if (allNew.length > 0) {
      setPendingArrivals(arrivalsFromSquadrons(allNew, noticesById));
    }
  }

  function handleNextRound() {
    if (!activeScenario) {
      setFreePlayRound((r) => r + 1);
      return;
    }
    const pending = collectPendingHandlers(activeScenario);
    if (pending.length > 0) {
      setPendingHandlers(pending);
      return;
    }
    performRoundAdvance([]);
  }

  function handleDynamicSpawnSubmit(outcomes: readonly HandlerOutcome[]) {
    setPendingHandlers([]);
    performRoundAdvance(outcomes);
  }

  function handleEndScenarioClick() {
    setShowEndScenario(true);
  }

  function handleEndScenarioCancel() {
    setShowEndScenario(false);
    setSquadrons([]);
    setResolvedDynamicSquads(new Set<string>());
    if (mode.kind === 'campaign') {
      // Cancel returns to deck-pick (active campaign continues).
      setMode({ kind: 'campaign', campaignId: mode.campaignId, phase: 'deckPick', mission: null });
    } else {
      setMode(FREE_PLAY);
    }
  }

  /** Pick a mission from the active campaign's deck. */
  function handleDeckPick(missionId: string) {
    if (mode.kind !== 'campaign') return;
    void updateCampaign((c) => pickMission(c, missionId));
    const mission: MissionState = {
      scenarioId: missionId,
      phase: { kind: 'briefing', briefingMode: 'start' },
    };
    setMode({
      kind: 'campaign',
      campaignId: mode.campaignId,
      phase: 'mission',
      mission,
    });
  }

  function handleEndScenarioResolve(kind: EndOutcomeKind) {
    if (!activeScenario) return;
    const outcome = kind === 'victory' ? activeScenario.victory : activeScenario.defeat;
    const scenarioId = activeScenario.id;

    setShowEndScenario(false);
    setSquadrons([]);
    setResolvedDynamicSquads(new Set<string>());

    // Campaign mode: route through applyOutcome and persist. Mode transition
    // depends on the campaign's resulting state (deckPick / continued briefing
    // / ended).
    if (mode.kind === 'campaign') {
      const campaignId = mode.campaignId;
      void updateCampaign((c) =>
        applyOutcome(c, scenarioId, kind, outcome),
      ).then((updated) => {
        if (!updated) return;
        // Determine next phase from outcome + resulting status.
        if (updated.status !== 'active') {
          setMode({
            kind: 'campaign',
            campaignId,
            phase: 'mission',
            mission: { scenarioId, phase: { kind: 'ended' } },
          });
          return;
        }
        switch (outcome.next.kind) {
          case 'arcLink':
          case 'replay': {
            // Stage the next briefing — arcLink names the next mission;
            // replay re-stages the same one.
            const targetId = outcome.next.kind === 'arcLink' ? outcome.next.missionId : scenarioId;
            const mission: MissionState = {
              scenarioId: targetId,
              phase: { kind: 'briefing', briefingMode: 'start' },
            };
            setMode({
              kind: 'campaign',
              campaignId,
              phase: 'mission',
              mission,
            });
            // Mark the campaign's currentMissionId so resume picks up here.
            void updateCampaign((c) => ({ ...c, currentMissionId: targetId }));
            return;
          }
          case 'arcDiscard':
          case 'reshuffle':
          case 'campaignStart':
          case 'campaignEnd':
            // Back to deck-pick — applyOutcome already mutated the deck.
            setMode({ kind: 'campaign', campaignId, phase: 'deckPick', mission: null });
            return;
          default: {
            const _exhaustive: never = outcome.next;
            void _exhaustive;
            return;
          }
        }
      });
      return;
    }

    // Scenario-only mode: ship introductions don't carry forward (no
    // campaign state to track them). The mission outcome just routes to
    // the next mission's briefing or back to free play.
    switch (outcome.next.kind) {
      case 'arcLink': {
        const target = findScenario(outcome.next.missionId);
        if (target) {
          setMode({
            kind: 'scenarioOnly',
            mission: {
              scenarioId: target.id,
              phase: { kind: 'briefing', briefingMode: 'start' },
            },
          });
          return;
        }
        break;
      }
      case 'replay':
        setMode({
          kind: 'scenarioOnly',
          mission: {
            scenarioId,
            phase: { kind: 'briefing', briefingMode: 'start' },
          },
        });
        return;
      case 'arcDiscard':
      case 'reshuffle':
      case 'campaignStart':
      case 'campaignEnd':
        break;
      default: {
        const _exhaustive: never = outcome.next;
        void _exhaustive;
      }
    }
    setMode(FREE_PLAY);
  }

  function handleSquadRemoval(index: number) {
    tallyDestroyedEnemy(squadrons[index]?.ships.length ?? 0, index);
    setSquadrons((prev) => prev.filter((_, i) => i !== index));
  }

  /** Add the destroyed enemy ships' full HP to the mission damage tally.
   * Removing an enemy mid-mission means the players blew it up, so its whole
   * hull+shield pool counts as damage dealt. No-op for allies or outside an
   * active mission. */
  function tallyDestroyedEnemy(shipCount: number, squadId: number) {
    if (shipCount <= 0) return;
    if (getActiveMission(mode)?.phase.kind !== 'active') return;
    const squad = squadrons[squadId];
    if (!isEnemySquad(squad)) return;
    setDestroyedEnemyHp((d) => d + squadShipMaxHp(squad) * shipCount);
  }

  function handleSetUpgradesSource(index: number, upgradesSource: UpgradeSource) {
    setSquadrons((prev) => {
      const next = [...prev];
      const squad = next[index];
      if (!squad.rollMeta) return prev;
      const { upgrades: newUpgrades, rollMeta } = getUpgrades(
        squad.shipType,
        playersRank,
        upgradesSource,
        squad.isElite,
      );
      next[index] = {
        ...squad,
        upgrades: newUpgrades,
        rollMeta,
        ships: resetHullShieldDelta(squad.upgrades, newUpgrades, squad.ships),
      };
      return next;
    });
  }

  function handleSetPlayersRank(newRank: number) {
    setSquadrons((prev) =>
      prev.map((squad) => {
        // Mission-fixed and ally squads don't re-roll on rank change.
        if (!squad.rollMeta) return squad;
        const { upgrades: newUpgrades, rollMeta } = getUpgrades(
          squad.shipType,
          newRank,
          squad.rollMeta.source,
          squad.isElite,
        );
        return {
          ...squad,
          upgrades: newUpgrades,
          rollMeta,
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
      if (!squad.rollMeta) {
        // Mission-fixed / ally: flip the flag but don't re-roll.
        next[index] = { ...squad, isElite };
        return next;
      }
      const { upgrades: newUpgrades, rollMeta } = getUpgrades(
        squad.shipType,
        playersRank,
        squad.rollMeta.source,
        isElite,
      );
      next[index] = {
        ...squad,
        isElite,
        upgrades: newUpgrades,
        rollMeta,
        ships: resetHullShieldDelta(squad.upgrades, newUpgrades, squad.ships),
      };
      return next;
    });
  }

  function handleAddShip(squadId: number) {
    setSquadrons((prev) => {
      const next = [...prev];
      const squad = next[squadId];
      const extras = countExtraHullAndShield(squad.upgrades);
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
    tallyDestroyedEnemy(1, squadId);
    setSquadrons((prev) => {
      const next = [...prev];
      const squad = next[squadId];
      next[squadId] = { ...squad, ships: squad.ships.filter((_, i) => i !== shipIndex) };
      return next;
    });
  }

  function handleShipChange(ship: ShipInstance, shipIndex: number, squadId: number) {
    setSquadrons((prev) => {
      const next = [...prev];
      const squad = next[squadId];
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
          // Always exposed: the AI engine + upgrade source are now picked
          // globally in the New / Load / Campaign-setup modals (no longer
          // a per-squad toggle), so every squad on the board reads the
          // same values regardless of free-play vs scenario vs campaign mode.
          scenarioAiEngine,
          scenarioUpgradesSource,
        }}
      >
        <ShipHandlingContext.Provider
          value={{ squadrons, handleAddShip, handleShipRemoval: handleRemoveShip, handleShipChange }}
        >
          <div className="row menu d-flex align-items-center">
            <div className="col-auto">
              <MainMenu
                onNewClick={() => { setShowNewGamePicker(true); }}
                onOpenClick={() => { setShowOpenBrowser(true); }}
                onLoadScenarioClick={() => { setShowScenarioPicker(true); }}
                onMissionMapsClick={() => { setShowMissionMapsGallery(true); }}
                onLogoutClick={() => {
                  // Stub: the app has no auth today. Will be wired to OAuth + Neon later.
                  alert('Logout will be available once accounts land. Close the tab to end your session.');
                }}
              />
            </div>
            {mode.kind === 'campaign' && activeCampaign ? (
              <div className="col-auto menu-text">
                <span className="font-weight-bold">{activeCampaign.name}</span>
                <span className="ml-2 small menu-text-dim">
                  Rebel VP {activeCampaign.rebelPoints.toString()} ·
                  {' '}Imperial VP {activeCampaign.imperialPoints.toString()} ·
                  {' '}{activeCampaign.completedArcs.length.toString()} arcs done
                </span>
              </div>
            ) : null}
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
                <div className="col-auto menu-text small menu-text-dim">
                  {playerCount.toString()} player{playerCount === 1 ? '' : 's'} of rank {playersRank.toString()}
                </div>
                <div className="col-auto d-flex align-items-center">
                  <span className="mr-2">Round:</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-counter"
                    style={{ backgroundColor: '#0062cc', borderColor: '#005cbf' }}
                    aria-label="Decrease round"
                    onClick={() => { setFreePlayRound((r) => Math.max(1, r - 1)); }}
                  >
                    −
                  </button>
                  <span className="counterValue" style={{ margin: '0 10px' }}>{freePlayRound}</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-counter"
                    style={{ backgroundColor: '#0062cc', borderColor: '#005cbf' }}
                    aria-label="Increase round"
                    onClick={() => { setFreePlayRound((r) => r + 1); }}
                  >
                    +
                  </button>
                </div>
              </>
            )}
          </div>
          {mode.kind === 'campaign' && mode.phase === 'deckPick' && activeCampaign ? (
            <DeckPickView campaign={activeCampaign} onPickMission={handleDeckPick} />
          ) : (
            <SquadGenerator squadrons={squadrons} onAddShip={handleNewShipSelection} />
          )}
          <LoadScenarioModal
            show={showScenarioPicker}
            ownedModels={effectiveSettings.ownedModels}
            playerCount={playerCount}
            playersRank={playersRank}
            aiEngine={scenarioAiEngine}
            upgradesSource={scenarioUpgradesSource}
            onPlayerCountChange={setPlayerCount}
            onPlayersRankChange={handleSetPlayersRank}
            onAiEngineChange={setScenarioAiEngine}
            onUpgradesSourceChange={handleScenarioUpgradesSourceChange}
            onHide={() => { setShowScenarioPicker(false); }}
            onSelect={handlePickerSelect}
          />
          <DynamicSpawnPromptModal
            show={pendingHandlers.length > 0}
            pending={pendingHandlers}
            onSubmit={handleDynamicSpawnSubmit}
            onCancel={() => { setPendingHandlers([]); }}
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
              onHide={handleHideBriefing}
            />
          ) : null}
          {activeScenario && showEndScenario ? (
            <EndScenarioModal
              show={true}
              scenario={activeScenario}
              damageDealt={destroyedEnemyHp + survivingEnemyDamage(squadrons)}
              onResolve={handleEndScenarioResolve}
              onClose={handleEndScenarioCancel}
            />
          ) : null}
          <ArrivalNotificationModal
            arrivals={pendingArrivals}
            onClose={() => { setPendingArrivals([]); }}
          />
          <NewGamePickerModal
            show={showNewGamePicker}
            onClose={() => { setShowNewGamePicker(false); }}
            onPickCampaign={() => { setShowCampaignSetup(true); }}
            onPickScenario={() => {
              setShowScenarioPicker(true);
            }}
            onPickFreePlay={() => {
              setMode(FREE_PLAY);
              setSquadrons([]);
              setFreePlayRound(1);
            }}
          />
          <CampaignSetupModal
            show={showCampaignSetup}
            aiEngine={scenarioAiEngine}
            upgradesSource={scenarioUpgradesSource}
            onAiEngineChange={setScenarioAiEngine}
            onUpgradesSourceChange={handleScenarioUpgradesSourceChange}
            onClose={() => { setShowCampaignSetup(false); }}
            onCreated={(campaignId) => {
              setSquadrons([]);
              setFreePlayRound(1);
              setResolvedDynamicSquads(new Set<string>());
              setMode({
                kind: 'campaign',
                campaignId,
                phase: 'deckPick',
                mission: null,
              });
            }}
          />
          <OpenCampaignModal
            show={showOpenBrowser}
            onClose={() => { setShowOpenBrowser(false); }}
            onResume={(id) => {
              // Resume into the right phase. If a mission was in progress
              // when last saved we drop back to its briefing (active mid-mission
              // state isn't persisted — that's a deliberate scope boundary).
              setSquadrons([]);
              setResolvedDynamicSquads(new Set<string>());
              void campaignStore.load(id).then((c) => {
                if (!c) return;
                if (c.currentMissionId !== null) {
                  const mission: MissionState = {
                    scenarioId: c.currentMissionId,
                    phase: { kind: 'briefing', briefingMode: 'start' },
                  };
                  setMode({
                    kind: 'campaign',
                    campaignId: id,
                    phase: 'mission',
                    mission,
                  });
                } else {
                  setMode({
                    kind: 'campaign',
                    campaignId: id,
                    phase: 'deckPick',
                    mission: null,
                  });
                }
              });
            }}
          />
          <MissionMapsGalleryModal
            show={showMissionMapsGallery}
            onHide={() => { setShowMissionMapsGallery(false); }}
            onPick={(id) => { setGalleryBriefingScenarioId(id); }}
          />
        </ShipHandlingContext.Provider>
      </GlobalSquadsValuesContext.Provider>
    </div>
  );
}

function resetHullShieldDelta(
  previousUpgrades: readonly Upgrade[],
  newUpgrades: readonly Upgrade[],
  ships: readonly ShipInstance[],
): ShipInstance[] {
  const previous = countExtraHullAndShield(previousUpgrades);
  const next = countExtraHullAndShield(newUpgrades);
  return ships.map((s) => ({
    ...s,
    hull: s.hull + next.extraHull - previous.extraHull,
    shields: s.shields + next.extraShield - previous.extraShield,
  }));
}

export default App;
