import React from "react";
import {WEAPON_RANGE} from "../hinny/HinnyUpgrades";

export const CommunityUpgrades = Object.freeze({

    autothrusters: {
        skillName: "Autothrusters", skillDescription:
            <div>
                When you are defending, when you are beyond range 2 or outside the attacker's primary arc, change 1 of
                your blank results to a <i className="xwi x-evade"/> result.
            </div>
    },
    stealthDevice: {
        skillName: "Stealth Device", skillDescription:
            <div>Increase your agility value by 1. If you are hit by an attack this ability ceases.</div>
    },
    expertHandling: {
        skillName: "Expert Handling", skillDescription:
            <div>When you perform a <i className="xwi x-barrelroll"/> action, remove 1 enemy Target lock from your ship.
            </div>
    },
    whisper: {
        skillName: "Whisper", skillDescription:
            <div>After you perform an attack that hits, gain 1 <i className="xwi x-focus"/> token.</div>
    },
    elusiveness: {
        skillName: "Elusiveness", skillDescription:
            <div>When defending, the attacker must reroll one <i className="xwi x-crit"/> or <i
                className="xwi x-hit"/> result. You cannot use this ability if you are Stressed.</div>
    },
    darkCurse: {
        skillName: "Dark Curse", skillDescription:
            <div>When defending, ships attacking you cannot spend <i className="xwi x-focus"/> tokens or reroll attack
                dice.</div>
    },
    // todo check functionality
    hullUpgrade: {
        skillName: "Hull Upgrade", skillDescription:
            <div>Increases your hull by 1. Already included in ships hull value.</div>
    },
    shieldUpgrade: {
        skillName: "Shield Upgrade", skillDescription:
            <div>Increases your shields by 1. Already included in ships shields value.</div>
    },
    expose: {
        skillName: "Expose", skillDescription:
            <div><span className="red"> Replaces Focus Action</span>. Action: Until the end of the round, increase your
                primary attack value by 1 and
                decrease your agility by 1.</div>
    },
    targetingComputer: {
        skillName: "Targeting Computer", skillDescription:
            <div>After selecting a target, if it is in range, perform a free <i className="xwi x-lock"/> action on it.
                Spend this Target Lock after attacking.</div>
    },
    opportunist: {
        skillName: "Opportunist", skillDescription:
            <div>When attacking, if you are not stressed and if the defender does not have any Focus or Evade tokens,
                roll 1 additional attack die. <span className="red">Prioritise targets that trigger this ability</span>.
            </div>
    },
    turrPhennir: {
        skillName: "Turr Phennir", skillDescription:
            <div>After you perform an attack, perform a free <i className="xwi x-boost"/> or <i
                className="xwi x-barrelroll"/> action if doing so reduces the number of total possible attack dice
                threatening you.</div>
    },
    pushTheLimit: {
        skillName: "Push The Limit", skillDescription:
            <div>Perform an additional action during the Action Selection.</div>
    },
    captainKagi: {
        skillName: "Captain Kagi", skillDescription:
            <div>When an enemy ship requires a Target Lock, it must lock onto your ship if able.</div>
    },
    soontirFell: {
        skillName: "Soontir Fell", skillDescription:
            <div>After selecting a target, gain 1 Focus token.</div>
    },
    predator: {
        skillName: "Predator", skillDescription:
            <div>While you perform a primary attack, if the defender is in your <i className="xwi x-bullseyearc"/>, you
                may reroll 1 attack die.</div>
    },
    rexlerBrath: {
        skillName: "Rexler Brath", skillDescription:
            <div>When attacking, all Damage cards you deal to the defender are dealt face-up.</div>
    },
    loneWolf: {
        skillName: "Lone Wolf", skillDescription:
            <div>When attacking or defending, if there are no other friendly ships at range 0-2, you may reroll 1 of
                your blank results.</div>
    },
    maulerMithel: {
        skillName: "Mauler Mithel", skillDescription:
            <div>When attacking at range 1, roll 1 additional attack die.</div>
    },
    homingMissiles: {
        skillName: "Homing Missiles", skillDescription:
            <div>
                Attack (<i className="xwi x-focus"/>): Spend 1 <i className="xwi x-charge"/>. After you declare the
                defender, the defender may choose to suffer 1 <i className="xwi x-hit"/>. If it does, skip the Attack
                and Defense Dice steps and the attack is treated as hitting.
            </div>,
        ATTACK: 4, RANGE: WEAPON_RANGE.R23, CHARGE: 1
    },
    // todo raise all charges of the ship automatically!
    extraMunitions: {
        skillName: "Extra Munitions", skillDescription:
            <div>Add one <i className="xwi x-charge"/> to any equipped ordnance.</div>
    },
    calculation: {
        skillName: "Calculation", skillDescription:
            <div>Gain a Calculate token. Spend the token to change 1 of your <i className="xwi x-focus"/> result to a <i
                className="xwi x-hit"/> or <i className="xwi x-evade"/> result.</div>
    },
    lieutenantColzet:
        {
            skillName: "Lieutenant Colzet", skillDescription:
                <div>After attacking, if you have a Target Lock on the defender, spend it to flip 1 random face-down
                    Damage card assigned to the defender face-up.</div>
        },
    clusterMissiles: {
        skillName: "Cluster Missiles", skillDescription:
            <div>
                Attack (<i className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. After this attack, you may
                perform this attack as a bonus attack against a different target at range 0-1 of the defender, ignoring
                the <i className="xwi x-lock"/> requirement.
            </div>,
        ATTACK: 3, RANGE: WEAPON_RANGE.R12, CHARGE: 1
    },
    marksmanship: {
        skillName: "Marksmanship", skillDescription:
            <div>
                When you perform an attack, change 1 <i className="xwi x-hit"/> result to a <i
                className="xwi x-crit"/> result.
            </div>
    },
    commanderAlozen:
        {
            skillName: "Commander Alozen", skillDescription:
                <div>When attacking, if there is an enemy at range 1 that you do not have a Target Lock on, acquire a
                    Target Lock on it. It is now the priority target.</div>
        },
    majorRhymer:
        {
            skillName: "Major Rhymer", skillDescription:
                <div>When attacking with a secondary weapon, you may increase or decrease the weapon range by 1 to a
                    limit of range 1-3.</div>
        },
    outmaneuver: {
        skillName: "Outmaneuver", skillDescription:
            <div>
                While perform a <i className="xwi x-frontarc"/> attack, if you are not in defender's firing arc,
                the defender rolls 1 fewer defense die. <span className="red">Prioritise targets that trigger this ability.</span>
            </div>
    },
    backstabber:
        {
            skillName: "Backstabber", skillDescription:
                <div>When attacking from outside the defender's primary arc, roll 1 additional attack die. <span
                    className="red">Prioritise targets that trigger this ability.</span></div>
        },
    rearAdmiralChiraneau:
        {
            skillName: "Rear Admiral Chiraneau", skillDescription:
                <div>When attacking at range 1-2, change 1 of your <i className="xwi x-focus"/> results to a <i
                    className="xwi x-crit"/> result.</div>
        },
//todo Action key word should be in capitals
    // todo normally squad leader is tied to actions that both ships share
    squadLeader:
        {
            skillName: "Squad Leader", skillDescription:
                <div><span className="red">Replaces Focus Action.</span> Action[<i className="xwi x-coordinate"/>]:
                    Select the friendly ship at range 1-2 with the highest pilot initiative. That ship performs a free
                    action chosen from the available actions on your action bar. </div>
        },
    experimentalInterface:
        {
            skillName: "Experimental Interface", skillDescription:
                <div>An ability that replaces a <i className="xwi x-focus"/> action is performed as a free action in
                    addition to the <i className="xwi x-focus"/> action.</div>
        },
    swarmTactics:
        {
            skillName: "Swarm Tactics", skillDescription:
                <div>After your Engagement Phase activation, the friendly ship with lowest pilot Initiative at range 1
                    may immediately activate an attack.</div>
        },
    commanderKenkirk:
        {
            skillName: "Commander Kenkirk", skillDescription:
                <div>If you have no shields and are missing at least 1 hull, increase your agility value by 1.</div>
        },
    ionPulseMissiles: {
        skillName: "Ion Pulse Missiles", skillDescription:
            <div>
                Attack (<i className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. If this attack hits, spend
                1 <i className="xwi x-crit"/> or <i className="xwi x-hit"/> result to cause the defender to suffer 1 <i
                className="xwi x-hit"/> damage. All remaing <i className="xwi x-crit"/>/<i
                className="xwi x-hit"/> results inflict ion tokens instead of damage.
            </div>,
        ATTACK: 3, RANGE: WEAPON_RANGE.R23, CHARGE: 1
    },
    howlrunner:
        {
            skillName: "Howlrunner", skillDescription:
                <div>When another friendly ship at range 1 is attacking with its primary weapon, it may reroll 1
                    die.</div>
        },
    advancedProtonTorpedoes: {
        skillName: "Advanced Proton Torpedoes", skillDescription:
            <div>
                Attack (<i className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. Change 1 <i
                className="xwi x-hit"/> result to a <i className="xwi x-crit"/> result.
            </div>,
        ATTACK: 5, RANGE: WEAPON_RANGE.R1, CHARGE: 1
    },
    protonTorpedoes: {
        skillName: "Proton Torpedoes", skillDescription:
            <div>
                Attack (<i
                className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. Change 1 <i
                className="xwi x-hit"/> to a <i className="xwi x-crit"/> result.
            </div>,
        ATTACK: 4, RANGE: WEAPON_RANGE.R23, CHARGE: 1
    },
    nightBeast:
        {
            skillName: "Night Beast", skillDescription:
                <div>After executing a non-red maneuver, perform a free <i className="xwi x-focus"/> action.</div>
        },
    kathScarlet:
        {
            skillName: "Kath Scarlet", skillDescription:
                <div>When attacking, the defender gains 1 Stress token if he cancels at least one <i
                    className="xwi carousel-item-righti"/> result.</div>
        },
    advancedTargetingComputer:
        {
            skillName: "Advanced Targeting Computer ", skillDescription:
                <div>When attacking with your primary weapon, if you have a Target Lock on the defender, add 1 <i
                    className="xwi x-crit"/> result to your roll. You cannot spend Target Locks during this attack.
                </div>
        },
    accuracyCorrector:
        {
            skillName: "Accuracy Corrector", skillDescription:
                <div>When attacking, after modifying your attack dice, if you did not roll at least 2 hits (<i
                    className="xwi x-hit"/> or <i className="xwi x-crit"/>), cancel all your dice results and add <i
                    className="xwi x-hit"/> results.</div>
        },
    colonelJendon:
        {
            skillName: "Colonel Jendon", skillDescription:
                <div>At the start of Engagement Phase, the friendly ship with highest Pilot Initiative at range 1 that
                    does not have a target acquires a Target Lock on its nearest attack target.</div>
        },
    sensorJammer:
        {
            skillName: "Sensor Jammer", skillDescription:
                <div>When defending, change 1 of the attacker's <i className="xwi x-hit"/> results to a <i
                    className="xwi x-focus"/> result. The attacker cannot reroll the die with the changed result.</div>
        },
    carnorJax:
        {
            skillName: "Carnor Jax", skillDescription:
                <div>Enemy ships at range 1 cannot perform <i className="xwi x-focus"/> or <i
                    className="xwi x-evade"/> actions and cannot spend Focus or Evade tokens.</div>
        },
    advancedSensors:
        {
            skillName: "Advanced Sensors", skillDescription:
                <div>Do not skip Actions Selection after collision with a ship or obstacle, or after executing a red
                    maneuver.</div>
        },
    protonRockets: {
        skillName: "Proton Rockets", skillDescription:
            <div>
                Attack (<i className="xwi x-focus"/>): Spend 1 <i className="xwi x-charge"/>.
            </div>,
        ATTACK: 5, RANGE: WEAPON_RANGE.R12, CHARGE: 1
    },
    intimidation:
        {
            skillName: "Intimidation ", skillDescription:
                <div>While an enemy ship at range 0 defends, it rolls 1 fewer defence die.</div>
        },
    zertikStrom:
        {
            skillName: "Zertik Strom", skillDescription:
                <div>Enemy ships at range 1 cannot add their range combat bonus when attacking.</div>
        },
    ionCannon:
        {
            skillName: "Ion Cannon", skillDescription:
                <div>If this attack hits, spend 1 <i className="xwi x-hit"/> or <i className="xwi x-crit"/> result to
                    cause the defender to suffer 1 <i className="xwi x-hit"/>. All remaing <i
                        className="xwi x-crit"/>/<i
                        className="xwi x-hit"/> results inflict ion tokens instead of damage.
                </div>,
            ATTACK: 3, RANGE: WEAPON_RANGE.R13, BULLSEYE: true
        },
    heavyLaserCannon:
        {
            skillName: "Heavy Laser Cannon", skillDescription:
                <div>When attacking, after the Modify Attack Dice step, change all <i className="xwi x-crit"/> results
                    to <i className="xwi x-hit"/> results.</div>,
            ATTACK: 4, RANGE: WEAPON_RANGE.R23, BULLSEYE: true
        },
    kirKanos:
        {
            skillName: "Kir Kanos", skillDescription:
                <div>When attacking at range 2-3, add 1 <i className="xwi x-hit"/> result to you poll.</div>
        },
    ruthless:
        {
            skillName: "Ruthless", skillDescription:
                <div>While you perform an attack, the friendly ship at range 0-1 of the defender with lowest hull value
                    suffers 1 <i className="xwi x-hit"/>. You may change 1 of your die results to a <i
                        className="xwi x-hit"/> result.</div>
        },
    maraJade:
        {
            skillName: "Mara Jade", skillDescription:
                <div>A the end of the Engagement Phase, each enemy ship at range 1 that does not have a Stress token
                    gains 1 Stress token.</div>
        },
    advancedCloakingDevice:
        {
            skillName: "Advanced Cloaking Device", skillDescription:
                <div>After you perform an attack, perform a free <i className="xwi x-cloak"/> action.</div>
        },
    reconSpecialist:
        {
            skillName: "Recon Specialist", skillDescription:
                <div>When you perform a <i className="xwi x-focus"/> action, gain 1 additional Focus token.</div>
        },
    gunner:
        {
            skillName: "Gunner", skillDescription:
                <div>After you perform an attack that does not hit, immediately perform a primary weapon attack.<span
                    className="red">You cannot perform another attack this round.</span></div>
        },
    tactician:
        {
            skillName: "Tactician", skillDescription:
                <div>After you perform an attack against a ship inside your firing arc at range 2, that ship gains 1
                    Stress token.<span className="red">Prioritise targets that trigger this ability.</span></div>
        },
    antiPursuitLasers:
        {
            skillName: "Anti Pursuit Lasers", skillDescription:
                <div>After an enemy ship executes a maneuver that causes it to overlap your ship, roll 1 attack die.
                    On <i className="xwi x-hit"/> or <i className="xwi x-crit"/> result the enemy ship suffers 1 <i
                        className="xwi x-hit"/>.</div>
        },
    enhancedScopes:
        {
            skillName: "Enhanced Scopes", skillDescription:
                <div>During the activation phase, treat your pilot initiative as 0.</div>
        },
    flightInstructor:
        {
            skillName: "Flight Instructor", skillDescription:
                <div>When defending, you may reroll + of your <i className="xwi x-focus"/> results. If the attacker's
                    pilot initiative is 2 or lower, you may reroll 1 of your blank results instead.</div>
        },
    drawTheirFire:
        {
            skillName: "Draw Their Fire", skillDescription:
                <div>When a friendly ship at range 1 is hit by an attack, suffer 1 of the uncancelled <i
                    className="xwi x-crit"/> results instead of the target ship.</div>
        },
    rebelCaptive:
        {
            skillName: "Rebel Captive", skillDescription:
                <div>Once per round, the first ship that declares you as the target of an attack immediately gains 1
                    Stress token.</div>
        },
    fleetOfficer:
        {
            skillName: "Fleet Officer", skillDescription:
                <div><span className="red">Replaces Focus Action.</span> Action: The 2 nearest friendly ships at range
                    1-2 each gain a Focus token. If there are 0 or 1 friendly ship in range, this ships gains a Focus
                    token as well.</div>
        },
    tacticalJammer:
        {
            skillName: "Tactical Jammer", skillDescription:
                <div>Your ship obstructs enemy attacks.</div>
        },
    captainYorr:
        {
            skillName: "Captain Yorr", skillDescription:
                <div>Friendly ships at range 1-2 (including this ship) cannot gain Stress tokens.</div>
        },
    weaponsEngineer:
        {
            skillName: "Weapons Engineer", skillDescription:
                <div>You may maintain 2 Target Locks (only 1 per enemy ship). When you acquire a Target Lock, lock onto
                    the two nearest enemy ships.</div>
        },
    redline:
        {
            skillName: "Redline", skillDescription:
                <div>You may maintain 2 Target Locks. When you acquire a Target Lock, you may acquire a second lock on a
                    target within range 1 of the original target.</div>
        },
    fireControlSystem:
        {
            skillName: "Fire Control System", skillDescription:
                <div>After you perform an attack, acquire a Target Lock on the defender (do not spend this Target
                    Lock). Next round, treat the enemy you have Target Locked as your target priority.</div>
        }
});