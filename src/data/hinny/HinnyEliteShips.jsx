import {Ships} from "../Ships";
import React from "react";
import {HinnySkills} from "./HinnyEliteSkills";

export default function HinnyEliteShips(props) {
    switch (props.shipType) {
        case Ships.TIEIN.id:
            return <TIEIN/>;
        case Ships.TIELN.id:
            return <TIELN/>;
        case Ships.TIESA.id:
            return <TIESA/>;
        case Ships.VT49.id:
            return <VT49/>;
        default:
            console.log("Component attack didn't recognize shipType: " + props.shipType);
    }
}

const TIELN = () => [];
/* Each skill is specified by its contents, initiative, XP and optionally charges (number of charges, recharge / round) */
const TIEIN = [
    [
        [HinnySkills.HullUpgrade, 2, 6],
        [HinnySkills.Outmaneuver, 3, 12],
        [HinnySkills.ShieldUpgrade, 4, 14],
        [HinnySkills.TurrPhennir, 5, 16],
        [HinnySkills.Marksmanship, 6, 18],
        [HinnySkills.GideonHask, 7, 20]
    ],
    [
        [HinnySkills.CrackShot, 1, 5, {CHARGE: 1, RECHARGE: 0}],
        [HinnySkills.HullUpgrade, 2, 10],
        [HinnySkills.Daredevil, 3, 12],
        [HinnySkills.TrickShot, 4, 14],
        [HinnySkills.StaticDischargeVanes, 5, 16],
        [HinnySkills.Mauler, 6, 18]
    ],
    [
        [HinnySkills.HullUpgrade, 1, 5],
        [HinnySkills.Wampa, 2, 10, {CHARGE: 1, RECHARGE: 1}],
        [HinnySkills.Ruthless, 3, 12],
        [HinnySkills.NightBeast, 4, 14],
        [HinnySkills.ShieldUpgrade, 5, 16],
        [HinnySkills.Juke, 6, 18]
    ],
    [
        [HinnySkills.CrackShot, 2, 6, {CHARGE: 1, RECHARGE: 0}],
        [HinnySkills.ShieldUpgrade, 3, 12],
        [HinnySkills.Predator, 4, 14],
        [HinnySkills.Afterburners, 5, 16],
        [HinnySkills.Juke, 6, 18],
        [HinnySkills.SoontirFel, 7, 20]
    ],
    [
        [HinnySkills.StealthDevice, 2, 6, {CHARGE: 1}],
        [HinnySkills.Ruthless, 3, 12],
        [HinnySkills.ValenRudor, 4, 14],
        [HinnySkills.HullUpgrade, 5, 16],
        [HinnySkills.Outmaneuver, 6, 18],
        [HinnySkills.ScourgeSkutu, 5, 20]
    ],
    [
        [HinnySkills.StealthDevice, 1, 5, {CHARGE: 1}],
        [HinnySkills.Afterburners, 2, 10],
        [HinnySkills.LoneWolf, 3, 12],
        [HinnySkills.Elusive, 4, 14, {CHARGE: 2, RECHARGE: 1}],
        [HinnySkills.Marksmanship, 5, 16],
        [HinnySkills.SeynMarana, 6, 18]
    ]
];


const TIESA = [
        [
            [HinnySkills.ProtonBombs, 2, 6, {CHARGE: 2, RECHARGE: 0}],
            [HinnySkills.ClusterMissiles, 3, 12, {ATTACK: 3, RANGE: missileRanges.R12, CHARGE: 4}],
            [HinnySkills.SaturationSalvo, 4, 14],
            [HinnySkills.DebrisGambit, 6, 15],
            [HinnySkills.ProtonTorpedoes, 6, 18, {ATTACK: 4, RANGE: missileRanges.R23, CHARGE: 2}],
            [HinnySkills.MunitionFailsafe, 7, 20]
        ],
        [
            [HinnySkills.PlasmaTorpedoes, 2, 6, {ATTACK: 4, RANGE: missileRanges.R23, CHARGE: 2}],
            [HinnySkills.ConnerNets, 3, 12, {CHARGE: 1}],
            [HinnySkills.CaptainJonus, 4, 14],
            [HinnySkills.ShieldUpgrade, 5, 16],
            [HinnySkills.DiamondBoronMissiles, 6, 18, {ATTACK: 3, RANGE: missileRanges.R23, CHARGE: 3}],
            [HinnySkills.SwarmTactics]
        ],
        [
            [HinnySkills.ProtonBombs, 2, 6, {CHARGE: 2}],
            [HinnySkills.ProtonTorpedoes, 2, 10, {ATTACK: 4, RANGE: missileRanges.R23, CHARGE: 2}],
            [HinnySkills.DeathFire, 2, 10],
            [HinnySkills.SkilledBombardier, 4, 14],
            [HinnySkills.ElectroProtonBomb, 4, 15, {CHARGE: 1}],
            [HinnySkills.Ruthless, 6, 17]
        ],
        [
            [HinnySkills.IonTorpedoes, 2, 6, {ATTACK: 4, RANGE: missileRanges.R23, CHARGE: 2}],
            [HinnySkills.ProximityMines, 3, 12, {CHARGE: 2}],
            [HinnySkills.SkilledBombardier, 3, 13],
            [HinnySkills.ConnerNets, 4, 16, {CHARGE: 1}],
            [HinnySkills.ConcussionMissiles, 5, 17, {ATTACK: 3, RANGE: missileRanges.R23, CHARGE: 3}],
            [HinnySkills.Elusive, 6, 19]
        ],
        [
            [HinnySkills.ClusterMissiles, 2, 6, {ATTACK: 3, RANGE: missileRanges.R12, CHARGE: 4}],
            [HinnySkills.MajorRhymer, 3, 12],
            [HinnySkills.AdvancedProtonTorpedoes, 3, 13, {ATTACK: 4, RANGE: missileRanges.R1, CHARGE: 1}],
            [HinnySkills.BombletGenerator, 4, 15, {CHARGE: 3, RECHARGE: 1}],
            [HinnySkills.Marksmanship, 5, 17],
            [HinnySkills.ShieldUpgrade, 6, 19]
        ],
        [
            [HinnySkills.BarrageMissiles, 2, 6, {ATTACK: 3, RANGE: missileRanges.R23, CHARGE: 5}],
            [HinnySkills.MunitionFailsafe, 2, 10],
            [HinnySkills.SwarmTactics, 3, 12],
            [HinnySkills.AdvancedProtonTorpedoes, 4, 13, {ATTACK: 4, RANGE: missileRanges.R1, CHARGE: 1}],
            [HinnySkills.ProximityMines, 4, 15, {CHARGE: 2}],
            [HinnySkills.TrickShot, 5, 17]
        ]
    ];

const VT49 = [
    []
]
);

const skillVars = Object.freeze(
    {
        CHARGE: "charge",
        RECHARGE: "recharge rate",
        ATTACK: "attack",
        RANGE: "attack range"

    }
);

const missileRanges = Object.freeze(
    {
        R1: "1",
        R12: "1-2",
        R23: "2-3"
    });