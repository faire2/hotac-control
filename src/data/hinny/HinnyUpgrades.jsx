import React from "react";

export const WEAPON_RANGE = Object.freeze(
    {
        R1: "1",
        R12: "1-2",
        R23: "2-3",
        R13: "1-3"
    });

/* todo Vader crew originally it uses force, check with Claes what the correct ruling is */
export const HinnyUpgrades = Object.freeze({
    hullUpgrade: {
        skillName: "Hull Upgrade", skillDescription:
            <div>Increases your hull by 1. Already included in ships hull value.</div>
    },
    shieldUpgrade: {
        skillName: "Shield Upgrade", skillDescription:
            <div>Increases your shields by 1. Already included in ships shields value.</div>
    },
    outmaneuver: {
        skillName: "Outmaneuver", skillDescription:
            <div>
                While perfrorm a <i className="xwi x-frontarc"/> attack, if you are not in defender's firing arc,
                the defender rolls 1 fewer defense die.
            </div>
    },
    turrPhennir: {
        skillName: "Turr Phennir", skillDescription:
            <div>After you perform an attack, perform <i className="xwi x-barrelroll"/> or <i
                className="xwi x-boost"/> action
                if doing so will reduce the number of total possible dice threatening you, even if you are stressed.
            </div>
    },
    marksmanship: {
        skillName: "Marksmanship", skillDescription:
            <div>
                When you perform an attack, change 1 <i className="xwi x-hit"/> result to a <i
                className="xwi x-crit"/> result.
            </div>
    },
    gideonHask: {
        skillName: "Gideon Hask", skillDescription:
            <div>While you perform an attack against a damaged defender, roll 1 additional attack die.</div>
    },
    crackShot: {
        skillName: "Crack Shot", skillDescription:
            <div>
                While you perform a primary attack, if the defender is in your <i className="xwi x-bullseyearc"/>,
                before Neutralize Results step, spend 1 <i className="xwi x-charge"/> to cancel 1 <i
                className="xwi x-evade"/> result.
            </div>,
        CHARGE: 1
    },
    daredevil: {
        skillName: "Daredevil", skillDescription:
            <div>
                While you perform a <i className="xwi x-boost"/> action,you may use [1 <i className="xwi x-turnleft"/>]
                or
                [1 <i className="xwi x-turnright"/>] template instead.
            </div>
    },
    trickShot: {
        skillName: "Trick Shot", skillDescription:
            <div>While you perform an attack that is obstructed by an obstacle, roll 1 additional attack die.</div>
    },
// todo check with Hinny: {skillName: "" , skillDescription: causes 1 damage according to actual rules
    staticDischargeVanes: {
        skillName: "Static Discharge Vanes", skillDescription:
            <div>
                Before you would gain 1 ion or jam token, choose another ship at range 0-1. The chosen ship gains that
                ion
                or jam token instead.
            </div>
    },
    mauler: {
        skillName: "Mauler", skillDescription:
            <div>While you perform an attack at attack range 1, roll 1 additional die.</div>
    },
    wampa: {
        skillName: "Wampa", skillDescription:
            <div>
                While you perform an attack, spend 1 <i className="xwi x-charge"/> to roll 1 additional die. After
                defending, lose 1 <i className="xwi x-charge"/>.
            </div>,
        CHARGE: 1, RECHARGE: 1
    },
    ruthless: {
        skillName: "Ruthless", skillDescription:
            <div>
                While you perform an attack, after spending tokens, if there are any results other than <i
                className="xwi x-hit"/>/<i className="xwi x-crit"/>, choose another friendly ship at range 0-1 of the
                defender. That ship suffers 1 <i className="xwi x-hit"/> to change 1 of your dice results to a <i
                className="xwi x-hit"/> result.
            </div>
    },
    nightBeast: {
        skillName: "Night Beast", skillDescription:
            <div>After you fully execute a non-red maneuver, perform a <i className="xwi focus"/> action. </div>
    },
    juke: {
        skillName: "Juke", skillDescription:
            <div>
                While you perform an attack, if you are evading, change 1 of the defender's <i
                className="xwi x-evade"/> results to a <i className="xwi focus"/> result. When Selecting Action,
                choose <i
                className="xwi x-evade"/> instead of <i
                className="xwi focus"/>.
            </div>
    },
    predator: {
        skillName: "Predator", skillDescription:
            <div>
                While you perform a primary attack, if the defender is in your <i className="xwi x-bullseyearc"/>, you
                may
                reroll 1 attack die.
            </div>
    },
    afterburners: {
        skillName: "Afterburners: ", skillDescription:
            <div>
                After you fully execute a speed 3-5 maneuver, perform a <i className="xwi x-boost"/> action to get
                target in your firing arc or improve attack, even while stressed.
            </div>
    },
    soontirFel: {
        skillName: "Soontir Fel", skillDescription:
            <div>
                At the start of the Engagement Phase, it there is an enemy ship in your <i
                className="xwi x-bullseyearc"/>, gain 1 focus token.
            </div>
    },
    protonBombs: {
        skillName: "Proton Bombs", skillDescription:
            <div>
                During the System Phase, perform a device check. If successul, spend 1 <i className="xwi x-charge"/> to
                drop
                a Proton Bomb, using the [1 <i className="xwi x-straight"/>], [1 <i className="xwi x-turnleft"/>] or
                [1 <i className="xwi x-turnright"/>] template, depending on which template drops the device closest to
                an
                enemy ship.
            </div>,
        CHARGE: 2
    },
//todo Attack key word should always be in capitals, see the cards
    clusterMissiles: {
        skillName: "Cluster Missiles", skillDescription:
            <div>
                Attack (<i className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. After this attack, you may
                perform this attack as a bonus attack against a different target at range 0-1 of the defender, ignoring
                the <i className="xwi x-lock"/> requirement.
            </div>,
        CHARGE: 4, ATTACK: 3, RANGE: WEAPON_RANGE.R12
    },
    saturationSalvo: {
        skillName: "Saturation Salvo", skillDescription:
            <div>
                While you perform an attack, you may spend 1 <i className="xwi x-charge"/> from that upgrade. If you do,
                choose 2 defense dice. The defender must reroll those dice.
            </div>
    },
    debrisGambit: {
        skillName: "Debris Gambit", skillDescription:
            <div>
                After you execute a maneuver, if there is an obstacle at range 0-1, perform a <i
                className="xwi x-evade"/> action.
            </div>
    },
    protonTorpedoes: {
        skillName: "Proton Torpedoes", skillDescription:
            <div>
                Attack (<i
                className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. Change 1 <i
                className="xwi x-hit"/> to a <i className="xwi x-crit"/> result.
            </div>,
        ATTACK: 4, RANGE: WEAPON_RANGE.R23, CHARGE: 2
    },
    munitionFailsafe: {
        skillName: "Munition Failsafe", skillDescription:
            <div>
                While you perform a <i className="xwi x-missile"/> or a <i className="xwi x-torpedo"/> attack, if the
                attack did not hit, recover 1 <i className="xwi x-charge"/> you spent as a cost for the attack.
            </div>
    },
    plasmaTorpedoes: {
        skillName: "Plasma Torpedoes", skillDescription:
            <div>
                Attack (<i className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. During the Neutralize
                Results step, <i className="xwi x-crit"/> results are cancelled before <i
                className="xwi x-hit"/> results. After
                this attack hits, the defender loses 1 shield.
            </div>,
        ATTACK: 4, RANGE: WEAPON_RANGE.R23, CHARGE: 2

    },
    connerNets: {
        skillName: "Conner Nets", skillDescription:
            <div>
                During the System Phase, perform a device check. If successul, spend 1 <i className="xwi x-charge"/> to
                drop
                a Conner Net, using the [1 <i className="xwi x-straight"/>], [1 <i className="xwi x-turnleft"/>] or
                [1 <i className="xwi x-turnright"/>] template, depending on which template drops the device closest to
                an
                enemy ship.
            </div>,
        CHARGE: 1
    },
    captainJonus: {
        skillName: "Captain Jonus", skillDescription:
            <div>
                While a friendly ship at range 0-2 performs a <i className="xwi x-missile"/> or a <i
                className="xwi x-torpedo"/> attack, that ship may reroll up to 2 attack dice.
            </div>
    },
    diamondBoronMissiles: {
        skillName: "Diamond Boron Missiles", skillDescription:
            <div>
                Attack (<i className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. After this attack hits,
                each
                ship at range 0-1 of the defender with agility equal or less than the defender's rolls 1 attack die and
                suffers 1 <i className="xwi x-hit"/>/<i className="xwi x-crit"/> damage for a matching result.
            </div>,
        ATTACK: 3, RANGE: WEAPON_RANGE.R23, CHARGE: 3
    },
    swarmTactics: {
        skillName: "Swarm Tactics", skillDescription:
            <div>
                After you perform an attack, choose the friendly ship with the lowest initiative at range 0-1. That ship
                may
                perform a bonus attack.
            </div>
    },
    deathFire: {
        skillName: "Death Fire", skillDescription:
            <div>
                After you are destroyed, before you are removed, perform an attack and drop 1 random device (device
                check is
                considered succesfull).
            </div>
    },
    skilledBombardier: {
        skillName: "Skilled Bombardier", skillDescription:
            <div>
                If you would drop or launch a device, use a template of the same bearing with speed 1 higher or lower if
                the
                template drops the device closer to an enemy ship.
            </div>
    },
    electroProtonBomb: {
        skillName: "Electro-Proton Bomb", skillDescription:
            <div>
                During the System Phase, perform a device check. If successul, spend 1 <i className="xwi x-charge"/> to
                drop an Electro-Proton Bomb, using the [1 <i className="xwi x-straight"/>], [1 <i
                className="xwi x-turnleft"/>]
                or [1 <i className="xwi x-turnright"/>] template, depending on which template drops the device closest
                to an enemy ship. Then place 1 fuse marker on that device. This card's <i
                className="xwi x-charge"/> cannot be
                recovered.
            </div>,
        CHARGE: 1
    },
    ionTorpedoes: {
        skillName: "Ion Torpedoes", skillDescription:
            <div>
                Attack (<i className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. If this attack hits, spend
                1 <i className="xwi hit"/> or <i className="xwi x-crit"/> result to cause the defender to suffer 1 <i
                className="xwi x-hit"/> danage. All remaining <i className="xwi x-hit"/>/<i
                className="xwi x-crit"/> results inflict ion tokens instead of damage.
            </div>,
        ATTACK: 4, RANGE: WEAPON_RANGE.R23, CHARGE: 2
    },
    proximityMines: {
        skillName: "Proximity Mines", skillDescription:
            <div>
                During the System Phase, perform a device check. If successul, spend 1 <i className="xwi x-charge"/> to
                drop a Proximity Mine, using the [1 <i className="xwi x-straight"/>], [1 <i className="xwi x-turnleft"/>]
                or
                [1 <i className="xwi x-turnright"/>] template, depending on which template drops the device closest to
                an enemy ship.
            </div>,
        CHARGE: 2
    },
    concussionMissiles: {
        skillName: "Concussion Missiles", skillDescription:
            <div>
                Attack (<i className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. After this attack, each
                ship at range 0-1 of the defender exposes 1 of its damage cards.
            </div>,
        ATTACK: 4, RANGE: WEAPON_RANGE.R23, CHARGE: 3
    },
    elusive: {
        skillName: "Elusive", skillDescription:
            <div>
                While you defend, you may spend 2 <i className="xwi x-charge"/> to reroll 1 defense die.
            </div>,
        CHARGE: 2, RECHARGE: 1
    },
    stealthDevice: {
        skillName: "Stealth Device", skillDescription:
            <div>
                While you defend, if your <i className="xwi x-charge"/> is active, roll 1 additional defense die. After
                you suffer damage, lose 1 <i className="xwi x-charge"/>.
            </div>,
        CHARGE: 1
    },
    valenRudor: {
        skillName: "Valen Rudor", skillDescription:
            <div>
                After a friendly ship at range 0-1 defends (after the damage is resolved, if any), perform an action.
            </div>
    },
    scourgeSkutu: {
        skillName: "Scourge Skutu", skillDescription:
            <div>
                While you perform an attack against a defender in your <i className="xwi x-bullseyearc"/>, roll 1
                additional die.
            </div>
    },
    loneWolf: {
        skillName: "Lone Wolf", skillDescription:
            <div>
                While you defend or attack, if there are no other friendly ships at range 0-2, reroll 1 blank result, or
                a <i className="xwi focus"/> result, if you have no other means to modify it.
            </div>
    },
    seynMarana: {
        skillName: "Seyn Marana", skillDescription:
            <div>
                While you perform an attack, if the defender is not shielded, spend 1 <i
                className="xwi x-crit"/> result. If you do, deal 1 faceup damage card to the defender, then cancel you
                remaining results.
            </div>
    },
    majorRhymer: {
        skillName: "Major Rhymer", skillDescription:
            <div>
                While you perform <i className="xwi x-missile"/> or <i className="xwi x-torpedo"/> attack, you may
                increase or decrease the range requirements by 1, to a limit of 0-3.
            </div>
    },
    advancedProtonTorpedoes: {
        skillName: "Advanced Proton Torpedoes", skillDescription:
            <div>
                Attack (<i className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. Change 1 <i
                className="xwi x-hit"/> result to a <i className="xwi x-crit"/> result.
            </div>,
        ATTACK: 5, RANGE: WEAPON_RANGE.R1, CHARGE: 1
    },
    bombletGenerator: {
        skillName: "Bomblet Generator", skillDescription:
            <div>
                During the System Phase, perform a device check. If successul, spend 3 <i className="xwi x-charge"/> to
                drop
                a Bomblet, using the [1 <i className="xwi x-straight"/>], [1 <i className="xwi x-turnleft"/>] or
                [1 <i className="xwi x-turnright"/>] template, depending on which template drops the device closest to
                an
                enemy ship.
            </div>,
        CHARGE: 3, RECHARGE: 1
    },
    // todo they depend on focus, but the bomber will almost never have a focus and attack...
    barrageMissiles: {
        skillName: "Barrage Missiles", skillDescription:
            <div>
                Attack (<i className="xwi x-focus"/>): Spend 1 <i className="xwi x-charge"/>. If the defender is in
                your <i className="xwi x-bullseyearc"/>, you may spend 1 or more <i className="xwi x-charge"/> to reroll
                that many attack dice.
            </div>,
        ATTACK: 3, RANGE: WEAPON_RANGE.R23, CHARGE: 5
    },
    despoiler: {
        skillName: "Despoiler", skillDescription:
            <div>
                In the Perform Actions step, perform 2 actions instead of 1.
            </div>
    },
    veteranTurretGunner: {
        skillName: "Veteran Turret Gunner", skillDescription:
            <div>
                After you perform a primary attack, perform a bonus <i className="xwi x-turret"/> using a <i
                className="xwi x-turret"/> you did not already attack from this round.
            </div>
    },
    deathTroopers: {
        skillName: "Death Troopers", skillDescription:
            <div>
                During the Action Activation phase, enemy ships at range 0-1 cannot remove stress tokens.
            </div>
    },
    captainOicunn: {
        skillName: "Captain Oicunn", skillDescription:
            <div>
                You can perform primary attacks at range 0.
            </div>
    },
    whisper: {
        skillName: "Whisper", skillDescription:
            <div>
                After you perform an attack that hits, gain 1 evade token.
            </div>
    },
    maulerMithel: {
        skillName: "Mauler Mithel", skillDescription:
            <div>
                While you perform an attack at attack range 1, roll 1 additional attack die.
            </div>
    },
    pureSabaac: {
        skillName: "Pure Sabaac", skillDescription:
            <div>
                While you perform an attack, if you have 1 or fewer damage cards, you may roll 1 additional attack.
            </div>
    },
    intimidation: {
        skillName: "Intimidation", skillDescription:
            <div>
                While an enemy shipt at range 0 defends, it rolls 1 fewer defense die.
            </div>
    },
    marekSteele: {
        skillName: "Marek Steele", skillDescription:
            <div>
                While you perform an attack, if the defender would be dealt a faceup damage card, instead draw 3 damage
                cards, choose 1, and discard the rest.
            </div>
    },
    fireControlSystem: {
        skillName: "Fire Control System", skillDescription:
            <div>
                While you perform an attack, if you have a lock on the defender, you may reroll 1 attack die. If you do,
                you cannot spend your lock during this attack.
            </div>
    },
    zertikStrom: {
        skillName: "Zertik Strom", skillDescription:
            <div>
                During the End Phase, you may spend a lock you have on an enemy ship to expose 1 of that ship's damage
                cards.
            </div>
    },
    ionMissiles: {
        skillName: "Ion Missiles", skillDescription:
            <div>
                Attack (<i className="xwi x-lock"/>): Spend 1 <i className="xwi x-charge"/>. If this attack hits, spend
                1 <i className="xwi hit"/> or <i className="xwi x-crit"/> result to cause the defender to suffer 1 <i
                className="xwi x-hit"/> danage. All remaining <i className="xwi x-hit"/>/<i
                className="xwi x-crit"/> results inflict ion tokens instead of damage.
            </div>,
        ATTACK: 3, RANGE: WEAPON_RANGE.R23, CHARGE: 3
    },
    heavyLaserCannor: {
        skillName: "Heavy Laser Cannor", skillDescription:
            <div>
                Attack: After the Modify Attack Dice step, change all <i className="xwi x-crit"/> results to <i
                className="xwi x-hit"/> results.
            </div>,
        ATTACK: 4, RANGE: WEAPON_RANGE.R23, BULLSEYE: true
    },
    rexlerBrath: {
        skillName: "Rexler Brath", skillDescription:
            <div>
                After you perform an attack that hits, if you are evading, expose 1 of the defender's damage cards.
            </div>
    },
    collisionDetector: {
        skillName: "Collision Detector", skillDescription:
            <div>
                While you boost or barrel roll, you can move through and overlap obstacles. After you move through or
                overlap an obstacle, you may spend <i className="xwi x-charge"/> to ignore its effects until the end of
                the round.
            </div>,
        CHARGE: 2
    },
    echo: {
        skillName: "Echo", skillDescription:
            <div>
                While you roll to decloak, use the (2
                {(Math.round(Math.random()) === 0 ? <i className="xwi x-bankleft"/> : <i className="xwi x-bankright"/>)}
                ) template.</div>
    },
    advancedSensors: {
        skillName: "Advanced Sensors", skillDescription:
            <div>
                If performing maneuver would cause you to lose your action, perform an action following Action Selection
                based on your final ship position, ignoring Barell Roll actions.
            </div>
    },
    captainFeroph: {
        skillName: "Captain Feroph", skillDescription:
            <div>
                While you defend, if the attacker does not have any green tokens, you may change 1 of your <i
                className="xwi focus"/> / blank results to an <i className="xwi x-evade"/> result.
            </div>
    },
    darthVader: {
        skillName: "Darth Vader", skillDescription:
            <div>
                At the start of the Engagement Phase, you may choose 1 ship in your firing arc at range 0-2 and spend
                1 <i className="xwi charge"/>. If you do, that ship suffers 1 <i className="xwi x-hit"/> damage unless
                it chooses to remove 1 green token. Target priority: Attack target, if it has a green token, or nearest
                enemy in your arc.
            </div>
    },
    majorVermeil: {
        skillName: "Major Vermeil", skillDescription:
            <div>
                While you perform an attack, if the defender does not have any green tokens, you may change 1 of your
                blank results to a <i className="xwi hit"/> result.
            </div>
    },
    perceptiveCopilot: {
        skillName: "Perceptive Copilot", skillDescription:
            <div>
                After you perform a <i className="xwi x-focus"/> action, gain 1 focus token.
            </div>
    },
    electronicBaffle: {
        skillName: "Electronic Baffle", skillDescription:
            <div>
                During the End Phase, you may suffer 1 <i className="xwi x-hit"/> damage to remove 1 red token.
            </div>
    },
    admiralSloane: {
        skillName: "Admiral Sloane", skillDescription:
            <div>
                After another friendly ship at range 0-3 defends, if it is destroyed, the attacker gains 2 stress
                tokens.
                While a friendly ship at range 0-3 performs an attack against a stressed ship, it may reroll 1 attack
                die.
            </div>
    },
    howlRunner: {
        skillName: "Howl Runner", skillDescription:
            <div>
                When a friendly ship at range 0-1 performs a primary attack, that ship may reroll one attack die.
            </div>
    },
    tacticalScrambler: {
        skillName: "Tactical Scrambler", skillDescription:
            <div>
                While you obstruct an enemy ship's attack, the defender rolls 1 additional defense die.
            </div>
    },
    /* some FGA ships only raise initiative on specific threat levels */
    initiative: {
        skillName: "Initiative upgrade", skillDescription:
        <div>Upgrade of ship's initiative.</div>
    },
    noUpgrade: {
        skillName: "No Upgrade", skillDescription:
        <div>This ship has no upgrades.</div>
    },
    shieldRegeneration: {
        skillName: "Shield Regeneration", skillDescription:
        <div>At the end of each turn, you recover 1 <i className="xwi x-shield"/>.</div>
    }

});