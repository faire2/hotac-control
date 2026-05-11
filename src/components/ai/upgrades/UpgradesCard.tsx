import { useContext, useState } from 'react';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { GlobalSquadsValuesContext } from '../../../context/Contexts';
import { UPGRADES } from '../../../data/Ships';
import type { Upgrade } from '../../../data/shared/coreUpgrades';
import { Rule } from '../../Rule';

interface Props {
  squadId: number;
}

export default function UpgradesCard({ squadId }: Props) {
  const globalValues = useContext(GlobalSquadsValuesContext);
  if (!globalValues) return null;
  const squad = globalValues.squadrons[squadId];
  const isElite = squad.isElite;
  const upgrades = squad.upgrades;
  const columns = upgrades.length < 2 ? '' : 'columns2';

  // Source toggle is meaningful only for rolled squads. Mission-fixed and
  // ally squads (no rollMeta) get no toggle, so the upgrades stay
  // authoritative. The scenario-level source override also hides it.
  const showSourceToggle =
    squad.rollMeta !== undefined && globalValues.scenarioUpgradesSource === undefined;

  return (
    <div>
      {showSourceToggle && (
        <div className="d-flex justify-content-center">
          <ToggleButtonGroup
            type="radio"
            name="radio"
            value={squad.rollMeta?.source}
            onChange={(e) => { globalValues.handleSetUpgradesSource(squadId, e as never); }}
          >
            <ToggleButton value={UPGRADES.COMMUNITY}>{UPGRADES.COMMUNITY}</ToggleButton>
            <ToggleButton value={UPGRADES.FGA}>{UPGRADES.FGA}</ToggleButton>
            <ToggleButton value={UPGRADES.ANDERSON}>{UPGRADES.ANDERSON}</ToggleButton>
          </ToggleButtonGroup>
        </div>
      )}
      <label>
        <input
          type="checkbox"
          checked={isElite}
          onChange={() => { globalValues.handleSetIsElite(squadId, !isElite); }}
        />{' '}
        Is ship elite?
      </label>
      <div className={columns}>
        {upgrades.map((upgrade, i) => (
          <Skill key={i} upgrade={upgrade} />
        ))}
        <br />
      </div>
    </div>
  );
}

function Skill({ upgrade }: { upgrade: Upgrade }) {
  return (
    <div className="skillContainer">
      <div className="headline text-center">{upgrade.skillName}</div>
      <div className="d-flex flex-column">
        <div className="content">
          <Rule text={upgrade.description} />
        </div>
        <div className="variables d-flex flex-row justify-content-around">
          {upgrade.charge !== undefined && (
            <Charges initial={upgrade.charge} max={upgrade.charge} recharge={upgrade.recharge} />
          )}
          {upgrade.attack !== undefined && (
            <Attack attack={upgrade.attack} range={upgrade.range} bullseye={upgrade.bullseye} />
          )}
        </div>
      </div>
    </div>
  );
}

function Charges({
  initial,
  max,
  recharge,
}: {
  initial: number;
  max: number;
  recharge?: number;
}) {
  const [charges, setCharges] = useState(initial);
  function clamp(value: number) {
    if (value >= 0 && value <= max) setCharges(value);
  }
  return (
    <div className="charge">
      <button
        className="btn btn-outline-warning btn-increment"
        type="button"
        onClick={() => { clamp(charges - 1); }}
      >
        -
      </button>
      <i className="xwi x-charge" />
      {charges}
      {recharge === 1 && <i className="xwi x-recurring" />}
      {recharge === 2 && <i className="xwi x-doublerecurring" />}
      <button
        className="btn btn-outline-warning btn-increment"
        type="button"
        onClick={() => { clamp(charges + 1); }}
      >
        +
      </button>
    </div>
  );
}

function Attack({
  attack,
  range,
  bullseye,
}: {
  attack: number;
  range?: string;
  bullseye?: boolean;
}) {
  return (
    <div className="attack d-flex flex-row">
      <div>
        {bullseye ? <i className="xwi x-bullseyearc" /> : <i className="xwi x-frontarc" />}
        {attack}
      </div>
      {range && (
        <div className="range">
          <i className="xwi x-rangebonusindicator" />
          <span className="blackFontColor"> {range}</span>
        </div>
      )}
    </div>
  );
}
