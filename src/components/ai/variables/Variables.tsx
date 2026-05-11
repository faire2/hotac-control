import { useContext } from 'react';
import Select from 'react-select';
import { Ships } from '../../../data/Ships';
import { ShipHandlingContext } from '../../../context/Contexts';
import type { ShipInstance } from '../../../context/Contexts';
import { countExtraHullAndShield } from '../../../data/shared/coreUpgrades';

interface Props {
  ship: ShipInstance;
  squadId: number;
  keyIndex: number;
}

const ID_OPTIONS = Array.from({ length: 10 }, (_, i) => ({ value: i, label: String(i) }));

type Variable = 'tokenId' | 'shields' | 'hull' | 'energy';

export default function Variables({ ship, squadId, keyIndex }: Props) {
  const ctx = useContext(ShipHandlingContext);
  if (!ctx) return null;
  const squadron = ctx.squadrons[squadId];
  const shipType = squadron.shipType;
  const baseStats = Ships[shipType];
  const hasEnergy = baseStats.hasEnergy === true;
  const extras = countExtraHullAndShield(
    (squadron.upgrades).map((r) => r.upgrade),
  );
  const maxShields = baseStats.shields + extras.extraShield;
  const maxHull = baseStats.hull + extras.extraHull;

  function update(variable: Variable, value: number) {
    if (!ctx) return;
    const next: ShipInstance = { ...ship };
    if (variable === 'shields' && value >= 0 && value <= maxShields) next.shields = value;
    else if (variable === 'hull' && value >= 0 && value <= maxHull) next.hull = value;
    else if (variable === 'energy' && value >= 0) next.energy = value;
    else if (variable === 'tokenId') next.tokenId = value;
    else return;
    ctx.handleShipChange(next, keyIndex, squadId);
  }

  return (
    <div className="d-flex flex-nowrap align-items-center shipRow">
      <div className="shipCellId">
        <Select
          options={ID_OPTIONS}
          onChange={(e: { value: number } | null) => {
            if (e) update('tokenId', e.value);
          }}
          value={{ label: String(ship.tokenId), value: ship.tokenId }}
        />
      </div>
      <Counter label="shields" value={ship.shields} onChange={(v) => { update('shields', v); }} />
      <Counter label="hull" value={ship.hull} onChange={(v) => { update('hull', v); }} />
      {hasEnergy && (
        <Counter
          label="energy"
          value={ship.energy ?? 0}
          onChange={(v) => { update('energy', v); }}
        />
      )}
      <div className="shipCellRemove">
        <button
          type="button"
          className="btn btn-danger btn-sm btn-remove-ship"
          aria-label="Remove ship"
          onClick={() => { ctx.handleShipRemoval(keyIndex, squadId); }}
        >
          ×
        </button>
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
    <div className="shipCellCounter d-flex flex-nowrap align-items-center justify-content-center">
      <button
        type="button"
        className="btn btn-primary btn-counter"
        aria-label={`Decrease ${label}`}
        onClick={() => { onChange(value - 1); }}
      >
        −
      </button>
      <span className="counterValue">{value}</span>
      <button
        type="button"
        className="btn btn-primary btn-counter"
        aria-label={`Increase ${label}`}
        onClick={() => { onChange(value + 1); }}
      >
        +
      </button>
    </div>
  );
}
