/**
 * Community upgrade pool — typed `Upgrade` definitions sourced from the
 * community-curated upgrade list (X-Wing 1.0 era).
 *
 * Mechanically converted from the previous JSX-bearing module
 * (`CommunityUpgrades.jsx`) — descriptions are plain text with `:icon-name:`
 * shortcodes that render via `<Rule>`.
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

export const CommunityUpgrades: Readonly<Record<string, Upgrade>> = Object.freeze({
  hullUpgrade: HULL_UPGRADE,
  shieldUpgrade: SHIELD_UPGRADE,
  noUpgrade: { skillName: '-', description: 'No upgrade equipped.' },

  // Shipcard baseline pilot abilities — reuse the shared canonical
  // singletons so identity-comparison across engines works. The
  // original Community `autothrusters` carried X-Wing 1.0 wording
  // ("when defending beyond range 2 outside primary arc, change blank
  // to evade"); the shared `AUTOTHRUSTERS` uses the FGA-7.3 shipcard
  // 2.0 wording, which is what the player reads off the AI card. Same
  // story for Advanced Targeting Computer further down — that entry
  // also gets replaced with the canonical 2.0 wording.
  autothrusters: AUTOTHRUSTERS,
  nimbleBomber: NIMBLE_BOMBER,
  stygiumArray: STYGIUM_ARRAY,
  fullThrottle: FULL_THROTTLE,
  instinctiveAim: INSTINCTIVE_AIM,
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
  clusterMissiles: { skillName: 'Cluster Missiles', description: 'Attack (:lock:): Spend 1 :charge:. After this attack, you may perform this attack as a bonus attack against a different target at range 0-1 of the defender, ignoring the :lock: requirement.', charge: 2, attack: 3, range: WEAPON_RANGE.R12 },
  marksmanship: { skillName: 'Marksmanship', description: 'While you perform an attack, if the defender is in your :bullseye:, you may change 1 :hit: result to a :crit: result.' },
  outmaneuver: { skillName: 'Outmaneuver', description: "While perform a :front-arc: attack, if you are not in defender's firing arc, the defender rolls 1 fewer defense die. Prioritise targets that trigger this ability." },
  ionPulseMissiles: { skillName: 'Ion Pulse Missiles', description: 'Attack (:lock:): Spend 1 :charge:. If this attack hits, spend 1 :crit: or :hit: result to cause the defender to suffer 1 :hit: damage. All remaining :crit:/:hit: results inflict ion tokens instead of damage.', charge: 1, attack: 3, range: WEAPON_RANGE.R23 },
  advancedProtonTorpedoes: { skillName: 'Advanced Proton Torpedoes', description: 'Attack (:lock:): Spend 1 :charge:. Change 1 :hit: result to a :crit: result.', charge: 1, attack: 5, range: WEAPON_RANGE.R1 },
  protonTorpedoes: { skillName: 'Proton Torpedoes', description: 'Attack (:lock:): Spend 1 :charge:. Change 1 :hit: to a :crit: result.', charge: 1, attack: 4, range: WEAPON_RANGE.R23 },
  protonRockets: { skillName: 'Proton Rockets', description: 'Attack (:focus:): Spend 1 :charge:.', charge: 1, attack: 5, range: WEAPON_RANGE.R12 },

  // Several upgrades referenced by the legacy community tree but not previously
  // defined — provide structurally-typed entries so `getCommunityUpgrades`
  // doesn't return undefined. Descriptions sourced from canonical X-Wing rules.
  // Canonical shipcard wording, replacing the legacy X-Wing 1.0 text
  // ("add 1 crit if you have a lock") with the 2.0 version
  // ("roll 1 additional die, change 1 hit to crit").
  advancedTargetingComputer: ADVANCED_TARGETING_COMPUTER,
  accuracyCorrector: { skillName: 'Accuracy Corrector', description: 'When attacking, after modifying your attack dice, if you did not roll at least 2 hits (:hit: or :crit:), cancel all your dice results and add 2 :hit: results.' },
  sensorJammer: { skillName: 'Sensor Jammer', description: 'When defending, change 1 of the attacker\'s :hit: result to a :focus: result. The attacker cannot reroll the die with the changed result.' },
  advancedCloakingDevice: { skillName: 'Advanced Cloaking Device', description: 'After you perform an attack, you may perform a free cloak action.' },
  squadLeader: { skillName: 'Squad Leader', description: 'Replaces Focus Action. Action: Select the friendly ship at range 1-2 with the highest pilot Initiative. That ship performs a free action chosen from the available actions on your action bar.' },
  experimentalInterface: { skillName: 'Experimental Interface', description: 'An ability that replaces a :focus: action is performed as a free action in addition to the :focus: action.' },
  swarmTactics: { skillName: 'Swarm Tactics', description: 'After your Engagement Phase activation, the friendly ship with the lowest pilot Initiative at range 1 may immediately activate to attack.' },
  colonelJendon: { skillName: 'Colonel Jendon', description: 'At the start of the Engagement Phase, the friendly ship with the highest pilot Initiative at range 1 that does not have a :lock: acquires a :lock: on its nearest attack target.' },
  advancedSensors: { skillName: 'Advanced Sensors', description: 'Do not skip Action Selection after a collision with a ship or obstacle, or after executing a red maneuver.' },
  zertikStrom: { skillName: 'Zertik Strom', description: 'Enemy ships at range 1 cannot add their range combat bonus when attacking.' },
  intimidation: { skillName: 'Intimidation', description: 'While you are at range 1 of an enemy ship, reduce that ship\'s agility value by 1.' },
  ionCannon: { skillName: 'Ion Cannon', description: 'Attack: If this attack hits, spend 1 :hit: or :crit: result to cause the defender to suffer 1 :hit:. All other hits inflict ion tokens instead of damage.', attack: 3, range: WEAPON_RANGE.R13 },
  heavyLaserCannon: { skillName: 'Heavy Laser Cannon', description: 'Attack: After the Modify Attack Dice step, change all :crit: results to :hit: results.', attack: 4, range: WEAPON_RANGE.R23 },
  nightBeast: { skillName: 'Night Beast', description: 'After executing a non-red maneuver, perform a free :focus: action.' },
  howlrunner: { skillName: 'Howlrunner', description: 'When another friendly ship at range 1 is attacking with its primary weapon, that ship may reroll 1 attack die.' },
  kathScarlet: { skillName: 'Kath Scarlet', description: 'When you perform an attack, the defender receives 1 stress token if it cancels at least 1 :hit: or :crit: result with a :focus: or :evade: token.' },
  commanderKenkirk: { skillName: 'Commander Kenkirk', description: 'When you have no shields and at least 1 Damage card, increase your agility value by 1.' },
  reconSpecialist: { skillName: 'Recon Specialist', description: 'When you perform a :focus: action, assign 1 additional :focus: token to your ship.' },
  fireControlSystem: { skillName: 'Fire Control System', description: 'After you perform an attack, acquire a :lock: on the defender (do not spend this lock). Next round, treat the enemy you have lock on as your target priority.' },
  backstabber: { skillName: 'Backstabber', description: 'When attacking from outside the defender\'s firing arc, roll 1 additional attack die.' },
  carnorJax: { skillName: 'Carnor Jax', description: 'Enemy ships at range 1 cannot perform :focus: or :evade: actions or spend :focus: or :evade: tokens.' },
  rearAdmiralChiraneau: { skillName: 'Rear Admiral Chiraneau', description: 'When attacking, if you have :evade: token, you may change 1 :focus: result to a :crit: result.' },
  maraJade: { skillName: 'Mara Jade', description: 'At the end of the Combat phase, each enemy ship at range 1 receives 1 stress token unless it already has at least 1 stress token.' },
  commanderAlozen: { skillName: 'Commander Alozen', description: 'When attacking, if there is an enemy at range 1 that you do not have a :lock: on, acquire a :lock: on it. It is now the priority target.' },
  redline: { skillName: 'Redline', description: 'You may maintain up to 2 Target Locks. Each Target Lock must be on a different ship.' },
  iden: { skillName: 'Iden Versio', description: 'Once per round, when a friendly TIE fighter at range 1 is hit by an attack, you may cancel 1 :hit: result.' },
  flightInstructor: { skillName: 'Flight Instructor', description: 'When defending, you may reroll 1 of your :focus: results. If the attacker\'s pilot Initiative value is 2 or lower, you may reroll 1 of your blank results instead.' },
  drawTheirFire: { skillName: 'Draw Their Fire', description: 'When a friendly ship at range 1 is hit by an attack, suffer 1 of the uncanceled :crit: results instead of the target ship.' },
  rebelCaptive: { skillName: 'Rebel Captive', description: 'Once per round, the first enemy ship that declares you as the target of an attack immediately receives 1 stress token.' },
  fleetOfficer: { skillName: 'Fleet Officer', description: 'Replaces Focus Action. Action: The 2 nearest friendly ships at range 1-2 each gain a :focus: token. If there are 0 or 1 friendly ships in range, this ship gains a :focus: token as well.' },
  tacticalJammer: { skillName: 'Tactical Jammer', description: 'Your ship can obstruct enemy attacks.' },
  captainYorr: { skillName: 'Captain Yorr', description: 'Friendly ships at range 1-2 (including this ship) cannot gain stress tokens.' },
  weaponsEngineer: { skillName: 'Weapons Engineer', description: 'You may maintain 2 :lock: (only 1 per enemy ship). When you acquire a :lock:, lock onto the two nearest enemy ships.' },
  tactician: { skillName: 'Tactician', description: 'After you perform an attack against a ship inside your firing arc at range 2, that ship receives 1 stress token.' },
  enhancedScopes: { skillName: 'Enhanced Scopes', description: 'During the Activation phase, treat your pilot skill value as "0" when determining the order in which ships move.' },
  antiPursuitLasers: { skillName: 'Anti-Pursuit Lasers', description: 'After an enemy ship executes a maneuver that causes it to overlap your ship, roll 1 attack die. On a :hit: or :crit: result, the enemy ship suffers 1 damage.' },
  gunner: { skillName: 'Gunner', description: 'After you perform an attack that does not hit, you may immediately perform a primary weapon attack. You cannot perform another attack this round.' },

  // Defined from the community ship cards (community_ships_cards.pdf) —
  // previously referenced by CommunityUpgradeTree but missing from this pool,
  // so they resolved to `undefined` at runtime (the Record<string, Upgrade>
  // type hid it from tsc, and the validator did not check tree resolution).
  // Transcribed verbatim from the cards. Added 2026-06-05.
  lieutenantColzet: { skillName: 'Lieutenant Colzet', description: 'After attacking, if you have a :lock: on the defender, spend it to flip 1 random face-down Damage card assigned to the defender face-up.' },
  majorRhymer: { skillName: 'Major Rhymer', description: 'When attacking with a secondary weapon, you may increase or decrease the weapon range by 1, to a limit of range 1-3.' },
  ruthless: { skillName: 'Ruthless', description: 'While you perform an attack, the friendly ship at range 0-1 of the defender with the lowest hull value suffers 1 :hit:. You may change 1 of your die results to a :hit: result.' },
  kirKanos: { skillName: 'Kir Kanos', description: 'When attacking at range 2-3, add 1 :hit: result to your roll.' },

  // ── Newer-rules community ship cards (community_ships_cards.pdf p.15-21) ──
  // VT-49 Decimator, TIE Advanced V1, TIE Striker and TIE Reaper are printed
  // as X-Wing 2.0-style cards. Several upgrades reuse a 1.0 name with different
  // rules text, so they get distinct keys here to avoid colliding with the 1.0
  // entries above (e.g. three different "Ruthless", two "Swarm Tactics", two
  // "Howlrunner"/"Intimidation"). Transcribed verbatim from the cards 2026-06-05.
  // NB: TIE Advanced V1 gates by Force value on the card; the Community tree can
  // only gate by initiative, so its printed tier numbers (3/4/5/6) are used as
  // the initiative field — see CommunityUpgradeTree.ts.

  // VT-49 Decimator
  ministerTua: { skillName: 'Minister Tua', description: 'At the start of the Engagement Phase, if you are damaged, perform a white :reinforce: action.' },
  redlineAcquire: { skillName: 'Redline', description: 'You can maintain up to 2 :lock:. After you perform an action, acquire a lock.' },
  plasmaTorpedoes: { skillName: 'Plasma Torpedoes', description: 'Attack (:lock:): Spend 1 :charge:. During the Neutralize Results step, :crit: results are cancelled before :hit: results. After this attack hits, the defender loses 1 shield.', charge: 2, attack: 3, range: WEAPON_RANGE.R23 },
  concussionBombs: { skillName: 'Concussion Bombs', description: 'In the System Phase, follow Class B device logic. If a device may be dropped, spend 1 :charge: and drop 1 Concussion Bomb. If you have any inactive :charge:, skip logic (bomb drop required).', charge: 3 },
  rearAdmiralChiraneauReinforce: { skillName: 'Rear Admiral Chiraneau', description: 'While you perform an attack, if you are reinforced and the defender is in the :front-arc: or :rear-arc: matching your reinforce token, you may change 1 of your :focus: results to a :crit: result.' },
  trickShot: { skillName: 'Trick Shot', description: 'While you perform an attack that is obstructed by an obstacle, roll 1 additional attack die. Prioritize :lock: actions on obstructed targets you can attack.' },
  veteranTurretGunner: { skillName: 'Veteran Turret Gunner', description: 'After you perform a primary attack, you may perform a bonus :turret: attack using a :turret: you did not already attack from this round.' },
  swarmTacticsTreat: { skillName: 'Swarm Tactics', description: 'At the start of the Engagement Phase, choose 1 friendly ship at range 1 with a lower initiative that has a shot. Treat that ship\'s initiative as equal to yours until the end of the round.' },
  ruthlessFriendlyHit: { skillName: 'Ruthless', description: 'While you attack, if a friendly ship is at range 0-1 of the defender, change 1 of your blank or :focus: results to a :hit: result. If you do, the friendly ship suffers 1 :hit: damage. Prioritize attacks that trigger this ability.' },
  howlrunnerNear: { skillName: 'Howlrunner', description: 'While a friendly ship at range 0-1 performs a primary attack, that ship may reroll 1 attack die.' },
  darthVader: { skillName: 'Darth Vader', description: 'At the start of the Engagement Phase, choose an enemy ship in arc at range 0-2. That ship suffers 1 damage unless it chooses to remove 1 green token. Prioritize the ship that you will shoot.' },
  deathTroopers: { skillName: 'Death Troopers', description: 'During the Activation Phase, enemy ships at range 0-1 cannot remove stress tokens.' },
  captainOicunn: { skillName: 'Captain Oicunn', description: 'You may perform primary attacks at range 0.' },
  intimidationRange0: { skillName: 'Intimidation', description: 'While an enemy ship at range 0 defends, it rolls 1 fewer defense die.' },
  seasonedNavigator: { skillName: 'Seasoned Navigator', description: 'Change your chosen maneuver to another non-red maneuver of the same speed and increase its difficulty if it would put an enemy at range 0 and you are able to attack.' },
  dauntless: { skillName: 'Dauntless', description: 'After you partially execute a maneuver, you may perform 1 white action.' },

  // TIE Advanced V1 (Force-gated on the card; tier numbers used as initiative)
  protonRocketsBullseye: { skillName: 'Proton Rockets', description: 'Attack (:focus:): Spend 1 :charge:. Prioritize :boost: and :barrelroll: in your Select Action step to get Target in :bullseye: at range 1-2.', charge: 1, attack: 5, range: WEAPON_RANGE.R12 },
  predictiveShot: { skillName: 'Predictive Shot', description: 'After you declare an attack, if the defender is in your :bullseye:, you may spend 1 :force:. If you do, during the Roll Defense Dice step, the defender cannot roll more defense dice than the number of your :hit:/:crit: results. Prioritize :boost: and :barrelroll: to get Target in :bullseye: at range 1-3.' },
  malice: { skillName: 'Malice', description: 'When you perform an attack, you may spend 1 :force: to change 1 :focus: or :hit: result to a :crit: result. If you do, after you perform that attack, if the defender was dealt 1 or more faceup Pilot or Crew damage cards, recover 2 :force:.' },
  clusterMissilesAdvV1: { skillName: 'Cluster Missiles', description: 'Attack (:lock:): Spend 1 :charge:. After this attack you may perform this attack as a bonus attack against a different target at range 0-1 of the defender, ignoring the :lock: requirement.', charge: 4, attack: 3, range: WEAPON_RANGE.R12 },
  collisionDetector: { skillName: 'Collision Detector', description: 'Roll 1 attack die if your maneuver, :boost:, or :barrelroll: would move through or overlap an obstacle. On a :hit: or :crit: result, ignore the obstacle\'s effects this round. Otherwise, swerve / choose actions as normal.' },
  shatteringShot: { skillName: 'Shattering Shot', description: 'While you perform an attack, if the attack is obstructed by an obstacle or the defender is at range 0 of an obstacle, you may spend 1 :force: to add 1 :focus: result. Prioritize :boost: and :barrelroll: to get a Target that triggers this ability.' },
  grandInquisitorDefence: { skillName: 'Grand Inquisitor (Defence)', description: 'While you defend at attack range 1, spend 1 :force: to prevent the range 1 bonus.' },
  concussionMissilesExpose: { skillName: 'Concussion Missiles', description: 'Attack (:lock:): Spend 1 :charge:. After this attack hits, each ship at range 0-1 of the defender exposes 1 of its damage cards.', charge: 3, attack: 3, range: WEAPON_RANGE.R23 },
  fireControlSystemMaximize: { skillName: 'Fire Control System', description: 'While you attack an enemy ship you have :lock:, if only 1 attack die needs to be rerolled to maximize damage, reroll that die and keep your lock.' },
  extremeManeuvers: { skillName: 'Extreme Maneuvers', description: 'In the Select Action step, if a :barrelroll: using the turn 4 or 6 template would get a shot when a normal :barrelroll: would not, spend 1 :force: to :barrelroll: using the turn template.' },
  foresight: { skillName: 'Foresight', description: 'If an enemy ends its maneuver in your :bullseye:, spend 1 :force: to perform this bonus attack against it (range 1-3). Change 1 :focus: result to a :hit: result; your dice cannot be modified otherwise.', attack: 2, range: WEAPON_RANGE.R13 },
  hate: { skillName: 'Hate', description: 'After you suffer 1 or more damage, recover that many :force:.' },
  supernaturalReflexes: { skillName: 'Supernatural Reflexes', description: 'During the Select Action step, replace all instances of ":boost: or :barrelroll: :linked: :focus:" with ":boost: :linked: :barrelroll: :linked: :focus: or :barrelroll: :linked: :boost: :linked: :focus:".' },
  grandInquisitorOffence: { skillName: 'Grand Inquisitor (Offence)', description: 'While you perform an attack against a defender at attack range 2-3, you may spend 1 :force: to apply the range 1 bonus.' },

  // TIE Striker
  ruthlessChooseFriendly: { skillName: 'Ruthless', description: 'While you perform an attack, choose a friendly ship at range 0-1 of the defender. That ship suffers 1 :hit:. You may change 1 of your die results to a :hit: result.' },
  suppressiveGunner: { skillName: 'Suppressive Gunner', description: 'When attacking, you may spend 1 :focus: result. If you do, the defender gains 1 Deplete token unless it chooses to suffer 1 :hit:.' },
  elusive: { skillName: 'Elusive', description: 'When defending, you may spend 1 :charge: to reroll 1 defense die. After you fully execute a red maneuver, recover 1 :charge:.', charge: 1 },
  ionBombs: { skillName: 'Ion Bombs', description: 'During the System Phase, you may spend 1 :charge: to drop an Ion Bomb using the 1 :straight: template if the final position would be within range 1 of one or more enemy ships.', charge: 2 },
  protonBombs: { skillName: 'Proton Bombs', description: 'During the System Phase, you may spend 1 :charge: to drop a Proton Bomb using the 1 :straight: template if the final position would be within range 1 of one or more enemy ships.', charge: 2 },
  proximityBombs: { skillName: 'Proximity Bombs', description: 'During the System Phase, you may spend 1 :charge: to drop a Proximity Mine using the 1 :straight: template if the final position would be within range 0 of one or more enemy ships.', charge: 2 },

  // TIE Reaper
  isbSlicer: { skillName: 'ISB Slicer', description: 'During the End Phase, enemy ships at range 1-2 cannot remove Jam tokens.' },
  disciplined: { skillName: 'Disciplined', description: 'After another friendly ship at range 0-3 is destroyed, you may perform a :lock: action to acquire a lock on the nearest enemy ship.' },
  tacticalScrambler: { skillName: 'Tactical Scrambler', description: 'While you obstruct an enemy ship\'s attack, the defender rolls 1 additional defense die.' },
  cienaRee: { skillName: 'Ciena Ree', description: 'After you perform a :coordinate: action, if the ship you coordinated performed a :boost: or :barrelroll: action and does not have an enemy ship in arc, it may gain 1 stress token to rotate 90° to put the nearest possible enemy ship in arc.' },
  tacticalOfficer: { skillName: 'Tactical Officer', description: ':coordinate: replaces :focus: in the Select Action step.' },
  snapShot: { skillName: 'Snap Shot', description: 'After an enemy ship executes a maneuver, you may perform this attack against it as a bonus attack (range 2). Attack: Your dice cannot be modified.', attack: 2 },
});
