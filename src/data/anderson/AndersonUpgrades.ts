/**
 * Anderson upgrade variant trees per ship.
 *
 * Source: `docs/anderson/AI_Alternative_Empire_PILOTCARDS_4x.pdf`
 * (2x deck pending). Each variant on a printed card is exactly 1 Basic +
 * 5 Elite rows; the tuple type on `elite` pins this at compile time so a
 * missing or extra slot becomes a type error rather than a runtime drift.
 *
 * Multiple elite rows may share an initiative threshold (rendered on the
 * physical card as a visually-grouped "tier" — e.g. p-02 #1 has two rows
 * at init 6: Targeting Matrix + Seventh Sister). The data is flat; the
 * grouping is purely a presentation concern.
 *
 * Initiative gating: `getAndersonUpgrades(variant, imperialInitiative)`
 * returns `basic` plus all elite rows where `row.initiative <= imperialInitiative`.
 * **No `playersRank` is consulted** (see DATA-LAYER.md §6 and AGENTS.md).
 *
 * The printed cards carry a second left-side "diamond" badge with FGA-style
 * XP/rank info (e.g. `3 / IN5+`). That is ignored by the Anderson engine —
 * only the right-side orange initiative circle is encoded here.
 */

import type { AndersonUpgradeRow } from '../UpgradeRow';
import { andersonRow } from '../UpgradeRow';
import type { ShipId } from '../Ships';
import { AndersonUpgradePool as U } from './AndersonUpgradePool';

export interface AndersonVariant {
  /**
   * One or more upgrades available from squad creation, all gated at the
   * same initiative threshold. Most TIE variants have a single basic; the
   * TIE/sa Bomber pairs a weapon + a device in the basic slot; some
   * TIE/rb Heavy variants stack three (weapon + assist + Elusive).
   */
  readonly basic: readonly AndersonUpgradeRow[];
  /**
   * Elite upgrades unlocked by initiative threshold. The deck's overall
   * pattern is 5 elite rows per card, but at least one variant (TIE
   * Advanced v1 p-20 #1) has 6 — the Extra Munitions modifier shares
   * an init tier with Shield Upgrade. Variable-length keeps the data
   * faithful to the source.
   */
  readonly elite: readonly AndersonUpgradeRow[];
}

export type AndersonShipVariants = readonly AndersonVariant[];

const r = andersonRow;

// ── TIE/in Interceptor — 4x deck pages 2-3 (8 variants) ────────────
const TIEIN_VARIANTS: AndersonShipVariants = [
  // p-02 #1 — init groups: 1 / 4,4 / 5 / 6,6
  {
    basic: [r(U.autothrusters, 1), r(U.hullUpgrade, 1)],
    elite: [
      r(U.shieldUpgrade, 4),
      r(U.vultSkerris, 4),
      r(U.turrPhennir, 5),
      r(U.targetingMatrix, 6),
      r(U.seventhSister, 6),
    ],
  },
  // p-02 #2 — init groups: 1 / 4,4 / 5 / 6,6
  {
    basic: [r(U.autothrusters, 1), r(U.hullUpgrade, 1)],
    elite: [
      r(U.shieldUpgrade, 4),
      r(U.sapphire2, 4),
      r(U.whisper, 5),
      r(U.elusive, 6),
      r(U.pureSabacc, 6),
    ],
  },
  // p-02 #3 — init groups: 1 / 4,4 / 5 / 6,6
  {
    basic: [r(U.autothrusters, 1), r(U.targetingComputer, 1)],
    elite: [
      r(U.stealthDevice, 4),
      r(U.idenVersio, 4),
      r(U.nightBeast, 5),
      r(U.outmaneuver, 6),
      r(U.moffGideon, 6),
    ],
  },
  // p-02 #4 — init groups: 1 / 4,4 / 5 / 6,6 — matches DATA-LAYER.md §12.2
  {
    basic: [r(U.autothrusters, 1), r(U.stealthDevice, 1)],
    elite: [
      r(U.squadLeader, 4),
      r(U.lieutenantSai, 4),
      r(U.delMeeko, 5),
      r(U.commandantGoran, 6),
      r(U.nashWindrider, 6),
    ],
  },
  // p-03 #1 — init groups: 1 / 4,4 / 5 / 6,6
  {
    basic: [r(U.autothrusters, 1), r(U.stealthDevice, 1)],
    elite: [
      r(U.hullUpgrade, 4),
      r(U.outmaneuver, 4),
      r(U.maulerMithel, 5),
      r(U.rearAdmiralChiraneau, 6),
      r(U.colonelJendonAttack, 6),
    ],
  },
  // p-03 #2 — init groups: 1 / 4,4 / 5 / 6,6
  {
    basic: [r(U.autothrusters, 1), r(U.shieldUpgrade, 1)],
    elite: [
      r(U.fuelInjectionOverride, 4),
      r(U.outmaneuver, 4),
      r(U.lieutenantHebsly, 5),
      r(U.turrPhennir, 6),
      r(U.lieutenantLorrir, 6),
    ],
  },
  // p-03 #3 — init groups: 1 / 4,4 / 5 / 6,6
  {
    basic: [r(U.autothrusters, 1), r(U.targetingComputer, 1)],
    elite: [
      r(U.shieldUpgrade, 4),
      r(U.soontirFel, 4),
      r(U.feedbackEmitter, 5),
      r(U.apexPredator, 6),
      r(U.blankSignature, 6),
    ],
  },
  // p-03 #4 — init groups: 1 / 4,4 / 5 / 6,6
  {
    basic: [r(U.autothrusters, 1), r(U.stealthDevice, 1)],
    elite: [
      r(U.hullUpgrade, 4),
      r(U.daredevil, 4),
      r(U.sensorJammer, 5),
      r(U.countdown, 6),
      r(U.maulerMithel, 6),
    ],
  },
];

