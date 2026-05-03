/**
 * Community upgrade tree per ship.
 *
 * Mechanically converted from the legacy inline `communityUpgrades` table
 * in `UpgradesGenerator.js`. Each row is a typed `CommunityUpgradeRow`
 * with `{ source, upgrade, initiative, xpCost }`.
 */

import { communityRow } from '../UpgradeRow';
import type { CommunityUpgradeRow } from '../UpgradeRow';
import type { ShipId } from '../Ships';
import { CommunityUpgrades as C } from './CommunityUpgrades';

export type CommunityShipVariants = readonly (readonly CommunityUpgradeRow[])[];

export const CommunityUpgradeTree: Readonly<Partial<Record<ShipId, CommunityShipVariants>>> = Object.freeze({
    TIELN:
        [
            [
                communityRow(C.noUpgrade, 1, 2)
            ]
        ],
    TIEIN:
        [
            [
                communityRow(C.autothrusters, 1, 4),
                communityRow(C.stealthDevice, 3, 6),
                communityRow(C.expertHandling, 3, 6),
                communityRow(C.whisper, 4, 6),
                communityRow(C.elusiveness, 5, 6),
                communityRow(C.darkCurse, 6, 6),
            ],
            [
                communityRow(C.hullUpgrade, 1, 4),
                communityRow(C.shieldUpgrade, 3, 6),
                communityRow(C.expose, 3, 6),
                communityRow(C.targetingComputer, 4, 6),
                communityRow(C.opportunist, 5, 6),
                communityRow(C.turrPhennir, 6, 6),
            ],
            [
                communityRow(C.autothrusters, 1, 4),
                communityRow(C.shieldUpgrade, 3, 6),
                communityRow(C.pushTheLimit, 3, 6),
                communityRow(C.captainKagi, 4, 6),
                communityRow(C.expertHandling, 5, 6),
                communityRow(C.soontirFell, 6, 6),
            ],
            [
                communityRow(C.stealthDevice, 1, 4),
                communityRow(C.autothrusters, 3, 6),
                communityRow(C.predator, 3, 6),
                communityRow(C.rexlerBrath, 4, 6),
                communityRow(C.loneWolf, 5, 6),
                communityRow(C.maulerMithel, 6, 6),
            ],
            [
                communityRow(C.hullUpgrade, 1, 4),
                communityRow(C.autothrusters, 3, 6),
                communityRow(C.outmaneuver, 3, 6),
                communityRow(C.backstabber, 4, 6),
                communityRow(C.calculation, 5, 6),
                communityRow(C.rearAdmiralChiraneau, 6, 6),
            ],
            [
                communityRow(C.stealthDevice, 1, 4),
                communityRow(C.hullUpgrade, 3, 6),
                communityRow(C.squadLeader, 3, 6),
                communityRow(C.experimentalInterface, 4, 6),
                communityRow(C.swarmTactics, 5, 6),
                communityRow(C.commanderKenkirk, 6, 6),
            ],
        ],
    TIESA:
        [
            [
                communityRow(C.homingMissiles, 1, 4),
                communityRow(C.extraMunitions, 3, 6),
                communityRow(C.calculation, 3, 6),
                communityRow(C.lieutenantColzet, 4, 6),
                communityRow(C.elusiveness, 5, 6),
                communityRow(C.rexlerBrath, 6, 6),
            ],
            [
                communityRow(C.clusterMissiles, 1, 4),
                communityRow(C.extraMunitions, 3, 6),
                communityRow(C.marksmanship, 3, 6),
                communityRow(C.commanderAlozen, 4, 6),
                communityRow(C.predator, 5, 6),
                communityRow(C.majorRhymer, 6, 6),
            ],
            [
                communityRow(C.clusterMissiles, 1, 4),
                communityRow(C.experimentalInterface, 3, 6),
                communityRow(C.outmaneuver, 3, 6),
                communityRow(C.redline, 4, 6),
                communityRow(C.ruthless, 5, 6),
                communityRow(C.kirKanos, 6, 6),
            ],
            [
                communityRow(C.ionPulseMissiles, 1, 4),
                communityRow(C.extraMunitions, 3, 6),
                communityRow(C.swarmTactics, 3, 6),
                communityRow(C.howlrunner, 4, 6),
                communityRow(C.outmaneuver, 5, 6),
                communityRow(C.darkCurse, 6, 6),
            ],
            [
                communityRow(C.advancedProtonTorpedoes, 1, 4),
                communityRow(C.extraMunitions, 3, 6),
                communityRow(C.shieldUpgrade, 3, 6),
                communityRow(C.majorRhymer, 4, 6),
                communityRow(C.opportunist, 5, 6),
                communityRow(C.commanderKenkirk, 6, 6),
            ],
            [
                communityRow(C.protonTorpedoes, 1, 4),
                communityRow(C.extraMunitions, 3, 6),
                communityRow(C.calculation, 3, 6),
                communityRow(C.nightBeast, 4, 6),
                communityRow(C.predator, 5, 6),
                communityRow(C.kathScarlet, 6, 6),
            ],
        ],
    TIEADVX:
        [
            [
                communityRow(C.advancedTargetingComputer, 1, 4),
                communityRow(C.stealthDevice, 3, 6),
                communityRow(C.expose, 3, 6),
                communityRow(C.experimentalInterface, 4, 6),
                communityRow(C.whisper, 5, 6),
                communityRow(C.opportunist, 6, 6),
            ],
            [
                communityRow(C.accuracyCorrector, 1, 4),
                communityRow(C.shieldUpgrade, 3, 6),
                communityRow(C.swarmTactics, 3, 6),
                communityRow(C.colonelJendon, 4, 6),
                communityRow(C.squadLeader, 5, 6),
                communityRow(C.howlrunner, 6, 6),
            ],
            [
                communityRow(C.sensorJammer, 1, 4),
                communityRow(C.shieldUpgrade, 3, 6),
                communityRow(C.expertHandling, 3, 6),
                communityRow(C.captainKagi, 4, 6),
                communityRow(C.elusiveness, 5, 6),
                communityRow(C.carnorJax, 6, 6),
            ],
            [
                communityRow(C.advancedSensors, 1, 4),
                communityRow(C.protonRockets, 3, 6),
                communityRow(C.zertikStrom, 3, 6),
                communityRow(C.pushTheLimit, 4, 6),
                communityRow(C.intimidation, 5, 6),
                communityRow(C.maulerMithel, 6, 6),
            ],
        ],
    TIEDEF:
        [
            [
                communityRow(C.ionCannon, 1, 4),
                communityRow(C.stealthDevice, 3, 6),
                communityRow(C.elusiveness, 3, 6),
                communityRow(C.whisper, 4, 6),
                communityRow(C.loneWolf, 5, 6),
                communityRow(C.nightBeast, 6, 6),
            ],
            [
                communityRow(C.ionCannon, 1, 4),
                communityRow(C.shieldUpgrade, 3, 6),
                communityRow(C.outmaneuver, 3, 6),
                communityRow(C.backstabber, 4, 6),
                communityRow(C.swarmTactics, 5, 6),
                communityRow(C.howlrunner, 6, 6),
            ],
            [
                communityRow(C.heavyLaserCannon, 1, 4),
                communityRow(C.hullUpgrade, 3, 6),
                communityRow(C.pushTheLimit, 3, 6),
                communityRow(C.kirKanos, 4, 6),
                communityRow(C.outmaneuver, 5, 6),
                communityRow(C.rexlerBrath, 6, 6),
            ],
            [
                communityRow(C.heavyLaserCannon, 1, 4),
                communityRow(C.shieldUpgrade, 3, 6),
                communityRow(C.calculation, 3, 6),
                communityRow(C.kathScarlet, 4, 6),
                communityRow(C.ruthless, 5, 6),
                communityRow(C.rearAdmiralChiraneau, 6, 6),
            ],
        ],
    TIEPH:
        [
            [
                communityRow(C.maraJade, 1, 4),
                communityRow(C.advancedCloakingDevice, 3, 6),
                communityRow(C.sensorJammer, 3, 6),
                communityRow(C.maulerMithel, 4, 6),
                communityRow(C.predator, 5, 6),
                communityRow(C.carnorJax, 6, 6),
            ],
            [
                communityRow(C.reconSpecialist, 1, 4),
                communityRow(C.advancedCloakingDevice, 3, 6),
                communityRow(C.sensorJammer, 3, 6),
                communityRow(C.loneWolf, 4, 6),
                communityRow(C.elusiveness, 5, 6),
                communityRow(C.darkCurse, 6, 6),
            ],
            [
                communityRow(C.gunner, 1, 4),
                communityRow(C.advancedCloakingDevice, 3, 6),
                communityRow(C.fireControlSystem, 3, 6),
                communityRow(C.backstabber, 4, 6),
                communityRow(C.outmaneuver, 5, 6),
                communityRow(C.soontirFell, 6, 6),
            ],
            [
                communityRow(C.tactician, 1, 4),
                communityRow(C.advancedCloakingDevice, 3, 6),
                communityRow(C.advancedSensors, 3, 6),
                communityRow(C.expose, 4, 6),
                communityRow(C.captainKagi, 5, 6),
                communityRow(C.rexlerBrath, 6, 6),
            ],
        ],
    LAMBDA:
        [
            [
                communityRow(C.antiPursuitLasers, 1, 4),
                communityRow(C.enhancedScopes, 3, 6),
                communityRow(C.maraJade, 3, 6),
                communityRow(C.zertikStrom, 4, 6),
                communityRow(C.tactician, 5, 6),
                communityRow(C.carnorJax, 6, 6),
            ],
            [
                communityRow(C.sensorJammer, 1, 4),
                communityRow(C.flightInstructor, 3, 6),
                communityRow(C.drawTheirFire, 3, 6),
                communityRow(C.captainKagi, 4, 6),
                communityRow(C.rebelCaptive, 5, 6),
                communityRow(C.elusiveness, 6, 6),
            ],
            [
                communityRow(C.fleetOfficer, 1, 4),
                communityRow(C.advancedSensors, 3, 6),
                communityRow(C.tacticalJammer, 3, 6),
                communityRow(C.captainYorr, 4, 6),
                communityRow(C.swarmTactics, 5, 6),
                communityRow(C.howlrunner, 6, 6),
            ],
            [
                communityRow(C.weaponsEngineer, 1, 4),
                communityRow(C.advancedSensors, 3, 6),
                communityRow(C.squadLeader, 3, 6),
                communityRow(C.colonelJendon, 4, 6),
                communityRow(C.gunner, 5, 6),
                communityRow(C.rexlerBrath, 6, 6),
            ],
        ]
});
