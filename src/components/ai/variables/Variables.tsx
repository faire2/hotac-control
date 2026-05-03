import { useContext } from 'react';
import Select from 'react-select';
import { Ships } from '../../../data/Ships';
import { ShipHandlingContext } from '../../../context/Contexts';
import type { ShipInstance } from '../../../context/Contexts';
import { countExtraHullAndShield } from '../../../data/shared/coreUpgrades';
import type { UpgradeRow } from '../../../data/UpgradeRow';

interface Props {
  ship: ShipInstance;
  squadId: number;
  keyIndex: number;
}

const ID_OPTIONS = Array.from({ length: 10 }, (_, i) => ({ value: i, label: String(i) }));

type Variable = 'tokenId' | 'shields' | 'hull';

export default function Variables({ ship, squadId, keyIndex }: Props) {
  const ctx = useContext(ShipHandlingContext);
  if (!ctx) return null;
  const squadron = ctx.squadrons[squadId];
  if (!squadron) return null;
  const shipType = squadron.shipType;
  const baseStats = Ships[shipType];
  const extras = countExtraHullAndShield(
    (squadron.upgrades as readonly UpgradeRow[]).map((r) => r.upgrade),
  );
  const maxShields = baseStats.shields + extras.extraShield;
  const maxHull = baseStats.hull + extras.extraHull;

  function update(variable: Variable, value: number) {
    if (!ctx) return;
    const next: ShipInstance = { ...ship };
    if (variable === 'shields' && value >= 0 && value <= maxShields) next.shields = value;
    else if (variable === 'hull' && value >= 0 && value <= maxHull) next.hull = value;
    else if (variable === 'tokenId') next.tokenId = value;
    else return;
    ctx.handleShipChange(next, keyIndex, squadId);
  }

  return (
    <div>
      <div className="row">
        <div className="col-3">
          <Select
            options={ID_OPTIONS}
            onChange={(e: { value: number } | null) => e && update('tokenId', e.value)}
            value={{ label: String(ship.tokenId), value: ship.tokenId }}
          />
        </div>
        <Counter label="shields" value={ship.shields} onChange={(v) => update('shields', v)} />
        <Counter label="hull" value={ship.hull} onChange={(v) => update('hull', v)} />
        <div className="col-1">
          <button
            id="btn-remove_ship"
            type="button"
            className="btn btn-danger"
            onClick={() => ctx.handleShipRemoval(keyIndex, squadId)}
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="col-4">
      <button
        type="button"
        className="btn btn-primary btn-increment"
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(value - 1)}
      >
        -
      </button>
      <span className="value"> {value} </span>
      <button
        type="button"
        className="btn btn-primary btn-increment"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