// ── TIE Advanced x1 — 4x deck page 4 (4 variants) ──────────────────
const TIEADVX_VARIANTS: AndersonShipVariants = [
  // p-04 #1 — init groups: 2 / 4,4 / 5 / 6,6
  {
    basic: [r(U.advancedTargetingComputer, 2), r(U.advancedSensors, 2)],
    elite: [
      r(U.clusterMissiles, 4),
      r(U.intimidation, 4),
      r(U.idenVersioFuse, 5),
      r(U.majorRhymerCluster, 6),
      r(U.maulerMithel, 6),
    ],
  },
  // p-04 #2 — init groups: 2 / 4,4 / 5 / 6,6
  {
    basic: [r(U.advancedTargetingComputer, 2), r(U.sensorJammer, 2)],
    elite: [
      r(U.shieldUpgrade, 4),
      r(U.elusive, 4),
      r(U.maarekStele, 5),
      r(U.turrPhennir, 6),
      r(U.whisper, 6),
    ],
  },
  // p-04 #3 — init groups: 2 / 4,4 / 5 / 6,6
  {
    basic: [r(U.advancedTargetingComputer, 2), r(U.passiveSensors, 2)],
    elite: [
      r(U.stealthDevice, 4),
      r(U.swarmTactics, 4),
      r(U.squadLeader, 5),
      r(U.flightLeaderUbbel, 6),
      r(U.howlrunner, 6),
    ],
  },
  // p-04 #4 — init groups: 2 / 4,4 / 5 / 6,6
  {
    basic: [r(U.advancedTargetingComputer, 2), r(U.collisionDetector, 2)],
    elite: [
      r(U.shieldUpgrade, 4),
      r(U.outmaneuver, 4),
      r(U.junoEclipse, 5),
      r(U.vedFoslo, 6),
      r(U.majorVermeil, 6),
    ],
  },
];

