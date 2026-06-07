/**
 * Read-only Ships overview gallery — every AI-piloted ship the selected
 * engine covers, displayed with the same header chrome (stats + ship
 * hologram glyph) used on the live squad card.
 *
 * For each ship:
 *   - `SquadStats` header — reused so the gallery shares the squad card's
 *     init/attack/agility row layout and the watermark ship glyph behind
 *     the values. We pass no `rollMeta` / `initiativeOverride`, so init
 *     falls back to the ship's printed default.
 *   - the full maneuver matrix: rows are *position kinds* (bull/front/
 *     front side/rear side/rear), with the four range bands (R4, R2-3,
 *     R1-2, stressed) laid out as sub-rows inside each kind so all four
 *     bull-eye rows sit together, then all four front rows, etc.
 *     Columns = 1..6 (the d6 roll). Borders dropped; sub-rows striped
 *     subtly instead.
 *   - every upgrade *set* the ship could roll under the selected
 *     `UpgradeSource`, displayed one set per variant. Each row inside a
 *     variant carries the initiative threshold so the player can see
 *     "unlocked at init/rank N".
 *
 * Master switches at the top of the modal pick the engine and the upgrade
 * source. The modal stores its own local copy of both so the gallery's
 * settings don't leak into the in-flight scenario's spawn settings.
 */

