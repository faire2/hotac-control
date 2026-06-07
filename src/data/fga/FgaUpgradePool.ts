/**
 * FGA upgrade pool — typed `Upgrade` definitions for every named upgrade
 * referenced by the FGA upgrade tree (`FgaUpgrades.ts`).
 *
 * Originally lived as JSX in the (now-deleted) HinnyUpgrades.jsx; mechanically
 * converted to plain-string descriptions with `:icon-name:` shortcodes.
 * See `docs/DATA-LAYER.md` §6 for the discriminated `UpgradeRow` shape and
 * §11 for the icon shortcode convention.
 */

import type { Upgrade } from '../shared/coreUpgrades';
import {
  HULL_UPGRADE,
  SHIELD_UPGRADE,
  WEAPON_RANGE,
  AUTOTHRUSTERS,
  ADVANCED_TARGETING_COMPUTER,
  NIMBLE_BOMBER,
  STYGIUM_ARRAY,
  FULL_THROTTLE,
  INSTINCTIVE_AIM,
} from '../shared/coreUpgrades';

export const FgaUpgradePool: Readonly<Record<string, Upgrade>> = Object.freeze({
  hullUpgrade: HULL_UPGRADE,
  shieldUpgrade: SHIELD_UPGRADE,
  // Shipcard baseline pilot abilities — reference the shared singletons
  // so all engines (FGA / Community / Anderson) point at the same Upgrade
  // object. Each ship type that carries one of these has the matching
  // baseline prepended to every variant's basic-slot row in FgaUpgrades.ts.
  autothrusters: AUTOTHRUSTERS,
  advancedTargetingComputer: ADVANCED_TARGETING_COMPUTER,
  nimbleBomber: NIMBLE_BOMBER,
  stygiumArray: STYGIUM_ARRAY,
  fullThrottle: FULL_THROTTLE,
  instinctiveAim: INSTINCTIVE_AIM,
  noUpgrade: { skillName: 'No Upgrade', description: 'This ship has no upgrades.' },
  initiative: { skillName: 'Initiative upgrade', description: "Upgrade of ship's initiative." },

  outmaneuver: { skillName: 'Outmaneuver', description: "While perform a :front-arc: attack, if you are not in defender's firing arc, the defender rolls 1 fewer defense die." },
  turrPhennir: { skillName: 'Turr Phennir', description: 'After you perform an attack, perform :barrelroll: or :boost: action if doing so will reduce the number of total possible dice threatening you, even if you are stressed.' },
  marksmanship: { skillName: 'Marksmanship', description: 'When you perform an attack, change 1 :hit: result to a :crit: result.' },
  gideonHask: { skillName: 'Gideon Hask', description: 'While you perform an attack against a damaged defender, roll 1 additional attack die.' },
  crackShot: { skillName: 'Crack Shot', description: 'While you perform a primary attack, if the defender is in your :bullseye:, before Neutralize Results step, spend 1 :charge: to cancel 1 :evade: result.', charge: 1 },
  daredevil: { skillName: 'Daredevil', description: 'While you perform a :boost: action, you may use [1 :turn-left:] or [1 :turn-right:] template instead.' },
  trickShot: { skillName: 'Trick Shot', description: 'While you perform an attack that is obstructed by an obstacle, roll 1 additional attack die.' },
  staticDischargeVanes: { skillName: 'Static Discharge Vanes', description: 'Before you would gain 1 ion or jam token, choose another ship at range 0-1. The chosen ship gains that ion or jam token instead.' },
  mauler: { skillName: 'Mauler', description: 'While you perform an attack at attack range 1, roll 1 additional die.' },
  wampa: { skillName: 'Wampa', description: 'While you perform an attack, spend 1 :charge: to roll 1 additional die. After defending, lose 1 :charge:.', charge: 1, recharge: 1 },
  ruthless: { skillName: 'Ruthless', description: 'While you perform an attack, after spending tokens, if there are any results other than :hit:/:crit:, choose another friendly ship at range 0-1 of the defender. That ship suffers 1 :hit: to change 1 of your dice results to a :hit: result.' },
  nightBeast: { skillName: 'Night Beast', description: 'After you fully execute a non-red maneuver, perform a :focus: action.' },
  juke: { skillName: 'Juke', description: "While you perform an attack, if you are evading, change 1 of the defender's :evade: results to a :focus: result. When Selecting Action, choose :evade: instead of :focus:." },
  predator: { skillName: 'Predator', description: 'While you perform a primary attack, if the defender is in your :bullseye:, you may reroll 1 attack die.' },
  afterburners: { skillName: 'Afterburners', description: 'After you fully execute a speed 3-5 maneuver, perform a :boost: action to get target in your firing arc or improve attack, even while stressed.' },
  soontirFel: { skillName: 'Soontir Fel', description: 'At the start of the Engagement Phase, if there is an enemy ship in your :bullseye:, gain 1 focus token.' },
  protonBombs: { skillName: 'Proton Bombs', description: 'During the System Phase, perform a device check. If successful, spend 1 :charge: to drop a Proton Bomb, using the [1 :straight:], [1 :turn-left:] or [1 :turn-right:] template, depending on which template drops the device closest to an enemy ship.', charge: 2 },
  clusterMissiles: { skillName: 'Cluster Missiles', description: 'Attack (:lock:): Spend 1 :charge:. After this attack, you may perform this attack as a bonus attack against a different target at range 0-1 of the defender, ignoring the :lock: requirement.', charge: 4, attack: 3, range: WEAPON_RANGE.R12 },
  saturationSalvo: { skillName: 'Saturation Salvo', description: 'While you perform an attack, you may spend 1 :charge: from that upgrade. If you do, choose 2 defense dice. The defender must reroll those dice.' },
  debrisGambit: { skillName: 'Debris Gambit', description: 'After you execute a maneuver, if there is an obstacle at range 0-1, perform a :evade: action.' },
  protonTorpedoes: { skillName: 'Proton Torpedoes', description: 'Attack (:lock:): Spend 1 :charge:. Change 1 :hit: to a :crit: result.', charge: 2, attack: 4, range: WEAPON_RANGE.R23 },
  munitionFailsafe: { skillName: 'Munition Failsafe', description: 'While you perform a :missile: or a :torpedo: attack, if the attack did not hit, recover 1 :charge: you spent as a cost for the attack.' },
  plasmaTorpedoes: { skillName: 'Plasma Torpedoes', description: 'Attack (:lock:): Spend 1 :charge:. During the Neutralize Results step, :crit: results are cancelled before :hit: results. After this attack hits, the defender loses 1 shield.', charge: 2, attack: 4, range: WEAPON_RANGE.R23 },
  connerNets: { skillName: 'Conner Nets', description: 'During the System Phase, perform a device check. If successful, spend 1 :charge: to drop a Conner Net, using the [1 :straight:], [1 :turn-left:] or [1 :turn-right:] template, depending on which template drops the device closest to an enemy ship.', charge: 1 },
  captainJonus: { skillName: 'Captain Jonus', description: 'While a friendly ship at range 0-2 performs a :missile: or a :torpedo: attack, that ship may reroll up to 2 attack dice.' },
  diamondBoronMissiles: { skillName: 'Diamond Boron Missiles', description: "Attack (:lock:): Spend 1 :charge:. After this attack hits, each ship at range 0-1 of the defender with agility equal or less than the defender's rolls 1 attack die and suffers 1 :hit:/:crit: damage for a matching result.", charge: 3, attack: 3, range: WEAPON_RANGE.R23 },
  swarmTactics: { skillName: 'Swarm Tactics', description: 'After you perform an attack, choose the friendly ship with the lowest initiative at range 0-1. That ship may perform a bonus attack.' },
  deathFire: { skillName: 'Death Fire', description: 'After you are destroyed, before you are removed, perform an attack and drop 1 random device (device check is considered successful).' },
  skilledBombardier: { skillName: 'Skilled Bombardier', description: 'If you would drop or launch a device, use a template of the same bearing with speed 1 higher or lower if the template drops the device closer to an enemy ship.' },
  electroProtonBomb: { skillName: 'Electro-Proton Bomb', description: "During the System Phase, perform a device check. If successful, spend 1 :charge: to drop an Electro-Proton Bomb, using the [1 :straight:], [1 :turn-left:] or [1 :turn-right:] template, depending on which template drops the device closest to an enemy ship. Then place 1 fuse marker on that device. This card's :charge: cannot be recovered.", charge: 1 },
  ionTorpedoes: { skillName: 'Ion Torpedoes', description: 'Attack (:lock:): Spend 1 :charge:. If this attack hits, spend 1 :hit: or :crit: result to cause the defender to suffer 1 :hit: damage. All remaining :hit:/:crit: results inflict ion tokens instead of damage.', charge: 2, attack: 4, range: WEAPON_RANGE.R23 },
  proximityMines: { skillName: 'Proximity Mines', description: 'During the System Phase, perform a device check. If successful, spend 1 :charge: to drop a Proximity Mine, using the [1 :straight:], [1 :turn-left:] or [1 :turn-right:] template, depending on which template drops the device closest to an enemy ship.', charge: 2 },
  concussionMissiles: { skillName: 'Concussion Missiles', description: 'Attack (:lock:): Spend 1 :charge:. After this attack, each ship at range 0-1 of the defender exposes 1 of its damage cards.', charge: 3, attack: 4, range: WEAPON_RANGE.R23 },
  elusive: { skillName: 'Elusive', description: 'While you defend, you may spend 2 :charge: to reroll 1 defense die.', charge: 2, recharge: 1 },
  stealthDevice: { skillName: 'Stealth Device', description: 'While you defend, if your :charge: is active, roll 1 additional defense die. After you suffer damage, lose 1 :charge:.', charge: 1 },
  valenRudor: { skillName: 'Valen Rudor', description: 'After a friendly ship at range 0-1 defends (after the damage is resolved, if any), perform an action.' },
  scourgeSkutu: { skillName: 'Scourge Skutu', description: 'While you perform an attack against a defender in your :bullseye:, roll 1 additional die.' },
  loneWolf: { skillName: 'Lone Wolf', description: 'While you defend or attack, if there are no other friendly ships at range 0-2, reroll 1 blank result, or a :focus: result, if you have no other means to modify it.' },
  seynMarana: { skillName: 'Seyn Marana', description: 'While you perform an attack, if the defender is not shielded, spend 1 :crit: result. If you do, deal 1 faceup damage card to the defender, then cancel your remaining results.' },
  majorRhymer: { skillName: 'Major Rhymer', description: 'While you perform :missile: or :torpedo: attack, you may increase or decrease the range requirements by 1, to a limit of 0-3.' },
  advancedProtonTorpedoes: { skillName: 'Advanced Proton Torpedoes', description: 'Attack (:lock:): Spend 1 :charge:. Change 1 :hit: result to a :crit: result.', charge: 1, attack: 5, range: WEAPON_RANGE.R1 },
  bombletGenerator: { skillName: 'Bomblet Generator', description: 'During the System Phase, perform a device check. If successful, spend 3 :charge: to drop a Bomblet, using the [1 :straight:], [1 :turn-left:] or [1 :turn-right:] template, depending on which template drops the device closest to an enemy ship.', charge: 3, recharge: 1 },
  barrageMissiles: { skillName: 'Barrage Missiles', description: 'Attack (:focus:): Spend 1 :charge:. If the defender is in your :bullseye:, you may spend 1 or more :charge: to reroll that many attack dice.', charge: 5, attack: 3, range: WEAPON_RANGE.R23 },
  despoiler: { skillName: 'Despoiler', description: 'In the Perform Actions step, perform 2 actions instead of 1.' },
  veteranTurretGunner: { skillName: 'Veteran Turret Gunner', description: 'After you perform a primary attack, perform a bonus :turret: using a :turret: you did not already attack from this round.' },
  deathTroopers: { skillName: 'Death Troopers', description: 'During the Action Activation phase, enemy ships at range 0-1 cannot remove stress tokens.' },
  captainOicunn: { skillName: 'Captain Oicunn', description: 'You can perform primary attacks at range 0.' },
  whisper: { skillName: 'Whisper', description: 'After you perform an attack that hits, gain 1 evade token.' },
  maulerMithel: { skillName: 'Mauler Mithel', description: 'While you perform an attack at attack range 1, roll 1 additional attack die.' },
  pureSabaac: { skillName: 'Pure Sabaac', description: 'While you perform an attack, if you have 1 or fewer damage cards, you may roll 1 additional attack.' },
  intimidation: { skillName: 'Intimidation', description: 'While an enemy ship at range 0 defends, it rolls 1 fewer defense die.' },
  marekSteele: { skillName: 'Marek Steele', description: 'While you perform an attack, if the defender would be dealt a faceup damage card, instead draw 3 damage cards, choose 1, and discard the rest.' },
  fireControlSystem: { skillName: 'Fire Control System', description: 'While you perform an attack, if you have a lock on the defender, you may reroll 1 attack die. If you do, you cannot spend your lock during this attack.' },
  zertikStrom: { skillName: 'Zertik Strom', description: "During the End Phase, you may spend a lock you have on an enemy ship to expose 1 of that ship's damage cards." },
  ionMissiles: { skillName: 'Ion Missiles', description: 'Attack (:lock:): Spend 1 :charge:. If this attack hits, spend 1 :hit: or :crit: result to cause the defender to suffer 1 :hit: damage. All remaining :hit:/:crit: results inflict ion tokens instead of damage.', charge: 3, attack: 3, range: WEAPON_RANGE.R23 },
  heavyLaserCannon: { skillName: 'Heavy Laser Cannon', description: 'Attack: After the Modify Attack Dice step, change all :crit: results to :hit: results.', attack: 4, range: WEAPON_RANGE.R23, bullseye: true },
  rexlerBrath: { skillName: 'Rexler Brath', description: 'After you perform an attack that hits, if you are evading, expose 1 of the defender\'s damage cards.' },
  collisionDetector: { skillName: 'Collision Detector', description: 'While you boost or barrel roll, you can move through and overlap obstacles. After you move through or overlap an obstacle, you may spend :charge: to ignore its effects until the end of the round.', charge: 2 },
  echo: { skillName: 'Echo', description: 'While you roll to decloak, use the (2 :bank-left: / :bank-right:) template.' },
  advancedSensors: { skillName: 'Advanced Sensors', description: 'If performing maneuver would cause you to lose your action, perform an action following Action Selection based on your final ship position, ignoring Barrel Roll actions.' },
  captainFeroph: { skillName: 'Captain Feroph', description: 'While you defend, if the attacker does not have any green tokens, you may change 1 of your :focus: / blank results to an :evade: result.' },
  darthVader: { skillName: 'Darth Vader', description: 'At the start of the Engagement Phase, you may choose 1 ship in your firing arc at range 0-2 and spend 1 :charge:. If you do, that ship suffers 1 :hit: damage unless it chooses to remove 1 green token. Target priority: Attack target, if it has a green token, or nearest enemy in your arc.', charge: 1 },
  majorVermeil: { skillName: 'Major Vermeil', description: 'While you perform an attack, if the defender does not have any green tokens, you may change 1 of your blank results to a :hit: result.' },
  perceptiveCopilot: { skillName: 'Perceptive Copilot', description: 'After you perform a :focus: action, gain 1 focus token.' },
  electronicBaffle: { skillName: 'Electronic Baffle', description: 'During the End Phase, you may suffer 1 :hit: damage to remove 1 red token.' },
  admiralSloane: { skillName: 'Admiral Sloane', description: 'After another friendly ship at range 0-3 defends, if it is destroyed, the attacker gains 2 stress tokens. While a friendly ship at range 0-3 performs an attack against a stressed ship, it may reroll 1 attack die.' },
  howlRunner: { skillName: 'Howl Runner', description: 'When a friendly ship at range 0-1 performs a primary attack, that ship may reroll one attack die.' },
  tacticalScrambler: { skillName: 'Tactical Scrambler', description: "While you obstruct an enemy ship's attack, the defender rolls 1 additional defense die." },
  shieldRegeneration: { skillName: 'Shield Regeneration', description: 'At the end of each turn, you recover 1 :shield:.' },
});