// ── TIE/sa Bomber — 4x deck pages 5-6 (8 variants) ─────────────────
// Each card has TWO basic-slot upgrades (a weapon + a device) plus 5
// elite rows. Both basics gate at init 2.
const TIESA_VARIANTS: AndersonShipVariants = [
  // p-05 #1 — APT + Thermal Detonators / classic torpedo bomber
  {
    basic: [r(U.nimbleBomber, 2), r(U.advancedProtonTorpedoes, 2), r(U.thermalDetonators, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.extraMunitions, 3),
      r(U.skilledBombardier, 4),
      r(U.deathfireManeuver, 5),
      r(U.majorRhymerApt, 6),
    ],
  },
  // p-05 #2 — Proton Torpedoes + Conner Net
  {
    basic: [r(U.nimbleBomber, 2), r(U.protonTorpedoes, 2), r(U.connerNet, 2)],
    elite: [
      r(U.hullUpgrade, 3),
      r(U.ruthless, 3),
      r(U.shieldUpgrade, 4),
      r(U.deathfireDeathA, 5),
      r(U.moffGideon, 6),
    ],
  },
  // p-05 #3 — Homing Missiles + Proximity Mines
  {
    basic: [r(U.nimbleBomber, 2), r(U.homingMissiles, 2), r(U.proximityMines, 2)],
    elite: [
      r(U.whisper, 3),
      r(U.shieldUpgrade, 3),
      r(U.extraMunitions, 4),
      r(U.zertikStrom, 5),
      r(U.rexlerBrath, 6),
    ],
  },
  // p-05 #4 — Multi-Missile Pods + Cluster Mines
  {
    basic: [r(U.nimbleBomber, 2), r(U.multiMissilePods, 2), r(U.clusterMines, 2)],
    elite: [
      r(U.targetAssistAlgorithm, 3),
      r(U.elusive, 3),
      r(U.afterburnersFocus, 4),
      r(U.tiberSaxon, 5),
      r(U.majorRhymerMmp, 6),
    ],
  },
  // p-06 #1 — Concussion Missiles + Electro-Chaff Missiles
  {
    basic: [r(U.nimbleBomber, 2), r(U.concussionMissiles, 2), r(U.electroChaffMissiles, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.saturationSalvo, 3),
      r(U.deathrain, 4),
      r(U.trickShot, 5),
      r(U.bt1, 6),
    ],
  },
  // p-06 #2 — Barrage Rockets + Seismic Charges (or Proton Bombs)
  {
    basic: [r(U.nimbleBomber, 2), r(U.barrageRockets, 2), r(U.seismicCharges, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.elusive, 3),
      r(U.tomaxBren, 4),
      r(U.deathfireDeathB, 5),
      r(U.captainJonus, 6),
    ],
  },
  // p-06 #3 — Ion Missiles + Ion Bombs
  {
    basic: [r(U.nimbleBomber, 2), r(U.ionMissiles, 2), r(U.ionBombs, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.elusive, 3),
      r(U.deathfireManeuver, 4),
      r(U.captainJonus, 5),
      r(U.colonelJendonLock, 6),
    ],
  },
  // p-06 #4 — Cluster Missiles + Proton Bombs
  {
    basic: [r(U.nimbleBomber, 2), r(U.clusterMissiles, 2), r(U.protonBombs, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.afterburnersBasic, 3),
      r(U.saturationSalvo, 4),
      r(U.redline, 5),
      r(U.majorRhymerCluster, 6),
    ],
  },
];

// ── TIE/ph Phantom — 4x deck page 7 (4 variants) ───────────────────
// Basic slot is single (init 3); elite tier pattern is 3,3 / 4 / 5 / 6.
const TIEPH_VARIANTS: AndersonShipVariants = [
  // p-07 #1
  {
    basic: [r(U.stygiumArray, 3), r(U.advancedSensors, 3)],
    elite: [
      r(U.tiberSaxon, 3),
      r(U.mausMonare, 3),
      r(U.elusive, 4),
      r(U.ruthless, 5),
      r(U.maulerMithel, 6),
    ],
  },
  // p-07 #2
  {
    basic: [r(U.stygiumArray, 3), r(U.stealthDevice, 3)],
    elite: [
      r(U.juke, 3),
      r(U.advancedSensors, 3),
      r(U.rexlerBrathEvading, 4),
      r(U.gideonHask, 5),
      r(U.fifthBrother, 6),
    ],
  },
  // p-07 #3
  {
    basic: [r(U.stygiumArray, 3), r(U.afterburnersBasic, 3)],
    elite: [
      r(U.collisionDetector, 3),
      r(U.echo, 3),
      r(U.idenVersioFuse, 4),
      r(U.outmaneuver, 5),
      r(U.majorVynder, 6),
    ],
  },
  // p-07 #4
  {
    basic: [r(U.stygiumArray, 3), r(U.advancedSensors, 3)],
    elite: [
      r(U.stealthDevice, 3),
      r(U.whisper, 3),
      r(U.trickShot, 4),
      r(U.rexlerBrathEvading, 5),
      r(U.wampa, 6),
    ],
  },
];

