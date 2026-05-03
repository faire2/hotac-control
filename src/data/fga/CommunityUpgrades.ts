/**
 * Community upgrade pool — typed `Upgrade` definitions sourced from the
 * community-curated upgrade list (X-Wing 1.0 era).
 *
 * Mechanically converted from the previous JSX-bearing module
 * (`CommunityUpgrades.jsx`) — descriptions are plain text with `:icon-name:`
 * shortcodes that render via `<Rule>`.
 */

import type { Upgrade } from '../shared/coreUpgrades';
import { HULL_UPGRADE, SHIELD_UPGRADE, WEAPON_RANGE } from '../shared/coreUpgrades';

export const CommunityUpgrades: Readonly<Record<string, Upgrade>> = Object.freeze({
  hullUpgrade: HULL_UPGRADE,
  shieldUpgrade: SHIELD_UPGRADE,
  noUpgrade: { skillName: '-', description: 'No upgrade equipped.' },

  autothrusters: { skillName: 'Autothrusters', description: "When you are defending, when you are beyond range 2 or outside the attacker's primary arc, change 1 of your blank results to a :evade: result." },
  stealthDevice: { skillName: 'Stealth Device', description: 'Increase your agility value by 1. If you are hit by an attack this ability ceases.' },
  expertHandling: { skillName: 'Expert Handling', description: 'When you perform a :barrelroll: action, remove 1 enemy Target lock from your ship.' },
  whisper: { skillName: 'Whisper', description: 'After you perform an attack that hits, gain 1 :focus: token.' },
  elusiveness: { skillName: 'Elusiveness', description: 'When defending, the attacker must reroll one :crit: or :hit: result. You cannot use this ability if you are Stressed.' },
  darkCurse: { skillName: 'Dark Curse', description: 'When defending, ships attacking you cannot spend :focus: tokens or reroll attack dice.' },
  expose: { skillName: 'Expose', description: 'Replaces Focus Action. Action: Until the end of the round, increase your primary attack value by 1 and decrease your agility by 1.' },
  targetingComputer: { skillName: 'Targeting Computer', description: 'After selecting a target, if it is in range, perform a free :lock: action on it. Spend this Target Lock after attacking.' },
  opportunist: { skillName: 'Opportunist', description: 'When attacking, if you are not stressed and if the defender does not have any Focus or Evade tokens, roll 1 additional attack die. Prioritise targets that trigger this ability.' },
  turrPhennir: { skillName: 'Turr Phennir', description: 'After you perform an attack, perform a free :boost: or :barrelroll: action if doing so reduces the number of total possible attack dice threatening you.' },
  pushTheLimit: { skillName: 'Push The Limit', description: 'Perform an additional action during the Action Selection.' },
  captainKagi: { skillName: 'Captain Kagi', description: 'When an enemy ship requires a Target Lock, it must lock onto your ship if able.' },
  soontirFell: { skillName: 'Soontir Fel', description: 'After selecting a target, gain 1 Focus token.' },
  predator: { skillName: 'Predator', description: 'While you perform a primary attack, if the defender is in your :bullseye:, you may reroll 1 attack die.' },
  rexlerBrath: { skillName: 'Rexler Brath', description: 'When attacking, all Damage cards you deal to the defender are dealt face-up.' },
  loneWolf: { skillName: 'Lone Wolf', description: 'When attacking or defending, if there are no other friendly ships at range 0-2, you may reroll 1 of your blank results.' },
  maulerMithel: { skillName: 'Mauler Mithel', description: 'When attacking at range 1, roll 1 additional attack die.' },
  homingMissiles: { skillName: 'Homing Missiles', description: 'Attack (:focus:): Spend 1 :charge:. After you declare the defender, the defender may choose to suffer 1 :hit:. If it does, skip the Attack and Defense Dice steps and the attack is treated as hitting.', charge: 1, attack: 4, range: WEAPON_RANGE.R23 },
  extraMunitions: { skillName: 'Extra Munitions', description: 'Add one :charge: to any equipped ordnance.' },
  calculation: { skillName: 'Calculation', description: 'Gain a Calculate token. Spend the token to change 1 of your :focus: result to a :hit: or :evade: result.' },
  clusterMissiles: { skillName: 'Cluster Missiles', description: 'Attack (:lock:): Spend 1 :charge:. After this attack, you may perform this attack as a bonus attack against a different target at range 0-1 of the defender, ignoring the :lock: requirement.', charge: 1, attack: 3, range: WEAPON_RANGE.R12 },
  marksmanship: { skillName: 'Marksmanship', description: 'When you perform an attack, change 1 :hit: result to a :crit: result.' },
  outmaneuver: { skillName: 'Outmaneuver', description: "While perform a :front-arc: attack, if you are not in defender's firing arc, the defender rolls 1 fewer defense die. Prioritise targets that trigger this ability." },
  ionPulseMissiles: { skillName: 'Ion Pulse Missiles', description: 'Attack (:lock:): Spend 1 :charge:. If this attack hits, spend 1 :crit: or :hit: result to cause the defender to suffer 1 :hit: damage. All remaining :crit:/:hit: results inflict ion tokens instead of damage.', charge: 1, attack: 3, range: WEAPON_RANGE.R23 },
  advancedProtonTorpedoes: { skillName: 'Advanced Proton Torpedoes', description: 'Attack (:lock:): Spend 1 :charge:. Change 1 :hit: result to a :crit: result.', charge: 1, attack: 5, range: WEAPON_RANGE.R1 },
  protonTorpedoes: { skillName: 'Proton Torpedoes', description: 'Attack (:lock:): Spend 1 :charge:. Change 1 :hit: to a :crit: result.', charge: 1, attack: 4, range: WEAPON_RANGE.R23 },
  protonRockets: { skillName: 'Proton Rockets', description: 'Attack (:focus:): Spend 1 :charge:.', charge: 1, attack: 5, range: WEAPON_RANGE.R12 },

  // Several upgrades referenced by the legacy community tree but not previously
  // defined — provide structurally-typed entries so `getCommunityUpgrades`
  // doesn't return undefined. Descriptions sourced from canonical X-Wing rules.
  advancedTargetingComputer: { skillName: 'Advanced Targeting Computer', description: 'When attacking, if you have a Target Lock on the defender, change 1 :hit: result to a :crit: result. You can not spend the Target Lock during this attack.' },
  accuracyCorrector: { skillName: 'Accuracy Corrector', description: 'During the Modify Attack Dice step, you may cancel all of your dice. Then add 2 :hit: results to your roll.' },
  sensorJammer: { skillName: 'Sensor Jammer', description: 'When defending, you may change one of the attacker\'s :hit: results to a :focus: result.' },
  advancedCloakingDevice: { skillName: 'Advanced Cloaking Device', description: 'After you perform an attack, you may perform a free cloak action.' },
  squadLeader: { skillName: 'Squad Leader', description: 'Action: Choose another friendly ship at range 1-2. That ship may immediately perform 1 free action shown in its action bar.' },
  experimentalInterface: { skillName: 'Experimental Interface', description: 'Once per round, after you perform an action, you may perform 1 free action from an equipped Upgrade card with the "Action:" header.' },
  swarmTactics: { skillName: 'Swarm Tactics', description: 'At the start of the Combat phase, you may choose 1 friendly ship at range 1. Treat that ship\'s pilot skill value as equal to your pilot skill value until the end of the phase.' },
  colonelJendon: { skillName: 'Colonel Jendon', description: 'At the start of the Combat phase, you may choose 1 friendly ship at range 1-2. Transfer 1 enemy Target Lock from your ship to the chosen ship.' },
  advancedSensors: { skillName: 'Advanced Sensors', description: 'After you reveal your maneuver, you may perform 1 free action.' },
  zertikStrom: { skillName: 'Zertik Strom', description: 'When attacking, if your Target Lock is on the defender, you may receive 1 stress token to choose 1 of the defender\'s face up Damage cards. Trigger that card\'s effect as if it had just been dealt to the defender.' },
  intimidation: { skillName: 'Intimidation', description: 'While you are at range 1 of an enemy ship, reduce that ship\'s agility value by 1.' },
  ionCannon: { skillName: 'Ion Cannon', description: 'Attack: If this attack hits the defender, the defender suffers 1 :hit: damage and receives 1 ion token. Cancel all dice results.', attack: 3, range: WEAPON_RANGE.R13 },
  heavyLaserCannon: { skillName: 'Heavy Laser Cannon', description: 'Attack: After the Modify Attack Dice step, change all :crit: results to :hit: results.', attack: 4, range: WEAPON_RANGE.R23 },
  nightBeast: { skillName: 'Night Beast', description: 'After executing a green maneuver, you may perform a free :focus: action.' },
  howlrunner: { skillName: 'Howlrunner', description: 'When another friendly ship at range 1 is attacking with its primary weapon, that ship may reroll 1 attack die.' },
  kathScarlet: { skillName: 'Kath Scarlet', description: 'When you perform an attack, the defender receives 1 stress token if it cancels at least 1 :hit: or :crit: result with a :focus: or :evade: token.' },
  commanderKenkirk: { skillName: 'Commander Kenkirk', description: 'When you have no shields and at least 1 Damage card, increase your agility value by 1.' },
  reconSpecialist: { skillName: 'Recon Specialist', description: 'When you perform a :focus: action, assign 1 additional :focus: token to your ship.' },
  fireControlSystem: { skillName: 'Fire Control System', description: 'After you perform an attack, you may acquire a Target Lock on the defender, even if you already have a Target Lock.' },
  backstabber: { skillName: 'Backstabber', description: 'When attacking from outside the defender\'s firing arc, roll 1 additional attack die.' },
  carnorJax: { skillName: 'Carnor Jax', description: 'Enemy ships at range 1 cannot perform :focus: or :evade: actions or spend :focus: or :evade: tokens.' },
  rearAdmiralChiraneau: { skillName: 'Rear Admiral Chiraneau', description: 'When attacking, if you have :evade: token, you may change 1 :focus: result to a :crit: result.' },
  maraJade: { skillName: 'Mara Jade', description: 'At the end of the Combat phase, each enemy ship at range 1 receives 1 stress token unless it already has at least 1 stress token.' },
  commanderAlozen: { skillName: 'Commander Alozen', description: 'Friendly ships at range 1 may treat their pilot skill value as 8 when attacking.' },
  redline: { skillName: 'Redline', description: 'You may maintain up to 2 Target Locks. Each Target Lock must be on a different ship.' },
  iden: { skillName: 'Iden Versio', description: 'Once per round, when a friendly TIE fighter at range 1 is hit by an attack, you may cancel 1 :hit: result.' },
  flightInstructor: { skillName: 'Flight Instructor', description: 'When defending, if the attacker\'s pilot skill is "2" or lower, you may reroll 1 of your :focus: results.' },
  drawTheirFire: { skillName: 'Draw Their Fire', description: 'When a friendly ship at range 1 is hit by an attack, you may suffer 1 of those :hit: or :crit: results instead.' },
  rebelCaptive: { skillName: 'Rebel Captive', description: 'Once per round, the first enemy ship that declares you as the target of an attack immediately receives 1 stress token.' },
  fleetOfficer: { skillName: 'Fleet Officer', description: 'Action: Receive 1 stress token to choose 2 friendly ships at range 1-2. Each of those ships may acquire 1 :focus: token.' },
  tacticalJammer: { skillName: 'Tactical Jammer', description: 'Your ship can obstruct enemy attacks.' },
  captainYorr: { skillName: 'Captain Yorr', description: 'You may have up to 2 stress tokens. As long as another friendly ship at range 1-2 has at least 1 stress token, you may remove 1 stress token from that ship.' },
  weaponsEngineer: { skillName: 'Weapons Engineer', description: 'You may maintain 2 Target Locks. When you acquire a Target Lock, you may lock onto 2 different ships.' },
  tactician: { skillName: 'Tactician', description: 'After you perform an attack against a ship inside your firing arc at range 2, that ship receives 1 stress token.' },
  enhancedScopes: { skillName: 'Enhanced Scopes', description: 'During the Activation phase, treat your pilot skill value as "0" when determining the order in which ships move.' },
  antiPursuitLasers: { skillName: 'Anti-Pursuit Lasers', description: 'After an enemy ship executes a maneuver that causes it to overlap your ship, roll 1 attack die. On a :hit: or :crit: result, the enemy ship suffers 1 damage.' },
  gunner: { skillName: 'Gunner', description: 'After you perform an attack that does not hit, you may immediately perform a primary weapon attack. You cannot perform another attack this round.' },
});
