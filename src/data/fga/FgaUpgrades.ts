/**
 * FGA upgrade tree per ship.
 *
 * Each ship has multiple variants; each variant is an ordered list of typed
 * `FgaUpgradeRow` entries. The runtime picks one variant at squad creation;
 * subsequent rank changes filter rows by `tier` against the player's XP level.
 *
 * Mechanically converted from the legacy inline `fgaUpgrades` table in
 * `UpgradesGenerator.js`. Tier mapping: legacy 2→1, 4→2, 6→3 (so xpLevel 1
 * returns tier ≤ 1, xpLevel 2 returns tier ≤ 2, xpLevel 3 returns all).
 */

import { fgaRow } from '../UpgradeRow';
import type { FgaUpgradeRow } from '../UpgradeRow';
import type { ShipId } from '../Ships';
import { FgaUpgradePool as P } from './FgaUpgradePool';

export type FgaShipVariants = readonly (readonly FgaUpgradeRow[])[];

export const FgaUpgrades: Readonly<Partial<Record<ShipId, FgaShipVariants>>> = Object.freeze({
    TIELN:
        [
            [
                fgaRow(P.nightBeast, 2, 1),
                fgaRow(P.predator, 2, 1),
                fgaRow(P.shieldUpgrade, 2, 1),
                fgaRow(P.hullUpgrade, 2, 1)
            ],
            [
                fgaRow(P.outmaneuver, 3, 1),
                fgaRow(P.shieldUpgrade, 3, 1),
                fgaRow(P.hullUpgrade, 3, 1)
            ],
        ],
    TIEIN:
        [
            [
                fgaRow(P.autothrusters, 1, 1),
                fgaRow(P.shieldUpgrade, 1, 1),
                fgaRow(P.hullUpgrade, 1, 1),
                fgaRow(P.soontirFel, 6, 2),
                fgaRow(P.outmaneuver, 6, 2),
                fgaRow(P.whisper, 7, 3),
                fgaRow(P.stealthDevice, 7, 3),
            ],
            [
                fgaRow(P.autothrusters, 1, 1),
                fgaRow(P.shieldUpgrade, 1, 1),
                fgaRow(P.hullUpgrade, 1, 1),
                fgaRow(P.shieldUpgrade, 4, 2),
                fgaRow(P.outmaneuver, 4, 2),
                fgaRow(P.gideonHask, 7, 3),
                fgaRow(P.shieldUpgrade, 7, 3),
                fgaRow(P.hullUpgrade, 7, 3),
            ],
            [
                fgaRow(P.autothrusters, 1, 1),
                fgaRow(P.shieldUpgrade, 1, 1),
                fgaRow(P.stealthDevice, 1, 1),
                fgaRow(P.soontirFel, 6, 2),
                fgaRow(P.hullUpgrade, 6, 2),
                fgaRow(P.scourgeSkutu, 7, 3),
                fgaRow(P.shieldUpgrade, 7, 3),
                fgaRow(P.predator, 7, 3),
            ],
            [
                fgaRow(P.autothrusters, 1, 1),
                fgaRow(P.shieldUpgrade, 1, 1),
                fgaRow(P.stealthDevice, 1, 1),
                fgaRow(P.nightBeast, 5, 2),
                fgaRow(P.hullUpgrade, 5, 2),
                fgaRow(P.shieldUpgrade, 5, 2),
                fgaRow(P.maulerMithel, 7, 3),
                fgaRow(P.stealthDevice, 7, 3),
            ],
            [
                fgaRow(P.autothrusters, 1, 1),
                fgaRow(P.hullUpgrade, 1, 1),
                fgaRow(P.stealthDevice, 1, 1),
                fgaRow(P.pureSabaac, 5, 2),
                fgaRow(P.shieldUpgrade, 5, 2),
                fgaRow(P.nightBeast, 7, 3),
                fgaRow(P.shieldUpgrade, 7, 3),
            ],
            [
                fgaRow(P.autothrusters, 1, 1),
                fgaRow(P.hullUpgrade, 1, 1),
                fgaRow(P.stealthDevice, 1, 1),
                fgaRow(P.captainOicunn, 5, 2),
                fgaRow(P.shieldUpgrade, 5, 2),
                fgaRow(P.intimidation, 7, 3),
                fgaRow(P.shieldUpgrade, 7, 3),
            ],
        ],
    TIEADVX:
        [
            [
                fgaRow(P.advancedTargetingComputer, 1, 1),
                fgaRow(P.concussionMissiles, 1, 1),
                fgaRow(P.marekSteele, 5, 2),
                fgaRow(P.outmaneuver, 5, 2),
                fgaRow(P.shieldUpgrade, 5, 2),
                fgaRow(P.fireControlSystem, 5, 2),
                fgaRow(P.soontirFel, 7, 3),
                fgaRow(P.outmaneuver, 7, 3),
            ],
            [
                fgaRow(P.advancedTargetingComputer, 1, 1),
                fgaRow(P.fireControlSystem, 3, 1),
                fgaRow(P.zertikStrom, 3, 2),
                fgaRow(P.outmaneuver, 3, 2),
                fgaRow(P.shieldUpgrade, 3, 2),
                fgaRow(P.clusterMissiles, 3, 2),
                fgaRow(P.maulerMithel, 7, 3),
                fgaRow(P.hullUpgrade, 7, 3),
            ],
            [
                fgaRow(P.advancedTargetingComputer, 1, 1),
                fgaRow(P.clusterMissiles, 1, 1),
                fgaRow(P.munitionFailsafe, 1, 1),
                fgaRow(P.marekSteele, 5, 2),
                fgaRow(P.hullUpgrade, 5, 2),
                fgaRow(P.whisper, 7, 3),
                fgaRow(P.shieldUpgrade, 7, 3),
            ],
            [
                fgaRow(P.advancedTargetingComputer, 1, 1),
                fgaRow(P.fireControlSystem, 3, 1),
                fgaRow(P.gideonHask, 5, 2),
                fgaRow(P.shieldUpgrade, 5, 2),
                fgaRow(P.clusterMissiles, 5, 2),
                fgaRow(P.hullUpgrade, 7, 3),
                fgaRow(P.outmaneuver, 7, 3),
                fgaRow(P.predator, 7, 3),
            ],
        ],
    TIESA:
        [
            [
                fgaRow(P.nimbleBomber, 1, 1),
                fgaRow(P.protonTorpedoes, 1, 1),
                fgaRow(P.clusterMissiles, 1, 1),
                fgaRow(P.shieldUpgrade, 1, 1),
                fgaRow(P.captainJonus, 4, 2),
                fgaRow(P.clusterMissiles, 4, 2),
                fgaRow(P.shieldUpgrade, 4, 2),
                fgaRow(P.munitionFailsafe, 4, 2),
                fgaRow(P.maulerMithel, 7, 3),
                fgaRow(P.shieldUpgrade, 7, 3),
            ],
            [
                fgaRow(P.nimbleBomber, 1, 1),
                fgaRow(P.advancedProtonTorpedoes, 1, 1),
                fgaRow(P.concussionMissiles, 1, 1),
                fgaRow(P.shieldUpgrade, 1, 1),
                fgaRow(P.gideonHask, 5, 2),
                fgaRow(P.shieldUpgrade, 5, 2),
                fgaRow(P.shieldUpgrade, 5, 2),
                fgaRow(P.predator, 7, 3),
                fgaRow(P.shieldUpgrade, 7, 3),
                fgaRow(P.hullUpgrade, 7, 3),
            ],
            [
                fgaRow(P.nimbleBomber, 1, 1),
                fgaRow(P.protonTorpedoes, 1, 1),
                fgaRow(P.ionMissiles, 1, 1),
                fgaRow(P.shieldUpgrade, 1, 1),
                fgaRow(P.majorRhymer, 4, 2),
                fgaRow(P.intimidation, 4, 2),
                fgaRow(P.shieldUpgrade, 4, 2),
                fgaRow(P.hullUpgrade, 4, 2),
                fgaRow(P.shieldUpgrade, 7, 3),
            ],
            [
                fgaRow(P.nimbleBomber, 1, 1),
                fgaRow(P.protonTorpedoes, 1, 1),
                fgaRow(P.concussionMissiles, 1, 1),
                fgaRow(P.shieldUpgrade, 1, 1),
                fgaRow(P.whisper, 5, 2),
                fgaRow(P.shieldUpgrade, 5, 2),
                fgaRow(P.shieldUpgrade, 5, 2),
                fgaRow(P.soontirFel, 7, 3),
                fgaRow(P.hullUpgrade, 7, 3),
            ],
        ],
    TIEDEF:
        [
            [
                fgaRow(P.fullThrottle, 1, 1),
                fgaRow(P.heavyLaserCannon, 1, 1),
                fgaRow(P.rexlerBrath, 7, 2),
                fgaRow(P.captainOicunn, 7, 3),
                fgaRow(P.fireControlSystem, 7, 3),
                fgaRow(P.concussionMissiles, 7, 3),
                fgaRow(P.munitionFailsafe, 7, 3),
                fgaRow(P.stealthDevice, 7, 3),
            ],
            [
                fgaRow(P.fullThrottle, 1, 1),
                fgaRow(P.fireControlSystem, 3, 1),
                fgaRow(P.nightBeast, 7, 2),
                fgaRow(P.maulerMithel, 7, 3),
                fgaRow(P.clusterMissiles, 7, 3),
                fgaRow(P.munitionFailsafe, 7, 3),
                fgaRow(P.stealthDevice, 7, 3),
                fgaRow(P.hullUpgrade, 7, 3),
            ],
            [
                fgaRow(P.fullThrottle, 1, 1),
                fgaRow(P.concussionMissiles, 1, 1),
                fgaRow(P.gideonHask, 7, 2),
                fgaRow(P.fireControlSystem, 7, 3),
                fgaRow(P.hullUpgrade, 7, 3),
                fgaRow(P.shieldUpgrade, 7, 3),
            ],
            [
                fgaRow(P.fullThrottle, 1, 1),
                fgaRow(P.clusterMissiles, 1, 1),
                fgaRow(P.pureSabaac, 6, 2),
                fgaRow(P.predator, 6, 2),
                fgaRow(P.fireControlSystem, 7, 3),
                fgaRow(P.shieldUpgrade, 7, 3),
                fgaRow(P.stealthDevice, 7, 3),
            ],
        ],
    TIEPH:
        [
            [
                fgaRow(P.stygiumArray, 1, 1),
                fgaRow(P.collisionDetector, 1, 1),
                fgaRow(P.echo, 4, 2),
                fgaRow(P.outmaneuver, 4, 2),
                fgaRow(P.stealthDevice, 4, 2),
                fgaRow(P.shieldUpgrade, 4, 2),
                fgaRow(P.pureSabaac, 7, 3),
            ],
            [
                fgaRow(P.stygiumArray, 1, 1),
                fgaRow(P.advancedSensors, 1, 1),
                fgaRow(P.whisper, 5, 2),
                fgaRow(P.juke, 5, 2),
                fgaRow(P.hullUpgrade, 5, 2),
                fgaRow(P.rexlerBrath, 7, 3),
                fgaRow(P.stealthDevice, 7, 3),
            ],
            [
                fgaRow(P.stygiumArray, 1, 1),
                fgaRow(P.advancedSensors, 1, 1),
                fgaRow(P.captainOicunn, 5, 2),
                fgaRow(P.intimidation, 5, 2),
                fgaRow(P.hullUpgrade, 5, 2),
                fgaRow(P.maulerMithel, 7, 3),
                fgaRow(P.shieldUpgrade, 7, 3),
            ],
            [
                fgaRow(P.stygiumArray, 1, 1),
                fgaRow(P.initiative, 4, 1),
                fgaRow(P.captainFeroph, 4, 2),
                fgaRow(P.darthVader, 4, 2),
                fgaRow(P.collisionDetector, 4, 2),
                fgaRow(P.juke, 4, 2),
                fgaRow(P.majorRhymer, 7, 3),
                fgaRow(P.hullUpgrade, 7, 3),
            ],
            [
                fgaRow(P.stygiumArray, 1, 1),
                fgaRow(P.fireControlSystem, 1, 1),
                fgaRow(P.echo, 4, 2),
                fgaRow(P.stealthDevice, 4, 2),
                fgaRow(P.perceptiveCopilot, 4, 2),
                fgaRow(P.captainFeroph, 7, 3),
                fgaRow(P.hullUpgrade, 7, 3),
            ],
            [
                fgaRow(P.stygiumArray, 1, 1),
                fgaRow(P.initiative, 4, 1),
                fgaRow(P.whisper, 5, 2),
                fgaRow(P.fireControlSystem, 5, 2),
                fgaRow(P.juke, 5, 2),
                fgaRow(P.shieldUpgrade, 5, 2),
                fgaRow(P.shieldUpgrade, 5, 2),
                fgaRow(P.gideonHask, 7, 3),
                fgaRow(P.stealthDevice, 7, 3),
            ],
        ],
    LAMBDA:
        [
            [
                fgaRow(P.heavyLaserCannon, 1, 1),
                fgaRow(P.electronicBaffle, 1, 1),
                fgaRow(P.captainOicunn, 4, 2),
                fgaRow(P.admiralSloane, 4, 2),
                fgaRow(P.hullUpgrade, 4, 2),
            ],
            [
                fgaRow(P.perceptiveCopilot, 1, 1),
                fgaRow(P.howlRunner, 4, 2),
                fgaRow(P.heavyLaserCannon, 4, 2),
                fgaRow(P.hullUpgrade, 4, 2),
            ],
        ],
    VT49:
        [
            [
                fgaRow(P.veteranTurretGunner, 1, 1),
                fgaRow(P.advancedProtonTorpedoes, 1, 1),
                fgaRow(P.captainOicunn, 3, 2),
                fgaRow(P.admiralSloane, 3, 2),
                fgaRow(P.perceptiveCopilot, 3, 2),
                fgaRow(P.tacticalScrambler, 3, 2),
                fgaRow(P.ruthless, 3, 2),
                fgaRow(P.whisper, 3, 2),
            ],
            [
                fgaRow(P.captainOicunn, 3, 1),
                fgaRow(P.veteranTurretGunner, 3, 1),
                fgaRow(P.hullUpgrade, 5, 2),
                fgaRow(P.howlRunner, 5, 2),
                fgaRow(P.protonTorpedoes, 5, 2),
                fgaRow(P.munitionFailsafe, 5, 2),
                fgaRow(P.admiralSloane, 5, 2),
            ],
        ]
});