// ── TIE/D Defender — 4x deck pages 8-9 (8 variants) ────────────────
// Page 8 = "Defender" base card. Page 9 = "Defender Elite" parallel card.
// Both share the TIEDEF ship key here; the AI engine card layer (separate
// pass) gets two `AiCard` entries per DATA-LAYER.md §7 option 1.
const TIEDEF_VARIANTS: AndersonShipVariants = [
  // ── p-08: TIE/D Defender (base) ───────────────────────────────
  // p-08 #1
  {
    basic: [r(U.fullThrottle, 1), r(U.heavyLaserCannon, 1)],
    elite: [
      r(U.collisionDetector, 3),
      r(U.soontirFel, 3),
      r(U.computerAssistedHandling, 4),
      r(U.scourgeSkutu, 5),
      r(U.captainFeroph, 6),
    ],
  },
  // p-08 #2
  {
    basic: [r(U.fullThrottle, 1), r(U.advancedSensors, 1)],
    elite: [
      r(U.outmaneuver, 3),
      r(U.lieutenantLorrirSimple, 3),
      r(U.fuelInjectionOverride, 4),
      r(U.mausMonareEvade, 5),
      r(U.turrPhennir, 6),
    ],
  },
  // p-08 #3
  {
    basic: [r(U.fullThrottle, 1), r(U.passiveSensors, 1)],
    elite: [
      r(U.afterburnersR1, 3),
      r(U.elusive, 3),
      r(U.hullUpgrade, 4),
      r(U.maarekStele, 5),
      r(U.gideonHask, 6),
    ],
  },
  // p-08 #4
  {
    basic: [r(U.fullThrottle, 1), r(U.fireControlSystem, 1)],
    elite: [
      r(U.hullUpgrade, 3),
      r(U.vultSkerris, 3),
      r(U.stealthDevice, 4),
      r(U.juke, 5),
      r(U.howlrunner, 6),
    ],
  },
  // ── p-09: TIE/D Defender Elite ─────────────────────────────────
  // Every Elite variant has the intrinsic "TIE Defender Elite" upgrade
  // as a second basic-slot row alongside the weapon. Squad must use
  // the TIE Defender Elite AI card (separate AiCard).
  // p-09 #1
  {
    basic: [r(U.advancedFireControl, 2), r(U.magPulseWarheads, 2), r(U.tieDefenderElite, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.fireControlSystem, 3),
      r(U.targetingMatrixEvade, 4),
      r(U.turrPhennirFinal, 5),
      r(U.wampaFirst, 6),
    ],
  },
  // p-09 #2
  {
    basic: [r(U.advancedFireControl, 2), r(U.jammingBeam, 2), r(U.tieDefenderElite, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.redline, 3),
      r(U.afterburnersR1Basic, 4),
      r(U.captainFerophVulnerable, 5),
      r(U.majorVermeil, 6),
    ],
  },
  // p-09 #3
  {
    basic: [r(U.advancedFireControl, 2), r(U.tractorBeam, 2), r(U.tieDefenderElite, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.stealthDevice, 3),
      r(U.ionManeuveringJet, 4),
      r(U.swarmTactics, 5),
      r(U.howlrunner, 6),
    ],
  },
  // p-09 #4
  {
    basic: [r(U.advancedFireControl, 2), r(U.ionCannon, 2), r(U.tieDefenderElite, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.vultSkerrisStrain, 3),
      r(U.stealthDevice, 4),
      r(U.rexlerBrath, 5),
      r(U.whisper, 6),
    ],
  },
];

// ── T-4a Lambda Class Shuttle — 4x deck pages 10-11 #1-2 (6 variants) ─
const LAMBDA_VARIANTS: AndersonShipVariants = [
  // p-10 #1
  {
    basic: [r(U.deathTroopers, 2)],
    elite: [
      r(U.captainOicunn, 3),
      r(U.intimidation, 3),
      r(U.isbSlicer, 4),
      r(U.zeroZeroZero, 5),
      r(U.admiralSloane, 6),
    ],
  },
  // p-10 #2
  {
    basic: [r(U.advancedSensors, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.captainDobbs, 3),
      r(U.captainFeroph, 4),
      r(U.flightLeaderUbbel, 5),
      r(U.nashWindrider, 6),
    ],
  },
  // p-10 #3
  {
    basic: [r(U.commsTeam, 2)],
    elite: [
      r(U.collisionDetector, 3),
      r(U.delMeeko, 3),
      r(U.swarmTactics, 4),
      r(U.commandantGoranLower, 5),
      r(U.howlrunner, 6),
    ],
  },
  // p-10 #4
  {
    basic: [r(U.st321, 2)],
    elite: [
      r(U.advancedSensors, 3),
      r(U.lieutenantSaiFocus, 3),
      r(U.redline, 4),
      r(U.zertikStromAuto, 5),
      r(U.directorKrennic, 6),
    ],
  },
  // p-11 #1
  {
    basic: [r(U.ionCannon, 2)],
    elite: [
      r(U.targetingComputer, 3),
      r(U.perceptiveCopilot, 3),
      r(U.seasonedNavigator, 4),
      r(U.migsMayfeld, 5),
      r(U.sapphire2, 6),
    ],
  },
  // p-11 #2
  {
    basic: [r(U.sensorJammer, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.elusive, 3),
      r(U.magnaTolvan, 4),
      r(U.captainKagi, 5),
      r(U.ministerTua, 6),
    ],
  },
];

