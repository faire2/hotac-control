import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { UPGRADES } from '../../data/Ships';
import type { UpgradeSource } from '../../data/Ships';

const UPGRADE_OPTIONS: readonly UpgradeSource[] = [
  UPGRADES.COMMUNITY,
  UPGRADES.FGA,
  UPGRADES.ANDERSON,
];

interface Props {
  /** Unique radio-group name; required because Bootstrap radios are
   * grouped by `name`. */
  name: string;
  value: UpgradeSource;
  onChange: (value: UpgradeSource) => void;
  size?: 'sm' | 'lg';
  variant?: 'outline-light' | 'outline-primary';
}

/**
 * Upgrade-source picker (Community / FGA / Anderson). Used in
 * scenario / campaign / load-scenario setup. Drives squad upgrades
 * via `scenarioUpgradesSource` on the global context — no longer a
 * per-squad control.
 */
export function UpgradeSourceToggle({ name, value, onChange, size = 'sm', variant = 'outline-primary' }: Props) {
  return (
    <ToggleButtonGroup
      type="radio"
      name={name}
      size={size}
      value={value}
      onChange={(v: UpgradeSource) => { onChange(v); }}
    >
      {UPGRADE_OPTIONS.map((src) => (
        <ToggleButton key={src} value={src} variant={variant}>
          {src}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
