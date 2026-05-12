/**
 * Anderson upgrade pool — typed `Upgrade` definitions transcribed from
 * `docs/anderson/AI_Alternative_Empire_PILOTCARDS_4x.pdf`.
 *
 * Hull Upgrade and Shield Upgrade reuse the canonical `HULL_UPGRADE` /
 * `SHIELD_UPGRADE` from `shared/coreUpgrades.ts` so identity comparison
 * (`upgrade === HULL_UPGRADE`) works for `countExtraHullAndShield`.
 *
 * Skill names that happen to match a Community upgrade (e.g. "Whisper",
 * "Iden Versio") get their OWN Anderson entries — the Anderson card text
 * differs from the Community version for most of these pilots.
 *
 * Initiative thresholds and descriptions verified against 400-dpi raster
 * crops of the source PDF. See `docs/anderson/TRANSCRIPTION_NOTES.md` for
 * the remaining icon-shortcode TODOs.
 */

import type { Upgrade } from '../shared/coreUpgrades';
import { HULL_UPGRADE, SHIELD_UPGRADE } from '../shared/coreUpgrades';

export const AndersonUpgradePool: Readonly<Record<string, Upgrade>> = Object.freeze({
  // ── Canonical shared ──────────────────────────────────────────────
  hullUpgrade: HULL_UPGRADE,
  shieldUpgrade: SHIELD_UPGRADE,

  // ── Defensive / sensor systems (Basic slot, mostly) ───────────────
  stealthDevice: {
    skillName: 'Stealth Device',
    description: 'While you defend, if you are at full health, roll 1 additional defense die.',
  },
  targetingComputer: {
    skillName: 'Targeting Computer',
    description: 'While you perform an attack, you may reroll 1 attack die.',
  },
  advancedSensors: {
    skillName: 'Advanced Sensors',
    description: 'Do not skip Action Selection after a collision with a ship or obstacle, or after executing a red maneuver.',
  },
  sensorJammer: {
    skillName: 'Sensor Jammer',
    description: "While defending, change 1 of the attacker's :hit: results to a :focus: result.",
  },
  passiveSensors: {
    skillName: 'Passive Sensors',
    description: 'When you would perform a :lock: action, perform a calculate action instead and mark your ship with a :charge: token. When you engage, spend the token to perform a :lock: action.',
  },
  collisionDetector: {
    skillName: 'Collision Detector',
    description: "Roll 1 attack die if you would move through or overlap an obstacle. On a :hit: or :focus:, ignore the obstacle's effects this round. Otherwise, swerve as normal. When overlapping a ship, perform a :focus: action.",
  },

  // ── Generic attack / defense modifiers ────────────────────────────
  outmaneuver: {
    skillName: 'Outmaneuver',
    description: "While you perform a :front-arc: attack, if you are not in the defender's firing arc, the defender rolls 1 fewer defence dice. Prioritise :barrelroll: or :boost: positions and targets that trigger this ability.",
  },
  intimidation: {
    skillName: 'Intimidation',
    description: 'While an enemy ship at range 0 defends, it rolls 1 fewer defense die.',
  },
  // The deck contains TWO distinct upgrades both named "Iden Versio" with
  // different mechanics — see `idenVersioFuse` below for the TIE Adv x1
  // variant. This one ("perform an attack on death") appears on TIE/in
  // Interceptor card p-02 #3.
  idenVersio: {
    skillName: 'Iden Versio',
    description: 'After you are destroyed, before you are removed, you may perform an attack.',
  },
  // The "delay death by 1 damage" variant of Iden Versio (TIE Advanced x1
  // card p-04 #1). Separate object because the mechanics genuinely differ
  // from the TIE/in Interceptor version. "Fuse token" is the deck's
  // homebrew token vocabulary — confirmed against the printed card.
  idenVersioFuse: {
    skillName: 'Iden Versio',
    description: 'If you would be destroyed, gain a fuse token and remain in play. The next time you suffer damage, you are destroyed.',
  },
  // Pilot does not focus — they coordinate. Red-variant pair covers the
  // stressed case where the ship would have to take a red focus.
  squadLeader: {
    skillName: 'Squad Leader',
    description: 'In the Select Action step, replace :focus: with :coordinate: and :red-focus: with :red-coordinate:. Prioritise lower-initiative friendly ships when coordinating.',
  },
  lieutenantSai: {
    skillName: 'Lieutenant Sai',
    description: 'After you perform a :coordinate: or :red-coordinate: action, gain a focus token.',
  },
  swarmTactics: {
    skillName: 'Swarm Tactics',
    description: "After you engage, choose the nearest lower-initiative friendly ship at range 0-2 that has a shot. Treat that ship's initiative as equal to yours until the end of the round.",
  },
  howlrunner: {
    skillName: 'Howlrunner',
    description: 'While a friendly ship at range 0-1 performs a primary attack, that ship may reroll 1 attack die.',
  },
  daredevil: {
    skillName: 'Daredevil',
    description: 'While you perform a :boost: or :red-boost: action, use the 1 :turn-left: or 1 :turn-right: template if it will better achieve your Select Action objective.',
  },
  fuelInjectionOverride: {
    skillName: 'Fuel Injection Override',
    description: 'While you perform a :barrelroll: or :boost:, use a template of 1 speed higher if doing so triggers Outmaneuver or better achieves your Select Action or ability objectives.',
  },

  // ── Initiative / action-economy ───────────────────────────────────
  vultSkerris: {
    skillName: 'Vult Skerris',
    description: 'Before you engage, perform 1 action, even while stressed.',
  },
  turrPhennir: {
    skillName: 'Turr Phennir',
    description: 'After you perform an attack, perform a :barrelroll: or :boost: (not an action), even while stressed, if doing so reduces the number of possible attack dice threatening you.',
  },
  lieutenantHebsly: {
    skillName: 'Lieutenant Hebsly',
    description: 'After you defend, perform a :boost: (not an action) if doing so reduces the number of possible attack dice threatening you.',
  },
  soontirFel: {
    skillName: 'Soontir Fel',
    description: 'At the start of the Engagement Phase, if you have an enemy ship in :bullseye:, gain 1 focus token. Otherwise, if you have an enemy ship in :front-arc:, gain 1 calculate token.',
  },
  whisper: {
    skillName: 'Whisper',
    description: 'After you perform an attack that hits, gain 1 evade token.',
  },
  // Card art uses the quoted variant; the rest of the codebase (Community)
  // does not quote. Standardized to unquoted to match.
  maulerMithel: {
    skillName: 'Mauler Mithel',
    description: 'While you perform an attack at attack range 1, roll 1 additional attack die.',
  },
  rearAdmiralChiraneau: {
    skillName: 'Rear Admiral Chiraneau',
    description: 'While you perform an attack, change 1 of your :focus: results to a :hit: result.',
  },
  // 4-item priority list on the card (not 5 as initial pass suggested).
  maarekStele: {
    skillName: 'Maarek Stele',
    description: 'If the defender would be dealt a faceup damage card from your attack, draw 3 damage cards instead, and choose 1 (in order): direct hit, fuel leak, potential damage, other.',
  },
  sapphire2: {
    skillName: 'Sapphire 2',
    description: 'While you defend, if you are focussed, roll 1 additional defense die.',
  },
  elusive: {
    skillName: 'Elusive',
    description: 'While you defend, you may reroll 1 defense die.',
  },
  pureSabacc: {
    skillName: 'Pure Sabacc',
    description: 'While you perform an attack, if you have 1 or fewer damage cards, roll 1 additional attack die.',
  },
  targetingMatrix: {
    skillName: 'Targeting Matrix',
    description: 'After you perform an attack, the defender gains a strain token.',
  },
  seventhSister: {
    skillName: 'Seventh Sister',
    description: 'While you perform an attack, after the Neutralize Results step, if the attack hit, change all of your :hit: results to :crit: results.',
  },
  nightBeast: {
    skillName: 'Night Beast',
    description: 'After you fully execute a blue or white maneuver, perform a :focus: action. In your Select Action step, if you are already focussed, replace :focus: with :evade:.',
  },
  // Renamed from "wolfGideon" — card actually reads "Moff Gideon". My 150-dpi
  // read was wrong. Mechanic preserved.
  moffGideon: {
    skillName: 'Moff Gideon',
    description: 'While you perform an attack, if a friendly ship is at range 0-1 of the defender, it gains a strain token. Then, the defender cannot modify defense dice during this attack.',
  },
  delMeeko: {
    skillName: 'Del Meeko',
    description: 'While a friendly ship at range 0-2 defends against a damaged attacker, the defender may reroll 1 defense die.',
  },
  // Range corrected to 0-3 (was 0-2 in initial pass).
  commandantGoran: {
    skillName: 'Commandant Goran',
    description: 'After a friendly ship at range 0-3 partially executes a maneuver, it performs a :focus: action.',
  },
  nashWindrider: {
    skillName: 'Nash Windrider',
    description: 'During the Engagement Phase, when a friendly small ship at range 0-2 is destroyed, it engages at the current initiative if it has not already engaged.',
  },
  lieutenantLorrir: {
    skillName: 'Lieutenant Lorrir',
    description: 'While you barrel roll, use the :bank-left: or :bank-right: template instead of the :straight: template if doing so triggers Outmaneuver or better achieves your Select Action or ability objectives.',
  },
  feedbackEmitter: {
    skillName: 'Feedback Emitter',
    description: 'After an enemy ship acquires a lock on you, roll 1 attack die. On a :hit: or :crit: result, break the lock. On a :focus: result, the enemy ship gains 1 deplete token.',
  },
  apexPredator: {
    skillName: 'Apex Predator',
    description: "While you perform a primary attack, if the defender's initiative is lower than yours, you may reroll 1 attack die.",
  },
  blankSignature: {
    skillName: 'Blank Signature',
    description: 'While defending, if you are not locked by the attacker, change 1 :focus: result to an :evade: result.',
  },
  countdown: {
    skillName: 'Countdown',
    description: 'While you defend, after the Neutralize Results step, if you are not stressed and would suffer 1 :crit: or 2 or more :hit:, gain 1 stress token, suffer 1 damage, and cancel all dice results.',
  },

  // ── Ordnance / weapons (Basic-slot for TIE Adv x1 + TIE/sa Bomber) ──
  // Front-arc attack, 3 dice, range 1-2, 4 charges. Each attack costs 1 charge;
  // chained attacks against nearby targets share the charge pool.
  clusterMissiles: {
    skillName: 'Cluster Missiles',
    description: 'Attack (:lock:) :front-arc:: Spend 1 :charge:. After this attack, spend 1 :charge: to fire again against a different target at range 0-1 of the defender, ignoring the :lock: requirement. Fire primary if 2 targets not possible.',
    charge: 4,
    attack: 3,
  },
  advancedProtonTorpedoes: {
    skillName: 'Advanced Proton Torpedoes',
    description: 'Attack (:lock:): Spend 1 :charge:. Change 1 :focus: result to a :crit: result.',
    charge: 1,
    attack: 5,
  },
  protonTorpedoes: {
    skillName: 'Proton Torpedoes',
    description: 'Attack (:lock:): Spend 1 :charge:. Change 1 :hit: result to a :crit: result.',
    charge: 2,
    attack: 4,
  },
  homingMissiles: {
    skillName: 'Homing Missiles',
    description: 'Attack (:lock:): Spend 1 :charge:. After you declare the defender, the defender may choose to suffer 1 :hit:. If it does, skip the Attack and Defense Dice steps and the attack is treated as hitting.',
    charge: 2,
    attack: 4,
  },
  multiMissilePods: {
    skillName: 'Multi-Missile Pods',
    description: 'Attack (:focus: or :lock:): Spend 1 :charge:. If the defender is in your :front-arc:, spend 1 :charge: to roll 1 additional attack die. If the defender is in your :bullseye:, spend 2 :charge: to roll 2 additional attack dice instead.',
    charge: 4,
    attack: 2,
  },
  concussionMissiles: {
    skillName: 'Concussion Missiles',
    description: 'Attack (:focus:): Spend 1 :charge:. After this attack hits, each ship at range 0-1 of the defender exposes 1 of its damage cards.',
    charge: 3,
    attack: 3,
  },
  // Barrage Rockets uses :focus: (not :lock:), so the in-Action-Selection
  // line redirects locks to focus tokens for this attack profile.
  barrageRockets: {
    skillName: 'Barrage Rockets',
    description: 'Attack (:focus:): Spend 1 :charge:. If the defender is in your :bullseye:, you may spend 1 or more :charge: to reroll that many attack dice. In Action Selection: Replace :lock: with :focus:.',
    charge: 5,
    attack: 3,
  },
  ionMissiles: {
    skillName: 'Ion Missiles',
    description: 'Attack (:lock:): Spend 1 :charge:. If this attack hits, spend 1 :hit: or :crit: result to cause the defender to suffer 1 :hit: damage. All remaining :hit: / :crit: results inflict ion tokens instead of damage.',
    charge: 3,
    attack: 3,
  },

  // ── Devices (Basic-slot pair on TIE/sa Bomber cards) ─────────────
  // Each follows "Class A" or "Class B" device logic — Anderson-specific
  // AI patterns for bomb placement. Preserved as plain text in descriptions.
  thermalDetonators: {
    skillName: 'Thermal Detonators',
    description: 'In the system phase, follow Class B device logic. If a device may be dropped, spend 1 :charge: and drop 1 Thermal Detonator. Repeat the process a second time (must use a different template).',
    charge: 4,
  },
  connerNet: {
    skillName: 'Conner Net',
    description: 'In the system phase, follow Class A device logic. If a device may be dropped, spend 1 :charge: and drop 1 Conner Net.',
    charge: 1,
  },
  proximityMines: {
    skillName: 'Proximity Mines',
    description: 'In the system phase, follow Class A device logic. If a device may be dropped, spend 1 :charge: and drop 1 Proximity Mine.',
    charge: 1,
  },
  clusterMines: {
    skillName: 'Cluster Mines',
    description: 'In the system phase, follow Class A device logic. If a device may be dropped, spend 1 :charge: and drop 1 set of Cluster Mines.',
    charge: 1,
  },
  // p-06 #1 prints "drop 1 Proton Bomb" inside an upgrade titled
  // Electro-Chaff Missiles — confirmed card-print typo. Use the
  // sensible name. See "weird cards" appendix in TRANSCRIPTION_NOTES.md.
  electroChaffMissiles: {
    skillName: 'Electro-Chaff Missiles',
    description: 'In the system phase, follow Class A device logic. If a device may be dropped, spend 1 :charge: and drop 1 Electro-Chaff Cloud.',
    charge: 1,
  },
  // Card displays the alt name "Seismic Charges (or Proton Bombs)" in italic,
  // indicating the squadron may substitute either device.
  seismicCharges: {
    skillName: 'Seismic Charges',
    description: 'In the system phase, follow Class B device logic. If a device may be dropped, spend 1 :charge: and drop 1 Proton Bomb. If mission has obstacles tied to objectives, or fewer than 6 obstacles.',
    charge: 2,
  },
  ionBombs: {
    skillName: 'Ion Bombs',
    description: 'In the system phase, follow Class B device logic. If a device may be dropped, spend 1 :charge: and drop 1 Ion Bomb.',
    charge: 2,
  },
  protonBombs: {
    skillName: 'Proton Bombs',
    description: 'In the system phase, follow Class B device logic. If a device may be dropped, spend 1 :charge: and drop 1 Proton Bomb.',
    charge: 2,
  },

  // ── Bomber elite upgrades ─────────────────────────────────────────
  extraMunitions: {
    skillName: 'Extra Munitions',
    description: 'All basic upgrades gain 1 :charge:.',
  },
  skilledBombardier: {
    skillName: 'Skilled Bombardier',
    description: 'If you would drop or launch a device, you may use a template of the same bearing with a speed 1 higher or lower.',
  },
  // p-05 #1 + p-06 #3 — "speed 3-5 maneuver → try to launch a bomb".
  deathfireManeuver: {
    skillName: 'Deathfire',
    description: 'After you fully execute a speed 3-5 maneuver, if you have not dropped or launched a device this round, follow Class B device logic to attempt to launch a bomb using the 3 :straight: template.',
  },
  // p-05 #2 — "destroyed → attack + drop Class A device".
  deathfireDeathA: {
    skillName: 'Deathfire',
    description: 'After you are destroyed, before you are removed, perform an attack and drop 1 device following Class A logic (no roll needed).',
  },
  // p-06 #2 — same death trigger but with Class B device.
  deathfireDeathB: {
    skillName: 'Deathfire',
    description: 'After you are destroyed, before you are removed, perform an attack and drop 1 device following Class B logic (no roll needed).',
  },
  saturationSalvo: {
    skillName: 'Saturation Salvo',
    description: 'While you perform a :focus: attack, if the defender rolls 2+ results that could cancel damage, spend 1 :focus:. If you do, the defender must reroll 2 of those results (:evade: rerolls prioritised over :focus: rerolls).',
  },
  deathrain: {
    skillName: 'Deathrain',
    description: 'After you drop or launch a device, you may perform an action.',
  },
  trickShot: {
    skillName: 'Trick Shot',
    description: 'While you perform an attack that is obstructed by an obstacle, roll 1 additional attack die. Prioritise :barrelroll: positions, locks and non-lock attacks that trigger this ability.',
  },
  bt1: {
    skillName: 'BT-1',
    description: 'While you perform an attack, you may change 1 :hit: result to a :crit: result for each stress token the defender has.',
  },
  tomaxBren: {
    skillName: 'Tomax Bren',
    description: 'After you perform a :lock: action, gain a focus token.',
  },
  captainJonus: {
    skillName: 'Captain Jonus',
    description: 'While a friendly ship at range 0-1 performs a :focus: or :lock: attack, that ship may reroll up to 2 attack dice.',
  },
  // p-05 #4 — three-step priority list (focus shot at R1-2 → shot at R1-2 → shot).
  afterburnersFocus: {
    skillName: 'Afterburners',
    description: 'After you fully execute a speed 3-5 maneuver, perform a :barrelroll: action, even while stressed, if it will (in order): get a :focus: shot at range 1-2, get a shot at range 1-2, get a shot.',
  },
  // p-06 #4 — simpler two-step priority list (shot at R1-2 → shot).
  afterburnersBasic: {
    skillName: 'Afterburners',
    description: 'After you fully execute a speed 3-5 maneuver, perform a :barrelroll: action, even while stressed, if it will (in order): get a shot at range 1-2, get a shot.',
  },
  // Card prints with quotes; preserved literally.
  redline: {
    skillName: '"Redline"',
    description: 'You can maintain up to 2 locks. After you perform an action, acquire a lock. Prioritise both locks on eligible targets for cluster missiles.',
  },
  ruthless: {
    skillName: 'Ruthless',
    description: 'While you attack, if another friendly ship with 2+ health is range 0-1 of the defender, you may change 1 die result to a :hit: result. If you do, the friendly ship suffers 1 damage.',
  },
  targetAssistAlgorithm: {
    skillName: 'Target-Assist Algorithm',
    description: 'Before you engage, if you have no green tokens and there are 1 or more enemy ships in your :front-arc:, gain a calculate token.',
  },
  tiberSaxon: {
    skillName: 'Tiber Saxon',
    description: 'After you perform an attack at attack range 1-2 that hits, if the defender has no faceup damage cards, the defender gains 1 strain token.',
  },
  zertikStrom: {
    skillName: 'Zertik Strom',
    description: "During the End Phase, you may spend a lock you have on an enemy ship to expose 1 of that ship's damage cards.",
  },
  rexlerBrath: {
    skillName: 'Rexler Brath',
    description: "After you perform an attack that hits, expose 1 of the defender's damage cards.",
  },
  // Phantom variant — gated on "you are evading" (active evade token).
  rexlerBrathEvading: {
    skillName: 'Rexler Brath',
    description: "After you perform an attack that hits, if you are evading, expose 1 of the defender's damage cards.",
  },

  // ── TIE/ph Phantom pilots ─────────────────────────────────────────
  mausMonare: {
    skillName: 'Maus Monare',
    description: 'After you perform a :cloak: action, gain a calculate token.',
  },
  juke: {
    skillName: 'Juke',
    description: "While you perform an attack, if you are evading, change 1 of the defender's :evade: results to a :focus: result.",
  },
  gideonHask: {
    skillName: 'Gideon Hask',
    description: 'While you perform an attack against a damaged defender, roll 1 additional attack die.',
  },
  fifthBrother: {
    skillName: 'Fifth Brother',
    description: 'While you perform an attack, change 1 of your :focus: results to a :crit: result.',
  },
  echo: {
    skillName: 'Echo',
    description: 'While you decloak, you must use the 2 :turn-left: or 2 :turn-right: template instead of the 2 :straight: template. After decloak direction roll: roll 1d6: 1-3 = forward or left, 4-6 = backward or right.',
  },
  majorVynder: {
    skillName: 'Major Vynder',
    description: 'While you defend, if you are cloaked, roll 1 additional defense die.',
  },
  // Card prints with quotes; preserved literally (cf. "Redline").
  wampa: {
    skillName: '"Wampa"',
    description: 'When you perform an attack, if you have not defended this round, roll 1 additional attack die.',
  },
  // Defender Elite variant — "first attack" qualifier because that ship
  // chains a bonus primary via the TIE Defender Elite ability.
  wampaFirst: {
    skillName: '"Wampa"',
    description: 'When you perform your first attack, if you have not defended this round, roll 1 additional attack die.',
  },

  // ── TIE/D Defender pilots + cannons (p-08, p-09) ──────────────────
  heavyLaserCannon: {
    skillName: 'Heavy Laser Cannon',
    description: 'When attacking, after the Modify Attack Dice step, change all :crit: results to :hit: results. Prioritise :barrelroll: and :boost: actions that get your target in :bullseye:.',
    attack: 4,
  },
  fireControlSystem: {
    skillName: 'Fire Control System',
    description: 'While you attack an enemy ship you have locked, if only 1 attack die needs to be rerolled to maximize damage, reroll that die and keep your lock.',
  },
  computerAssistedHandling: {
    skillName: 'Computer Assisted Handling',
    description: 'After you fully execute a maneuver, perform a :barrelroll: or :boost: action if it would get (in order) your target in :bullseye:, an enemy ship in :bullseye:.',
  },
  // Card prints with quotes.
  scourgeSkutu: {
    skillName: '"Scourge" Skutu',
    description: 'While you perform an attack against a defender in your :bullseye:, roll 1 additional attack die.',
  },
  // p-08 #1 — defensive Vermeil-analog gated on the *attacker* having no
  // green tokens (the attacker is exposed).
  captainFeroph: {
    skillName: 'Captain Feroph',
    description: "While you defend, if the attacker does not have any green tokens, change 1 of your blank or :focus: results to an :evade: result.",
  },
  // p-09 #2 — Defender-Elite variant gated on the *defender* (= you)
  // having no green tokens — i.e. you're vulnerable, get a free dice mod.
  captainFerophVulnerable: {
    skillName: 'Captain Feroph',
    description: 'While you defend, if the defender has no green tokens, change 1 of your blank or :focus: results to an :evade: result.',
  },
  // p-08 #2 — shorter wording omitting the Outmaneuver qualifier from
  // the Interceptor version. Treated as a separate entry to stay faithful.
  lieutenantLorrirSimple: {
    skillName: 'Lieutenant Lorrir',
    description: 'While you barrel roll, you must use the :bank-left: or :bank-right: template instead of the :straight: template.',
  },
  // p-08 #2 — :evade: action trigger (Defender variant).
  mausMonareEvade: {
    skillName: 'Maus Monare',
    description: 'After you perform an :evade: action, gain a calculate token.',
  },
  // p-08 #3 — speed 3-5 maneuver, 3-step priority with range-1 focus shot.
  afterburnersR1: {
    skillName: 'Afterburners',
    description: 'After you fully execute a speed 3-5 maneuver, perform a :barrelroll: action, even while stressed, if it will (in order): get a shot at range 1, avoid target\'s arc and still get a shot, get a shot.',
  },
  // p-09 #2 — Defender Elite variant, 2-step range-1 priority.
  afterburnersR1Basic: {
    skillName: 'Afterburners',
    description: 'After you fully execute a speed 3-5 maneuver, perform a :barrelroll: action, even while stressed, if it will (in order): get a shot at range 1, get a shot.',
  },

  // ── TIE/D Defender Elite cannons + pilot abilities (p-09) ────────
  // Mag Pulse Warheads — inflicts jam + deplete + cancels remaining hits.
  magPulseWarheads: {
    skillName: 'Mag Pulse Warheads',
    description: 'Attack (:lock:): Spend 1 :charge:. If this attack hits, the defender suffers 1 :hit: damage and gains 1 deplete and 1 jam token. Then cancel all :hit: / :crit: results. Do not spend your lock.',
    charge: 2,
    attack: 3,
  },
  jammingBeam: {
    skillName: 'Jamming Beam',
    description: 'Attack: Fire only if target is locked. If this attack hits, all :hit: / :crit: results inflict jam tokens instead of damage. Do not spend your lock.',
    attack: 3,
  },
  // Tractor placement priorities are framed from the *enemy's* perspective —
  // place them so they lose a shot, take more attack dice, or risk overlap.
  tractorBeam: {
    skillName: 'Tractor Beam',
    description: 'Attack: Fire only if target is locked. If this attack hits, all :hit: / :crit: results inflict tractor tokens instead of damage. If you hit, place the enemy while keeping them in your :front-arc: to (in order): lose a shot, suffer more attack dice, risk obstacle overlap. Do not spend your lock.',
    attack: 3,
  },
  ionCannon: {
    skillName: 'Ion Cannon',
    description: 'Attack: Do not spend your lock. If this attack hits, spend 1 :hit: or :crit: result to cause the defender to suffer 1 :hit: damage. All other hits inflict ion tokens instead of damage.',
    attack: 3,
  },
  // The TIE Defender Elite intrinsic pilot ability — appears on every p-09
  // card as the second basic-slot row. Card header notes "Use TIE Defender
  // Elite AI card" — meta-marker pointing at the alternate AI behavior
  // table per DATA-LAYER.md §16.
  tieDefenderElite: {
    skillName: 'TIE Defender Elite',
    description: 'After you perform a :focus: or :lock: attack, spend a lock you have on the defender to perform a bonus primary attack on them.',
  },
  // Defender-Elite variant — costs an unused evade result instead of
  // free-firing like the Interceptor version.
  targetingMatrixEvade: {
    skillName: 'Targeting Matrix',
    description: 'While attacking, spend 1 unused :evade: result at the end of the Neutralize Results step. If you do, after the attack is resolved, the defender gains a strain token.',
  },
  // Defender-Elite variant — "final attack" qualifier because that ship
  // chains a bonus primary attack via TIE Defender Elite.
  turrPhennirFinal: {
    skillName: 'Turr Phennir',
    description: 'After you perform your final attack, perform a :barrelroll: or :boost: (not an action), even while stressed, if doing so reduces the number of possible attack dice threatening you.',
  },
  ionManeuveringJet: {
    skillName: 'Ion Maneuvering Jet',
    description: 'After you fully execute a Koiogran Turn (:k-turn:), perform an action, even while stressed.',
  },
  // p-09 #4 — pay 1 strain to take an action, as opposed to the
  // "even while stressed" variant.
  vultSkerrisStrain: {
    skillName: 'Vult Skerris',
    description: 'Before you engage, gain 1 strain token to perform 1 action.',
  },

  // ── T-4a Lambda Class Shuttle (p-10, p-11 #1-2) ───────────────────
  deathTroopers: {
    skillName: 'Death Troopers',
    description: 'During the Activation Phase, enemy ships at range 0-1 cannot remove stress tokens.',
  },
  captainOicunn: {
    skillName: 'Captain Oicunn',
    description: 'You can perform primary attacks at range 0.',
  },
  // Replaces the stressed (red) jam with a free (white) jam — same
  // pattern as Squad Leader's red-coordinate / red-focus pair.
  isbSlicer: {
    skillName: 'ISB Slicer',
    description: 'Action Bar: replace :red-jam: with :jam:. In the End Phase, enemy ships at range 1-2 cannot remove Jam tokens. Prioritise (in order): closest enemy in :front-arc:, closest enemy.',
  },
  // Card prints the skill as "0-0-0".
  zeroZeroZero: {
    skillName: '0-0-0',
    description: 'At the start of the Engagement Phase, choose 1 enemy ship at range 0-1. Gain 1 calculate token unless that ship chooses to gain 1 stress token. Prioritise ships without stress.',
  },
  admiralSloane: {
    skillName: 'Admiral Sloane',
    description: 'While a friendly ship at range 0-3 attacks a stressed enemy ship, it may reroll 1 attack die. When an enemy ship destroys another friendly ship at range 0-3, it gains a stress token.',
  },
  captainDobbs: {
    skillName: 'Captain Dobbs',
    description: 'While another friendly ship at range 0-1 defends, before the Neutralize Results step, if you are in the attack arc and are not ionized, gain 1 ion token to cancel 1 :hit: result.',
  },
  commsTeam: {
    skillName: 'Comms Team',
    description: 'Select Action: swap :coordinate: and :focus:. After you perform a :coordinate: action, perform a calculate action. Then, coordinate 1 additional ship at range 0-1 of the first.',
  },
  st321: {
    skillName: 'ST-321',
    description: 'Select Action step: Swap :coordinate: and :focus:. When you perform a :coordinate: action, acquire a lock on an enemy ship at range 0-3 of the ship you coordinated, ignoring range restrictions. Prioritise (in order) enemies in arc, closest enemy.',
  },
  // p-10 #4 — different action chain than the Interceptor's Lt Sai.
  lieutenantSaiFocus: {
    skillName: 'Lieutenant Sai',
    description: 'After you perform the :coordinate: action, perform a :focus: action.',
  },
  // p-10 #3 — adds "lower initiative" + "if it has a shot" qualifiers
  // to the Interceptor's Commandant Goran.
  commandantGoranLower: {
    skillName: 'Commandant Goran',
    description: 'After a lower-initiative friendly ship at range 0-3 partially executes a maneuver, it performs a :focus: action if it has a shot.',
  },
  // p-10 #4 — automatic (no spend) version of Zertik Strom.
  zertikStromAuto: {
    skillName: 'Zertik Strom',
    description: 'At the Start of the End Phase, the nearest damaged enemy ship you have locked must expose one of its damage cards. If it does, break your lock on that ship.',
  },
  directorKrennic: {
    skillName: 'Director Krennic',
    description: 'When another friendly ship attacks a ship you have locked, it will spend your lock and 1 :focus: / :hit: / :crit: result. Then, the defender must lose 1 shield or flip a facedown damage card.',
  },
  perceptiveCopilot: {
    skillName: 'Perceptive Copilot',
    description: 'After you perform a :focus: action, gain 1 focus token.',
  },
  seasonedNavigator: {
    skillName: 'Seasoned Navigator',
    description: 'Decrease the difficulty of your non-stop red maneuvers.',
  },
  migsMayfeld: {
    skillName: 'Migs Mayfeld',
    description: 'After you perform a :focus: attack, perform a bonus :lock: attack.',
  },
  magnaTolvan: {
    skillName: 'Magna Tolvan',
    description: 'While you have 2 or fewer stress tokens, you can perform white actions, even while stressed (continue as non-stressed AI). After you gain a stress token, you may perform a white action.',
  },
  captainKagi: {
    skillName: 'Captain Kagi',
    description: 'At the start of the Engagement Phase, all friendly ships at range 0-3 transfer their enemy lock tokens to you.',
  },
  ministerTua: {
    skillName: 'Minister Tua',
    description: 'At the start of the Engagement Phase, if you are at half health, perform a white :reinforce: action.',
  },

  // ── Sith Infiltrator (p-11 #3-4) ──────────────────────────────────
  // First ship in the deck to use the X-Wing Force token system, with init
  // values that climb to 7. Each elite slot on these cards prints an
  // "[Adds N force]" annotation that grants additional force capacity.
  drk1ProbeDroids: {
    skillName: 'DRK-1 Probe Droids',
    description: 'During the End Phase, you may spend 1 :charge: to drop or launch 1 DRK-1 probe droid using a speed 3 template.',
    charge: 2,
  },
  // Canonical Hate — the p-11 #3 card prints text that visually collides
  // with Darth Maul's; the intended Hate ability is force recovery on
  // damage. See "weird cards" appendix.
  hate: {
    skillName: 'Hate',
    description: 'After you suffer 1 or more damage, recover that many :force:.',
    addsForce: 1,
  },
  darthMaul: {
    skillName: 'Darth Maul',
    description: 'After you perform an attack, you may spend 2 :force: to perform a bonus primary attack against a different target. If your initial attack missed, you may perform the bonus attack on the initial target instead.',
    addsForce: 1,
  },
  seventhSisterTractor: {
    skillName: 'Seventh Sister',
    description: 'If an enemy ship at range 0-1 would gain a stress token, spend 1 :force: to have it gain 1 tractor token instead. Place the ship if it would (in order): lose a shot, suffer more attack dice, risk obstacle overlap.',
    addsForce: 1,
  },
  darthVader: {
    skillName: 'Darth Vader',
    description: 'At the start of the Engagement Phase, choose the lowest-health enemy ship in your firing arc at range 0-2 and spend 1 :force:. That ship suffers 1 damage unless it chooses to remove 1 green token.',
    addsForce: 1,
  },
  // Sith Infiltrator variant — force-spend dice-add rather than Phantom's
  // free focus-to-crit swap.
  fifthBrotherForce: {
    skillName: 'Fifth Brother',
    description: 'While you perform an attack, after the Neutralize Results step, if the attack hit, spend 1 :force: to add 1 :hit: result.',
    addsForce: 1,
  },
  malice: {
    skillName: 'Malice',
    description: 'While you perform an attack, you may spend 1 :force: to change 1 :focus: or :hit: result to a :crit: result. If you do, and the attack hits, recover 2 :force:.',
    addsForce: 1,
  },

  // ── VT-49 Decimator (p-12) ────────────────────────────────────────
  // p-12 #1 — Decimator variant of Minister Tua; gates on "damaged" rather
  // than the Lambda's "half health" trigger.
  ministerTuaDamaged: {
    skillName: 'Minister Tua',
    description: 'At the start of the Engagement Phase, if you are damaged, perform a white :reinforce: action.',
  },
  // Different priority hint than the bomber's Trick Shot.
  trickShotLock: {
    skillName: 'Trick Shot',
    description: 'While you perform an attack that is obstructed by an obstacle, roll 1 additional attack die. Prioritise :lock: actions on obstructed targets you can attack.',
  },
  // Reinforce-gated focus→crit (Decimator's reinforce token mechanic).
  rearAdmiralChiraneauReinforce: {
    skillName: 'Rear Admiral Chiraneau',
    description: 'While you perform an attack, if you are reinforced and the defender is in your :front-arc: or :rear-arc: matching your reinforce token, change 1 of your :focus: results to a :crit: result.',
  },
  veteranTurretGunner: {
    skillName: 'Veteran Turret Gunner',
    description: 'After you perform a primary attack, perform a bonus :turret: attack using a :turret: you did not already attack from this round.',
  },
  // Decimator variant — re-routes the maneuver instead of reducing
  // difficulty.
  seasonedNavigatorAttack: {
    skillName: 'Seasoned Navigator',
    description: 'Change your chosen maneuver to another non-red maneuver of the same speed if it would put an enemy ship at range 0 and you are able to attack.',
  },
  dauntless: {
    skillName: 'Dauntless',
    description: 'After you partially execute a maneuver, you may perform 1 white action.',
  },
  mornaKee: {
    skillName: 'Morna Kee',
    description: 'During the End Phase, gain 1 reinforce token in the :front-arc: or :rear-arc: that contains the most enemy ships. If no enemy ships are at range 0-3, extend the range of these arcs.',
  },
  lytanDree: {
    skillName: 'Lytan Dree',
    description: "If you are in the defender's :front-arc: or :rear-arc:, attacking friendly ships at range 0-2 may reroll 1 attack die. Friendly ships without a lock or offensive ability prioritise targets in your :front-arc: or :rear-arc:.",
  },

  // ── TIE/sk Striker (p-13) ─────────────────────────────────────────
  // Striker variant — adds "or would put an enemy at risk of your equipped
  // device next round" rationale (Strikers carry bombs).
  turrPhennirDevice: {
    skillName: 'Turr Phennir',
    description: 'After you perform an attack, perform a :barrelroll: or :boost: (not an action), even while stressed, if doing so reduces the number of possible attack dice threatening you or would put an enemy at risk of your equipped device next round.',
  },
  // Striker variant — drops the class-logic step ("no device logic
  // required") since the Striker dies and the bomb just goes.
  deathfireDeathGeneric: {
    skillName: 'Deathfire',
    description: 'After you are destroyed, before you are removed, perform an attack and drop 1 device (no device logic required).',
  },
  duchess: {
    skillName: 'Duchess',
    description: 'Use your Adaptive Ailerons even while stressed.',
  },
  vagabond: {
    skillName: 'Vagabond',
    description: 'After you fully execute a maneuver using your Adaptive Ailerons, attempt to drop a device following Class A logic.',
  },
  // Striker variant — no stress scaling.
  bt1Simple: {
    skillName: 'BT-1',
    description: 'While you perform an attack, change 1 :hit: result to a :crit: result.',
  },
  // Striker variant — explicit Action-Selection swap prefix.
  jukeReplace: {
    skillName: 'Juke',
    description: "Action Selection: replace :focus: with :evade:. While you perform an attack, if you are evading, change 1 of the defender's :evade: results to a :focus: result.",
  },
  suppressiveGunner: {
    skillName: 'Suppressive Gunner',
    description: 'While you perform an attack, spend 1 :focus: result. If you do, the defender gains 1 deplete token unless it chooses to suffer 1 :hit: damage.',
  },

  // ── TIE Reaper (p-14) ─────────────────────────────────────────────
  tacticalOfficer: {
    skillName: 'Tactical Officer',
    description: ':coordinate: replaces :focus: in the Select Action step (coordinate all friendly ships).',
  },
  // Canonical Lt Kestal — the p-17 #3 Aggressor card prints text that
  // visually collides with Major Vermeil's "no green tokens" wording;
  // confirmed via the rest of the deck that the intended ability is
  // the focus-cancel-all-defense effect.
  lieutenantKestal: {
    skillName: 'Lieutenant Kestal',
    description: "While you perform an attack, after the defender rolls defense dice, you may spend 1 focus token to cancel all of the defender's blank / :focus: results.",
  },
  cienaRee: {
    skillName: 'Ciena Ree',
    description: 'When coordinating, if able, choose the closest friendly lower-initiative ship that can get a shot by being coordinated a :barrelroll: or :boost:, and then rotating 90°. If you do, the ship gains 1 stress token.',
  },
  darkCurse: {
    skillName: 'Dark Curse',
    description: "While you defend, the attacker's dice cannot be modified.",
  },
  scythe6: {
    skillName: 'Scythe 6',
    description: 'While you perform an attack at range 1-2, roll 1 additional attack die.',
  },
  // Reaper pilot — assigns the "Hunted" condition. The prefix
  // "If this squad's behaviour is not Attack, re-draw this pilot card"
  // is a deck-build-time meta-rule (squad must already be using the
  // Attack AI engine to take this pilot). Captured as descriptor text.
  agentKallus: {
    skillName: 'Agent Kallus',
    description: "If this squad's behaviour is not Attack, re-draw this pilot card. When you deploy, assign the Hunted condition to a random enemy ship of the highest initiative. While you attack the Hunted ship, change 1 :focus: result to a :hit: result. If the Hunted ship is destroyed, pick a new enemy as above.",
  },
  // Reaper variant — different mechanic from the Interceptor's
  // Targeting Computer (reroll). This one biases the lock action toward
  // the Hunted ship and adds :lock: to the action bar.
  targetingComputerHunted: {
    skillName: 'Targeting Computer',
    description: 'Adds :lock: to your action bar. When locking, always lock the Hunted ship if it is in your firing arc or if no enemy ships are in your firing arc. Select Action step: replace :focus: with :lock:.',
  },
  electronicBaffle: {
    skillName: 'Electronic Baffle',
    description: 'During the End Phase, if you have exactly 1 stress token and the Hunted ship is outside your firing arc, remove 1 stress token.',
  },
  grandMoffTarkin: {
    skillName: 'Grand Moff Tarkin',
    description: 'During the system phase, if you have a lock on an enemy ship, roll 1 attack die. On a :hit: or :crit: result, each friendly ship without a lock acquires a lock on that ship.',
  },

  // ── TIE/rb Heavy (p-15) ───────────────────────────────────────────
  // Card prints "Use [icon] AI Card" — meta-marker telling the AI engine
  // to swap to an attack/maneuver-specialised AI behaviour table.
  targetAssistMgk300: {
    skillName: 'Target-Assist MGK-300',
    description: 'Use Target-Assist AI card. Before you engage, if you are not stressed and have no green tokens, gain 1 calculate token for each enemy in :turret: at range 2-3, to a maximum of 2.',
  },
  maneuverAssistMgk300: {
    skillName: 'Maneuver-Assist MGK-300',
    description: 'Use Maneuver-Assist AI card.',
  },
  valenRudor: {
    skillName: 'Valen Rudor',
    description: 'After a friendly ship at range 0-1 defends (after damage is resolved, if any), you may perform an action.',
  },
  syncedLaserCannons: {
    skillName: 'Synced Laser Cannons',
    description: 'If you are calculating, the defender does not apply the range 3 bonus. Prioritise attacks at range 3 if you are calculating.',
    attack: 3,
  },
  // p-15 #2 — simplest Vult Skerris ("may perform 1 action", no
  // "even while stressed" qualifier).
  vultSkerrisOptional: {
    skillName: 'Vult Skerris',
    description: 'Before you engage, you may perform 1 action.',
  },
  // Defensive variant — gates on "you are not shielded".
  colonelJendonNoShield: {
    skillName: 'Colonel Jendon',
    description: 'While you defend, if you are not shielded, change 1 of your blank results to a :focus: result.',
  },
  autoblasters: {
    skillName: 'Autoblasters',
    description: "If the defender is in your :bullseye:, roll 1 additional die. If you are not in the defender's :bullseye:, :evade: results do not cancel :hit: results. Prioritise :boost: actions that get a shot with this weapon.",
    attack: 2,
  },
  // p-15 #4 variant — lock-shot priority instead of bullseye.
  computerAssistedHandlingLock: {
    skillName: 'Computer Assisted Handling',
    description: 'After you fully execute a maneuver, perform a :barrelroll: or :boost: action if it would (in order): get a :lock: shot on target, get a :lock: shot.',
  },
  rampage: {
    skillName: 'Rampage',
    description: 'After you execute a speed 3-4 maneuver, choose the closest enemy in :turret: at range 0-1. If you do, that ship gains 1 strain token (2 if you are damaged).',
  },

  // ── TIE/ca Punisher (p-16) ────────────────────────────────────────
  // The Punisher carries weapons with higher charge totals than the
  // Bomber's analogs. Separate entries because the charge capacity is
  // part of the upgrade identity (different total ammo per attack chain).
  // Punisher uses :lock: (canonical X-Wing requirement for Concussion
  // Missiles); Bomber doesn't have a lock action so the Bomber variant
  // substitutes :focus:.
  concussionMissilesPunisher: {
    skillName: 'Concussion Missiles',
    description: 'Attack (:lock:): Spend 1 :charge:. After this attack hits, each ship at range 0-1 of the defender exposes 1 of its damage cards.',
    charge: 4,
    attack: 3,
  },
  electroChaffMissilesPunisher: {
    skillName: 'Electro-Chaff Missiles',
    description: 'In the system phase, follow Class A device logic. If a device may be launched, spend 1 :charge: and launch 1 Electro-Chaff Cloud using the 3 :turn-right:, 4 :straight:, or 3 :turn-left: template.',
    charge: 2,
  },
  // Punisher variant — charge 2 (vs Bomber's 1).
  advancedProtonTorpedoesPunisher: {
    skillName: 'Advanced Proton Torpedoes',
    description: 'Attack (:lock:): Spend 1 :charge:. Change 1 :focus: result to a :crit: result.',
    charge: 2,
    attack: 5,
  },
  // Punisher variant — charge 6 (vs Bomber's 5) and explicit :red-lock:
  // swap step for Action Selection.
  barrageRocketsPunisher: {
    skillName: 'Barrage Rockets',
    description: 'Attack (:focus:): Spend 1 :charge:. If the defender is in your :bullseye:, you may spend 1 or more :charge: to reroll that many attack dice. In Action Selection: replace :lock: with :focus: and :red-lock: with :red-focus:.',
    charge: 6,
    attack: 3,
  },
  // Punisher variant — charge 3 (vs Bomber's 2).
  seismicChargesPunisher: {
    skillName: 'Seismic Charges',
    description: 'In the system phase, follow Class B device logic. If a device may be dropped, spend 1 :charge: and drop 1 device. If mission has obstacles tied to objectives, or fewer than 6 obstacles.',
    charge: 3,
  },
  // Punisher variant — charge 3 (vs Defender Elite's 2).
  magPulseWarheadsPunisher: {
    skillName: 'Mag-Pulse Warheads',
    description: 'Attack (:lock:): Spend 1 :charge:. If this attack hits, the defender suffers 1 :hit: damage and gains 1 deplete and 1 jam token. Then cancel all :hit: / :crit: results.',
    charge: 3,
    attack: 3,
  },
  // Bomb-template + inactive-charge reroll: Concussion Bombs use the
  // 1 :straight: or 2 :straight: template, and unused charges force a
  // re-roll on subsequent device rolls.
  concussionBombs: {
    skillName: 'Concussion Bombs',
    description: 'In the system phase, follow Class B device logic. Use the 1 :straight: or 2 :straight: template. If a device may be dropped, spend 1 :charge: and drop 1 Concussion Bomb. If you have any inactive charges, you MUST reroll until you drop / launch.',
    charge: 4,
  },
  // Punisher variant — charge 3 (vs Bomber's 2).
  protonTorpedoesPunisher: {
    skillName: 'Proton Torpedoes',
    description: 'Attack (:lock:): Spend 1 :charge:. Change 1 :hit: result to a :crit: result.',
    charge: 3,
    attack: 4,
  },
  // Punisher variant — charge 5 (vs Bomber's 4).
  thermalDetonatorsPunisher: {
    skillName: 'Thermal Detonators',
    description: 'In the system phase, follow Class B device logic. If a device may be dropped, spend 1 :charge: and drop 1 Thermal Detonator. Repeat the process a second time (must use a different template).',
    charge: 5,
  },
  captainHark: {
    skillName: 'Captain Hark',
    description: 'After you fully execute a red maneuver, if you are not focused, gain 1 focus token.',
  },
  trajectorySimulator: {
    skillName: 'Trajectory Simulator',
    description: 'When following Class B device logic, you may drop or launch bombs.',
  },
  ablativePlating: {
    skillName: 'Ablative Plating',
    description: 'You do not suffer damage from obstacles or from friendly bombs detonating.',
  },
  // p-16 #4 — third Zertik Strom variant with target-prioritisation hint.
  zertikStromPriority: {
    skillName: 'Zertik Strom',
    description: "During the End Phase, spend a lock on an enemy ship to expose 1 of that ship's damage cards. If you have 2 locks that could trigger this ability, choose the ship with the lowest health.",
  },

  // ── TIE/ag Aggressor (p-17) ──────────────────────────────────────
  // Aggressor variant — charge 3 (vs Bomber's 2); minor wording change
  // ("before attack dice are rolled").
  homingMissilesAggressor: {
    skillName: 'Homing Missiles',
    description: 'Attack (:lock:): Spend 1 :charge:. The defender may choose to suffer 1 :hit: before attack dice are rolled. If it does, no dice are rolled and the attack is treated as hitting.',
    charge: 3,
    attack: 4,
  },
  // Turret-mounted variant of Ion Cannon — attack 3, range 1-2.
  ionCannonTurret: {
    skillName: 'Ion Cannon Turret',
    description: 'If this attack hits, spend 1 :hit: or :crit: result to cause the defender to suffer 1 :hit: damage. All remaining :hit: / :crit: results inflict ion tokens instead of damage.',
    attack: 3,
  },
  // Aggressor variant — charge 5 (vs Bomber's 4).
  multiMissilePodsAggressor: {
    skillName: 'Multi-Missile Pods',
    description: 'Attack (:focus: or :lock:): Spend 1 :charge:. If the defender is in your :front-arc:, spend 1 :charge: to roll 1 additional attack die. If the defender is in your :bullseye:, spend 2 :charge: to roll 2 additional attack dice instead.',
    charge: 5,
    attack: 2,
  },
  // Card prints with quotes.
  doubleEdge: {
    skillName: '"Double Edge"',
    description: 'After you perform a :focus: or :lock: attack that misses, perform a bonus attack using a different weapon.',
  },
  // Aggressor variant — different priority hint.
  trickShotLockAndAttacks: {
    skillName: 'Trick Shot',
    description: 'While you perform an attack that is obstructed by an obstacle, roll 1 additional attack die. Prioritise lock actions and non-lock attacks on obstructed targets.',
  },
  // Basic-slot turret weapon for Aggressor.
  dorsalTurret: {
    skillName: 'Dorsal Turret',
    description: 'Primary turret weapon.',
    attack: 2,
  },

  // ── Alpha Class Starwing (p-18, p-19) ─────────────────────────────
  // Starwing variants all use :focus: OR :lock: attack types (vs Bomber's
  // single attack icon) and reference :stop: (stationary) maneuver
  // positions heavily — that ship has a stop maneuver in its dial.
  concussionMissilesStarwing: {
    skillName: 'Concussion Missiles',
    description: 'Attack (:lock: or :focus:): Spend 1 :charge:. After this attack hits, each ship at range 0-1 of the defender exposes 1 of its damage cards.',
    charge: 3,
    attack: 3,
  },
  os1ArsenalLoadout: {
    skillName: 'Os-1 Arsenal Loadout',
    description: 'When you engage, gain a calculate token. Your equipped :focus: / :lock: upgrades gain the :lock: requirement. While you are disarmed, you may perform :focus: / :lock: attacks.',
  },
  // Starwing variant — bonus primary attack (not "different weapon" as
  // the Aggressor's Double Edge).
  doubleEdgeBonusPrimary: {
    skillName: '"Double Edge"',
    description: 'After you perform a :focus: attack that misses, perform a bonus primary attack.',
  },
  // Starwing variant — :focus: OR :lock: attack icon (Bomber was :lock: only).
  protonTorpedoesStarwing: {
    skillName: 'Proton Torpedoes',
    description: 'Attack (:lock: or :focus:): Spend 1 :charge:. Change 1 :hit: result to a :crit: result.',
    charge: 2,
    attack: 4,
  },
  // Range becomes 1-3 (vs the APT's 0-2 or Cluster/MMP's 0-3).
  majorRhymerProtonTorpedo: {
    skillName: 'Major Rhymer',
    description: 'The attack range of your Proton Torpedoes becomes 1-3.',
  },
  diamondBoronMissiles: {
    skillName: 'Diamond-Boron Missiles',
    description: 'Attack (:lock: or :focus:): Spend 1 :charge:. After this attack hits, spend 1 :charge:. Then, each ship at range 0-1 of the defender with the same or less agility as the defender rolls 1 attack die and suffers 1 :hit: / :crit: damage for each matching result.',
    charge: 3,
    attack: 3,
  },
  // Starwing variant — performs an :evade: action vs gaining the token.
  whisperEvadeAction: {
    skillName: '"Whisper"',
    description: 'After you perform an attack that hits, perform an :evade: action.',
  },
  xg1AssaultConfiguration: {
    skillName: 'Xg-1 Assault Configuration',
    description: 'When you engage, gain a calculate token. While you are disarmed, you may perform :cannon: attacks.',
  },
  // Starwing variant — gates on "disarmed" (Xg-1 effect) vs Phantom's "cloaked".
  majorVynderDisarmed: {
    skillName: 'Major Vynder',
    description: 'While you defend, if you are disarmed, roll 1 additional defense die.',
  },
  // Starwing variant — stop-positioning priority hint.
  heavyLaserCannonStop: {
    skillName: 'Heavy Laser Cannon',
    description: 'After the Modify Attack Dice step, change all :crit: results to :hit: results. Prioritise :stop: positions to get an enemy ship in :bullseye:.',
    attack: 4,
  },
  // Starwing variant — maneuver-trigger version (vs Bomber's engage-trigger).
  targetAssistAlgorithmManeuver: {
    skillName: 'Target-Assist Algorithm',
    description: 'After you fully execute a maneuver (including :stop:), you may perform a :barrelroll: or :boost: action to get a range 2-3 shot in :front-arc:.',
  },
  yricaQuell: {
    skillName: 'Yrica Quell',
    description: 'After you fully execute a maneuver (including :stop:), acquire a lock on an enemy ship in your :front-arc:. Prioritise :stop: positions that get a :lock: shot.',
  },
  // Starwing variant — :stop: priority hint instead of barrelroll/boost.
  outmaneuverStop: {
    skillName: 'Outmaneuver',
    description: "While you perform a :front-arc: attack, if you are not in the defender's firing arc, the defender rolls 1 fewer defence dice. Prioritise :stop: positions and targets that trigger this ability.",
  },
  autoblastersStop: {
    skillName: 'Autoblasters',
    description: "If the defender is in your :bullseye:, roll 1 additional die. If you are not in the defender's :bullseye:, :evade: results do not cancel :hit: results. When performing :stop: actions, prioritise positions that get a range 1-2 shot.",
    attack: 2,
  },
  // Starwing variant — :stop: included in maneuver options.
  vedFosloStarwing: {
    skillName: 'Ved Foslo',
    description: 'When executing a maneuver (:stop: included), increase or decrease its speed by 1 if it would (in order): get an enemy in :front-arc: at range 1-2, get an enemy in your :bullseye: at range 1-2.',
  },
  // Starwing variant — range-shift instead of range-0 attacks.
  captainOicunnRange: {
    skillName: 'Captain Oicunn',
    description: 'While you perform an attack at attack range 0, treat it as an attack at attack range 1.',
  },

  // ── TIE Advanced v1 (p-20) ────────────────────────────────────────
  // Force-using elite ship (like the Sith Infiltrator). Most pilots add
  // force capacity via the "[Adds N force]" annotation.
  protonRockets: {
    skillName: 'Proton Rockets',
    description: 'Attack (:focus:): Spend 1 :charge:. Prioritise :boost: and :barrelroll: in your Select Action step to get an enemy in :bullseye: at range 1-3.',
    charge: 1,
    attack: 5,
  },
  majorRhymerProtonRockets: {
    skillName: 'Major Rhymer',
    description: 'The attack range of your Proton Rockets becomes 0-3.',
  },
  // p-20 #1 — full version with conditional barrelroll check.
  extremeManeuvers: {
    skillName: 'Extreme Maneuvers',
    description: 'In the Select Action step, if a standard :barrelroll: would not trigger the following conditions, use the turn :turn-left: or :turn-right: templates if they would (in order): get an enemy in :bullseye:, get a shot. If you do, spend 1 :force:.',
    addsForce: 1,
  },
  // p-20 #3 — simpler "would not get a shot" version.
  extremeManeuversSimple: {
    skillName: 'Extreme Maneuvers',
    description: 'In the Select Action step, if a standard :barrelroll: would not get a shot, use the turn :turn-left: or :turn-right: templates if it would get a shot. If you do, spend 1 :force:.',
    addsForce: 1,
  },
  // Proton-Rockets-specific Extra Munitions (modifier).
  extraMunitionsProtonRockets: {
    skillName: 'Extra Munitions',
    description: 'Your Proton Rockets gain 1 :charge:.',
  },
  predictiveShot: {
    skillName: 'Predictive Shot',
    description: 'After you declare an attack, if the defender is in your :bullseye:, spend 1 :force:. If you do, the defender cannot roll more defense dice than the number of your :focus: / :hit: results.',
    addsForce: 1,
  },
  grandInquisitorOffense: {
    skillName: 'Grand Inquisitor (Offense)',
    description: 'While you perform an attack against a defender at attack range 2-3, spend 1 :force: to apply the range 1 bonus.',
    addsForce: 1,
  },
  grandInquisitorDefense: {
    skillName: 'Grand Inquisitor (Defense)',
    description: 'While you defend at attack range 1, spend 1 :force: to prevent the range 1 bonus.',
    addsForce: 1,
  },
  // Two-step action chains: instead of a single boost-or-barrelroll into
  // a red focus, you may chain both actions before the red focus.
  supernaturalReflexes: {
    skillName: 'Supernatural Reflexes',
    description: 'In the Select Action step, ":boost: or :barrelroll: :linked: :red-focus:" becomes ":boost: :linked: :barrelroll: :linked: :red-focus:" or ":barrelroll: :linked: :boost: :linked: :red-focus:".',
    addsForce: 1,
  },
  // p-20 #4 — adds barrelroll/boost obstacle-check, broader trigger.
  collisionDetectorBarrel: {
    skillName: 'Collision Detector',
    description: "Roll 1 attack die if your maneuver, :barrelroll:, or :boost: would move through or overlap an obstacle. On a :hit: or :focus: result, ignore the obstacle's effects this round. Otherwise, swerve / choose actions as normal.",
  },
  // p-20 #3 — force-spend focus→hit; different from the Sith p-11 #4
  // engagement-phase version of Darth Vader.
  darthVaderForce: {
    skillName: 'Darth Vader',
    description: 'While you perform an attack, spend 1 :force: to change 1 :focus: result to a :hit: result.',
    addsForce: 1,
  },

  // ── Major Rhymer variants (range-modifier on different weapons) ──
  // Existing `majorRhymer` ability was Cluster-Missiles-specific. Renamed
  // to `majorRhymerCluster` for clarity; added per-weapon variants.
  majorRhymerCluster: {
    skillName: 'Major Rhymer',
    description: 'The attack range of your Cluster Missiles becomes 0-3.',
  },
  majorRhymerApt: {
    skillName: 'Major Rhymer',
    description: 'The attack range of your Advanced Proton Torpedoes becomes 0-2.',
  },
  majorRhymerMmp: {
    skillName: 'Major Rhymer',
    description: 'The attack range of your Multi-Missile Pods becomes 0-3.',
  },

  // ── Colonel Jendon variants ───────────────────────────────────────
  // Existing `colonelJendon` was the "blank → focus" attack modifier.
  // Renamed to `colonelJendonAttack`; added the bomber lock-coordination variant.
  colonelJendonAttack: {
    skillName: 'Colonel Jendon',
    description: 'While you perform an attack, change 1 of your blank results to a :focus: result.',
  },
  colonelJendonLock: {
    skillName: 'Colonel Jendon',
    description: 'At the end of the activation phase, if you have no enemies at range 0-3, friendly ships with the :lock: action and no enemies at range 0-3 perform a :lock: action, ignoring range restrictions.',
  },

  // ── Pilot abilities (TIE Adv x1 deck) ─────────────────────────────
  // Card prints "Flight leader Ubbel" (lowercase 'l' in 'leader'); preserved as-is.
  flightLeaderUbbel: {
    skillName: 'Flight leader Ubbel',
    description: 'After a friendly ship at range 0-2 defends, if it was dealt a damage card, perform a bonus attack against the attacker.',
  },
  junoEclipse: {
    skillName: 'Juno Eclipse',
    description: "After you perform an action, perform a :boost: action if it would (in order): trigger Outmaneuver, avoid target's arc and still get a shot, get a shot, get a range 1 shot on Target.",
  },
  vedFoslo: {
    skillName: 'Ved Foslo',
    description: 'When executing a maneuver, increase or decrease its speed by 1 if it would (in order): trigger Outmaneuver, get a shot, avoid a ship overlap.',
  },
  // Description per card: "blank or focus → hit" when defender has no green tokens.
  majorVermeil: {
    skillName: 'Major Vermeil',
    description: 'While you perform an attack, if the defender does not have any green tokens, change 1 of your blank or :focus: results to a :hit: result.',
  },
});