// ── Sith Infiltrator — 4x deck p-11 #3-4 (2 variants) ──────────────
// Init range 3-7 (deck's only ship reaching init 7). Every elite slot
// adds force capacity via an "[Adds N force]" annotation.
const SITH_VARIANTS: AndersonShipVariants = [
  // p-11 #3
  {
    basic: [r(U.drk1ProbeDroids, 3)],
    elite: [
      r(U.hate, 4),
      r(U.elusive, 4),
      r(U.darthMaul, 5),
      r(U.shieldUpgrade, 6),
      r(U.seventhSisterTractor, 7),
    ],
  },
  // p-11 #4
  {
    basic: [r(U.drk1ProbeDroids, 3)],
    elite: [
      r(U.darthVader, 4),
      r(U.elusive, 4),
      r(U.fifthBrotherForce, 5),
      r(U.shieldUpgrade, 6),
      r(U.malice, 7),
    ],
  },
];

// ── VT-49 Decimator — 4x deck page 12 (4 variants) ─────────────────
const VT49_VARIANTS: AndersonShipVariants = [
  // p-12 #1
  {
    basic: [r(U.ministerTuaDamaged, 1)],
    elite: [
      r(U.trickShotLock, 3),
      r(U.redline, 3),
      r(U.thermalDetonators, 4),
      r(U.rearAdmiralChiraneauReinforce, 5),
      r(U.idenVersioFuse, 6),
    ],
  },
  // p-12 #2
  {
    basic: [r(U.deathTroopers, 1)],
    elite: [
      r(U.captainOicunn, 3),
      r(U.intimidation, 3),
      r(U.veteranTurretGunner, 4),
      r(U.seasonedNavigatorAttack, 5),
      r(U.dauntless, 6),
    ],
  },
  // p-12 #3
  {
    basic: [r(U.veteranTurretGunner, 1)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.swarmTactics, 3),
      r(U.ruthless, 4),
      r(U.howlrunner, 5),
      r(U.majorVermeil, 6),
    ],
  },
  // p-12 #4
  {
    basic: [r(U.veteranTurretGunner, 1)],
    elite: [
      r(U.mornaKee, 3),
      r(U.intimidation, 3),
      r(U.lytanDree, 4),
      r(U.rearAdmiralChiraneauReinforce, 5),
      r(U.dauntless, 6),
    ],
  },
];

// ── TIE/sk Striker — 4x deck page 13 (4 variants) ──────────────────
const TIESK_VARIANTS: AndersonShipVariants = [
  // p-13 #1
  {
    basic: [r(U.hullUpgrade, 1)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.turrPhennirDevice, 3),
      r(U.ruthless, 4),
      r(U.clusterMines, 5),
      r(U.deathfireDeathGeneric, 6),
    ],
  },
  // p-13 #2
  {
    basic: [r(U.shieldUpgrade, 1)],
    elite: [
      r(U.afterburnersBasic, 3),
      r(U.duchess, 3),
      r(U.outmaneuver, 4),
      r(U.proximityMines, 5),
      r(U.vagabond, 6),
    ],
  },
  // p-13 #3
  {
    basic: [r(U.hullUpgrade, 1)],
    elite: [
      r(U.targetingComputer, 3),
      r(U.vultSkerris, 3),
      r(U.pureSabacc, 4),
      r(U.bt1Simple, 5),
      r(U.ionBombs, 6),
    ],
  },
  // p-13 #4
  {
    basic: [r(U.stealthDevice, 1)],
    elite: [
      r(U.hullUpgrade, 3),
      r(U.jukeReplace, 3),
      r(U.countdown, 4),
      r(U.suppressiveGunner, 5),
      r(U.protonBombs, 6),
    ],
  },
];