import { useMemo, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { AI, Ships, UPGRADES } from '../../data/Ships';
import type { AiEngine, Ship, ShipId, UpgradeSource } from '../../data/Ships';
import { PSN } from '../../data/Maneuvers';
import type { ManeuverTuple, Position } from '../../data/Maneuvers';
import { fgaManeuvers } from '../../data/fga/Maneuvers';
import { andersonManeuvers } from '../../data/anderson/Maneuvers';
import { FgaUpgrades } from '../../data/fga/FgaUpgrades';
import { CommunityUpgradeTree } from '../../data/fga/CommunityUpgradeTree';
import { AndersonUpgrades } from '../../data/anderson/AndersonUpgrades';
import type { Upgrade } from '../../data/shared/coreUpgrades';
import { EngineToggle } from '../shared/EngineToggle';
import { UpgradeSourceToggle } from '../shared/UpgradeSourceToggle';
import { renderManeuverGlyph } from '../shared/maneuverGlyph';
import { SquadStats } from '../ai/SquadStats';
import { Rule } from '../Rule';
import './AiShipsGalleryModal.css';

interface Props {
  show: boolean;
  onHide: () => void;
  /** Initial engine selection — usually mirrors the in-flight scenario. */
  initialEngine: AiEngine;
  /** Initial upgrade source. */
  initialUpgradeSource: UpgradeSource;
}

/** A position-kind groups the four range bands the same way the printed
 * dial does. Display order matches the dial silkscreen: bull → front →
 * front side → rear side → rear. */
interface PositionKind {
  label: string;
  bands: readonly { band: string; position: Position }[];
}

const POSITION_KINDS: readonly PositionKind[] = [
  {
    label: 'Bulls eye',
    bands: [
      { band: 'R4', position: PSN.R4BULL },
      { band: 'R2-3', position: PSN.R3BULL },
      { band: 'R1-2', position: PSN.R1BULL },
      { band: 'Stressed', position: PSN.STRSBULL },
    ],
  },
  {
    label: 'Front',
    bands: [
      { band: 'R4', position: PSN.R4FRONT },
      { band: 'R2-3', position: PSN.R3FRONT },
      { band: 'R1-2', position: PSN.R1FRONT },
      { band: 'Stressed', position: PSN.STRSFRONT },
    ],
  },
  {
    label: 'Front side',
    bands: [
      { band: 'R4', position: PSN.R4FRONTSIDE },
      { band: 'R2-3', position: PSN.R3FRONTSIDE },
      { band: 'R1-2', position: PSN.R1FRONTSIDE },
      { band: 'Stressed', position: PSN.STRSFRONTSIDE },
    ],
  },
  {
    label: 'Rear side',
    bands: [
      { band: 'R4', position: PSN.R4REARSIDE },
      { band: 'R2-3', position: PSN.R3REARSIDE },
      { band: 'R1-2', position: PSN.R1REARSIDE },
      { band: 'Stressed', position: PSN.STRSREARSIDE },
    ],
  },
  {
    label: 'Rear',
    bands: [
      { band: 'R4', position: PSN.R4REAR },
      { band: 'R2-3', position: PSN.R3REAR },
      { band: 'R1-2', position: PSN.R1REAR },
      { band: 'Stressed', position: PSN.STRSREAR },
    ],
  },
];

/** A single labelled set of upgrades — one printed pilot card. */
interface UpgradeSet {
  groups: readonly UpgradeGroup[];
}

interface UpgradeGroup {
  /** Optional sub-heading, e.g. "Basic" / "Elite". */
  label?: string;
  upgrades: readonly UpgradeEntry[];
}

interface UpgradeEntry {
  upgrade: Upgrade;
  /** Initiative threshold at which this row unlocks. Same dial as avg
   * rebel rank (1-7). Undefined when the row carries no threshold. */
  initiative?: number;
}

/** Ship cards filtered to those the selected engine covers. */
function shipsForEngine(engine: AiEngine): readonly Ship[] {
  return Object.values(Ships).filter((s) => s.ai.includes(engine));
}

/** Variants of the selected `source` for `shipId`, each as an
 * `UpgradeSet` (a printed pilot card). */
function upgradeSetsFor(shipId: ShipId, source: UpgradeSource): readonly UpgradeSet[] {
  switch (source) {
    case UPGRADES.FGA: {
      const variants = FgaUpgrades[shipId] ?? [];
      return variants.map((rows) => ({
        groups: [{ upgrades: rows.map((r) => ({ upgrade: r.upgrade, initiative: r.initiative })) }],
      }));
    }
    case UPGRADES.COMMUNITY: {
      const variants = CommunityUpgradeTree[shipId] ?? [];
      return variants.map((rows) => ({
        groups: [{ upgrades: rows.map((r) => ({ upgrade: r.upgrade, initiative: r.initiative })) }],
      }));
    }
    case UPGRADES.ANDERSON: {
      const variants = AndersonUpgrades[shipId] ?? [];
      return variants.map((v) => ({
        groups: [
          {
            label: 'Basic',
            upgrades: v.basic.map((r) => ({ upgrade: r.upgrade, initiative: r.initiative })),
          },
          {
            label: 'Elite',
            upgrades: v.elite.map((r) => ({ upgrade: r.upgrade, initiative: r.initiative })),
          },
        ],
      }));
    }
  }
}

export function AiShipsGalleryModal({
  show,
  onHide,
  initialEngine,
  initialUpgradeSource,
}: Props) {
  const [engine, setEngine] = useState<AiEngine>(initialEngine);
  const [upgradeSource, setUpgradeSource] = useState<UpgradeSource>(initialUpgradeSource);

  const ships = useMemo(() => shipsForEngine(engine), [engine]);

  return (
    <Modal show={show} onHide={onHide} centered scrollable size="xl" dialogClassName="shipsOverviewDialog">
      <Modal.Header closeButton className="shipsOverviewHeader">
        <div className="w-100">
          <Modal.Title>Ships overview</Modal.Title>
          <div className="shipsOverviewControls">
            <div className="d-flex align-items-center">
              <span className="control-label">Engine:</span>
              <EngineToggle
                name="ships-overview-engine"
                value={engine}
                onChange={setEngine}
                variant="outline-light"
              />
            </div>
            <div className="d-flex align-items-center">
              <span className="control-label">Upgrades:</span>
              <UpgradeSourceToggle
                name="ships-overview-upgrades"
                value={upgradeSource}
                onChange={setUpgradeSource}
                variant="outline-light"
              />
            </div>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="shipsOverviewBody">
        {ships.length === 0 ? (
          <p className="text-muted">No ships covered by this engine yet.</p>
        ) : (
          ships.map((s) => (
            <ShipSection key={s.id} ship={s} engine={engine} upgradeSource={upgradeSource} />
          ))
        )}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onHide}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
}

function ShipSection({
  ship,
  engine,
  upgradeSource,
}: {
  ship: Ship;
  engine: AiEngine;
  upgradeSource: UpgradeSource;
}) {
  const table = engine === AI.FGA ? fgaManeuvers[ship.id] : andersonManeuvers[ship.id];
  const sets = upgradeSetsFor(ship.id, upgradeSource);

  // Pre-filter position kinds: skip a kind entirely if the ship's table
  // defines none of its bands (e.g. FGA TIE/sa Bomber: only bulls-eye).
  const kindsToRender = table
    ? POSITION_KINDS.map((kind) => ({
        kind,
        bands: kind.bands.filter((b) => table[b.position as keyof typeof table] !== undefined),
      })).filter((k) => k.bands.length > 0)
    : [];

  return (
    <section className="shipsOverviewSection squad-mfd">
      <header className="shipsOverviewSectionHead">
        <h4 className="shipsOverviewTitle">
          {ship.name} <span className="shipsOverviewTitleId">{ship.id}</span>
        </h4>
        <SquadStats shipType={ship.id} />
      </header>

      {!table || kindsToRender.length === 0 ? (
        <p className="shipsOverviewNoTable">
          No maneuver table for {engine} yet (TODO).
        </p>
      ) : (
        <div className="shipsOverviewMatrixWrap">
          <table className="shipsOverviewMatrix">
            <thead>
              <tr>
                <th className="shipsOverviewMatrixKind">Position</th>
                <th className="shipsOverviewMatrixBand">Range</th>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <th key={n}>{n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kindsToRender.map(({ kind, bands }) =>
                bands.map((bandRow, idx) => {
                  const tuple = table[bandRow.position as keyof typeof table] as ManeuverTuple | undefined;
                  if (!tuple) return null;
                  return (
                    <tr
                      key={bandRow.position}
                      className={idx === 0 ? 'shipsOverviewKindStart' : undefined}
                    >
                      {idx === 0 ? (
                        <th scope="row" rowSpan={bands.length} className="shipsOverviewMatrixKind">
                          {kind.label}
                        </th>
                      ) : null}
                      <td className="shipsOverviewMatrixBand">{bandRow.band}</td>
                      {tuple.map((m, i) => (
                        <td key={i}>{renderManeuverGlyph(m)}</td>
                      ))}
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="shipsOverviewUpgrades">
        <h5 className="shipsOverviewSubhead">Possible upgrades — {upgradeSource}</h5>
        {sets.length === 0 ? (
          <p className="shipsOverviewNoUpgrades">No upgrades defined for this source.</p>
        ) : (
          <div className="shipsOverviewUpgradeSets">
            {sets.map((set, i) => (
              <UpgradeSetCard key={i} index={i} set={set} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function UpgradeSetCard({ index, set }: { index: number; set: UpgradeSet }) {
  const totalCount = set.groups.reduce((acc, g) => acc + g.upgrades.length, 0);
  return (
    <div className="shipsOverviewUpgradeSet">
      <div className="shipsOverviewSetHead">
        <span className="shipsOverviewSetIndex">Variant {index + 1}</span>
        <span className="shipsOverviewSetCount">{totalCount} upgrade{totalCount === 1 ? '' : 's'}</span>
      </div>
      {set.groups.map((group, gi) =>
        group.upgrades.length === 0 ? null : (
          <div key={gi} className="shipsOverviewUpgradeGroup">
            {group.label ? <div className="shipsOverviewGroupLabel">{group.label}</div> : null}
            <div className="shipsOverviewUpgradeList">
              {group.upgrades.map((entry, ui) => (
                <UpgradeCard key={`${entry.upgrade.skillName}-${ui}`} entry={entry} />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function UpgradeCard({ entry }: { entry: UpgradeEntry }) {
  const { upgrade, initiative } = entry;
  return (
    <div className="shipsOverviewUpgradeCard">
      <div className="shipsOverviewUpgradeHead">
        <span className="shipsOverviewUpgradeName">{upgrade.skillName}</span>
        {initiative !== undefined ? (
          <span
            className="shipsOverviewUpgradeInit"
            title={`Unlocks at average rebel pilot initiative / rank ≥ ${initiative.toString()}`}
          >
            INI {initiative}
          </span>
        ) : null}
      </div>
      <div className="shipsOverviewUpgradeDesc">
        <Rule text={upgrade.description} />
      </div>
      {(upgrade.attack !== undefined || upgrade.range !== undefined || upgrade.charge !== undefined) ? (
        <div className="shipsOverviewUpgradeMeta">
          {upgrade.attack !== undefined ? <span>Attack {upgrade.attack}</span> : null}
          {upgrade.range !== undefined ? <span>Range {upgrade.range}</span> : null}
          {upgrade.charge !== undefined ? (
            <span>
              {upgrade.charge} charge{upgrade.recharge ? ` (recharge ${String(upgrade.recharge)})` : ''}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