// ── TIE Reaper — 4x deck page 14 (4 variants) ──────────────────────
const TIERP_VARIANTS: AndersonShipVariants = [
  // p-14 #1
  {
    basic: [r(U.tacticalOfficer, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.lieutenantSaiFocus, 3),
      r(U.ruthless, 4),
      r(U.perceptiveCopilot, 5),
      r(U.lieutenantKestal, 6),
    ],
  },
  // p-14 #2
  {
    basic: [r(U.deathTroopers, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.zeroZeroZero, 3),
      r(U.isbSlicer, 4),
      r(U.majorVermeil, 5),
      r(U.soontirFel, 6),
    ],
  },
  // p-14 #3
  {
    basic: [r(U.tacticalOfficer, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.cienaRee, 3),
      r(U.darkCurse, 4),
      r(U.swarmTactics, 5),
      r(U.scythe6, 6),
    ],
  },
  // p-14 #4
  {
    basic: [r(U.agentKallus, 2)],
    elite: [
      r(U.targetingComputerHunted, 3),
      r(U.countdown, 3),
      r(U.electronicBaffle, 4),
      r(U.elusive, 5),
      r(U.grandMoffTarkin, 6),
    ],
  },
];

// ── TIE/rb Heavy — 4x deck page 15 (4 variants) ────────────────────
// Card uses both a primary weapon and an "MGK-300" assist module in the
// basic slot. Some variants stack 3 basics (weapon + assist + Elusive).
const TIERBH_VARIANTS: AndersonShipVariants = [
  // p-15 #1
  {
    basic: [r(U.ionCannon, 2), r(U.targetAssistMgk300, 2)],
    elite: [
      r(U.hullUpgrade, 3),
      r(U.elusive, 3),
      r(U.redline, 4),
      r(U.majorVermeil, 5),
      r(U.valenRudor, 6),
    ],
  },
  // p-15 #2
  {
    basic: [r(U.syncedLaserCannons, 2), r(U.targetAssistMgk300, 2)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.elusive, 3),
      r(U.hullUpgrade, 4),
      r(U.lytanDree, 5),
      r(U.vultSkerrisOptional, 6),
    ],
  },
  // p-15 #3 — three-basic-row card
  {
    basic: [
      r(U.heavyLaserCannon, 2),
      r(U.maneuverAssistMgk300, 2),
      r(U.elusive, 2),
    ],
    elite: [
      r(U.hullUpgrade, 3),
      r(U.computerAssistedHandling, 3),
      r(U.soontirFel, 4),
      r(U.captainFeroph, 5),
      r(U.colonelJendonNoShield, 6),
    ],
  },
  // p-15 #4 — three-basic-row card
  {
    basic: [
      r(U.autoblasters, 2),
      r(U.maneuverAssistMgk300, 2),
      r(U.elusive, 2),
    ],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.computerAssistedHandlingLock, 3),
      r(U.rampage, 4),
      r(U.tiberSaxon, 5),
      r(U.tomaxBren, 6),
    ],
  },
];

// ── TIE/ca Punisher — 4x deck page 16 (4 variants) ─────────────────
// Two-row basic slot (weapon + device) like the Bomber, but with higher
// charge capacities. Note: card prints "TIE/ca Punisher"; ShipId is TIECP.
const TIECP_VARIANTS: AndersonShipVariants = [
  // p-16 #1
  {
    basic: [
      r(U.concussionMissilesPunisher, 2),
      r(U.electroChaffMissilesPunisher, 2),
    ],
    elite: [
      r(U.advancedSensors, 3),
      r(U.shieldUpgrade, 3),
      r(U.advancedProtonTorpedoesPunisher, 4),
      r(U.elusive, 5),
      r(U.magnaTolvan, 6),
    ],
  },
  // p-16 #2
  {
    basic: [
      r(U.barrageRocketsPunisher, 2),
      r(U.seismicChargesPunisher, 2),
    ],
    elite: [
      r(U.captainHark, 3),
      r(U.shieldUpgrade, 3),
      r(U.elusive, 4),
      r(U.captainJonus, 5),
      r(U.fifthBrother, 6),
    ],
  },
  // p-16 #3
  {
    basic: [
      r(U.magPulseWarheadsPunisher, 2),
      r(U.concussionBombs, 2),
    ],
    elite: [
      r(U.trajectorySimulator, 3),
      r(U.ablativePlating, 3),
      r(U.captainFeroph, 4),
      r(U.deathrain, 5),
      r(U.whisper, 6),
    ],
  },
  // p-16 #4
  {
    basic: [
      r(U.protonTorpedoesPunisher, 2),
      r(U.thermalDetonatorsPunisher, 2),
    ],
    elite: [
      r(U.advancedSensors, 3),
      r(U.shieldUpgrade, 3),
      r(U.elusive, 4),
      r(U.redline, 5),
      r(U.zertikStromPriority, 6),
    ],
  },
];

// ── TIE/ag Aggressor — 4x deck page 17 (4 variants) ────────────────
// All cards pair a primary weapon with either Ion Cannon Turret or
// Dorsal Turret as the second basic-slot row.
const TIERBA_VARIANTS: AndersonShipVariants = [
  // p-17 #1
  {
    basic: [r(U.homingMissilesAggressor, 1), r(U.ionCannonTurret, 1)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.whisper, 3),
      r(U.redline, 4),
      r(U.magnaTolvan, 5),
      r(U.rexlerBrath, 6),
    ],
  },
  // p-17 #2
  {
    basic: [r(U.multiMissilePodsAggressor, 1), r(U.ionCannonTurret, 1)],
    elite: [
      r(U.hullUpgrade, 3),
      r(U.elusive, 3),
      r(U.majorRhymerMmp, 4),
      r(U.doubleEdge, 5),
      r(U.trickShotLockAndAttacks, 6),
    ],
  },
  // p-17 #3
  {
    basic: [r(U.barrageRockets, 1), r(U.dorsalTurret, 1)],
    elite: [
      r(U.shieldUpgrade, 3),
      r(U.elusive, 3),
      r(U.stealthDevice, 4),
      r(U.lieutenantKestal, 5),
      r(U.howlrunner, 6),
    ],
  },
  // p-17 #4
  {
    basic: [r(U.clusterMissiles, 1), r(U.dorsalTurret, 1)],
    elite: [
      r(U.majorRhymerCluster, 3),
      r(U.shieldUpgrade, 3),
      r(U.elusive, 4),
      r(U.idenVersioFuse, 5),
      r(U.saturationSalvo, 6),
    ],
  },
];

// ── Alpha Class Starwing — 4x deck pages 18-19 (8 variants) ────────
// Init range 3-6. Unlike most cards (1 basic + 5 elite), each Starwing
// card is 2 basic rows + only 4 elite rows. Every card pairs a primary
// weapon with one of two configuration loadouts (Os-1 = missile-focused;
// Xg-1 = cannon-focused).
// NB: the 4x deck prints the top elite tier at init 7; the 2x deck
// (verified 2026-06-05) prints it at init 6 — this data follows the 2x
// deck. Neither deck has a 5th elite row (an earlier transcription added
// a phantom Shield Upgrade/Elusive at init 7; removed 2026-06-05).
const STARWING_VARIANTS: AndersonShipVariants = [
  // p-18 #1
  {
    basic: [r(U.concussionMissilesStarwing, 3), r(U.os1ArsenalLoadout, 3)],
    elite: [
      r(U.collisionDetector, 4),
      r(U.doubleEdgeBonusPrimary, 5),
      r(U.whisper, 6),
      r(U.darkCurse, 6),
    ],
  },
  // p-18 #2
  {
    basic: [r(U.protonTorpedoesStarwing, 3), r(U.os1ArsenalLoadout, 3)],
    elite: [
      r(U.elusive, 4),
      r(U.maarekStele, 5),
      r(U.majorRhymerProtonTorpedo, 6),
      r(U.captainJonus, 6),
    ],
  },
  // p-18 #3
  {
    basic: [r(U.multiMissilePodsAggressor, 3), r(U.os1ArsenalLoadout, 3)],
    elite: [
      r(U.shieldUpgrade, 4),
      r(U.majorRhymerMmp, 5),
      r(U.trickShotLockAndAttacks, 6),
      r(U.idenVersioFuse, 6),
    ],
  },
  // p-18 #4
  {
    basic: [r(U.diamondBoronMissiles, 3), r(U.os1ArsenalLoadout, 3)],
    elite: [
      r(U.elusive, 4),
      r(U.ruthless, 5),
      r(U.whisperEvadeAction, 6),
      r(U.wampa, 6),
    ],
  },
  // p-19 #1
  {
    basic: [r(U.ionCannon, 3), r(U.xg1AssaultConfiguration, 3)],
    elite: [
      r(U.pureSabacc, 4),
      r(U.shieldUpgrade, 5),
      r(U.majorVynderDisarmed, 6),
      r(U.flightLeaderUbbel, 6),
    ],
  },
  // p-19 #2
  {
    basic: [r(U.heavyLaserCannonStop, 3), r(U.xg1AssaultConfiguration, 3)],
    elite: [
      r(U.soontirFel, 4),
      r(U.collisionDetector, 5),
      r(U.targetAssistAlgorithmManeuver, 6),
      r(U.yricaQuell, 6),
    ],
  },
  // p-19 #3
  {
    basic: [r(U.syncedLaserCannons, 3), r(U.xg1AssaultConfiguration, 3)],
    elite: [
      r(U.outmaneuverStop, 4),
      r(U.elusive, 5),
      r(U.collisionDetector, 6),
      r(U.soontirFel, 6),
    ],
  },
  // p-19 #4
  {
    basic: [r(U.autoblastersStop, 3), r(U.xg1AssaultConfiguration, 3)],
    elite: [
      r(U.scythe6, 4),
      r(U.vedFosloStarwing, 5),
      r(U.captainOicunnRange, 6),
      r(U.collisionDetector, 6),
    ],
  },
];

// ── TIE Advanced v1 — 4x deck page 20 (4 variants) ─────────────────
// Force-using ship (init 3-6). One variant (p-20 #1) breaks the 5-elite
// pattern with 6 rows — the per-weapon Extra Munitions modifier shares
// an init tier with Shield Upgrade.
const TIEADVV1_VARIANTS: AndersonShipVariants = [
  // p-20 #1 — 6 elite rows (Extra Munitions modifier inside)
  {
    basic: [r(U.instinctiveAim, 3), r(U.advancedSensors, 3)],
    elite: [
      r(U.protonRockets, 3),
      r(U.majorRhymerProtonRockets, 3),
      r(U.extremeManeuvers, 4),
      r(U.shieldUpgrade, 5),
      r(U.extraMunitionsProtonRockets, 5),
      r(U.predictiveShot, 6),
    ],
  },
  // p-20 #2
  {
    basic: [r(U.instinctiveAim, 3), r(U.advancedSensors, 3)],
    elite: [
      r(U.hullUpgrade, 3),
      r(U.grandInquisitorOffense, 3),
      r(U.supernaturalReflexes, 4),
      r(U.shieldUpgrade, 5),
      r(U.grandInquisitorDefense, 6),
    ],
  },
  // p-20 #3
  {
    basic: [r(U.instinctiveAim, 3), r(U.concussionMissilesAdvV1, 3)],
    elite: [
      r(U.hullUpgrade, 3),
      r(U.fireControlSystem, 3),
      r(U.extremeManeuversSimple, 4),
      r(U.shieldUpgrade, 5),
      r(U.darthVaderForce, 6),
    ],
  },
  // p-20 #4
  {
    basic: [r(U.instinctiveAim, 3), r(U.magPulseWarheads, 3)],
    elite: [
      r(U.hullUpgrade, 3),
      r(U.collisionDetectorBarrel, 3),
      r(U.hate, 4),
      r(U.shieldUpgrade, 5),
      r(U.fifthBrotherForce, 6),
    ],
  },
];

export const AndersonUpgrades: Readonly<Partial<Record<ShipId, AndersonShipVariants>>> =
  Object.freeze({
    TIEIN: TIEIN_VARIANTS,
    TIEADVX: TIEADVX_VARIANTS,
    TIESA: TIESA_VARIANTS,
    TIEPH: TIEPH_VARIANTS,
    TIEDEF: TIEDEF_VARIANTS,
    LAMBDA: LAMBDA_VARIANTS,
    SITH: SITH_VARIANTS,
    VT49: VT49_VARIANTS,
    TIESK: TIESK_VARIANTS,
    TIERP: TIERP_VARIANTS,
    TIERBH: TIERBH_VARIANTS,
    TIECP: TIECP_VARIANTS,
    TIERBA: TIERBA_VARIANTS,
    STARWING: STARWING_VARIANTS,
    TIEADVV1: TIEADVV1_VARIANTS,
  });

/**
 * Resolve which rows from a chosen variant are available at a given
 * imperial pilot initiative. Returns the basic row plus all elite rows
 * whose initiative threshold is `<=` the squad's pilot initiative.
 */
export function getAndersonUpgrades(
  variant: AndersonVariant,
  imperialInitiative: number,
): readonly AndersonUpgradeRow[] {
  return [
    ...variant.basic,
    ...variant.elite.filter((row) => row.initiative <= imperialInitiative),
  ];
}
