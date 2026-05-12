import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { AI } from '../../data/Ships';
import type { AiEngine } from '../../data/Ships';

const AI_OPTIONS: readonly AiEngine[] = [AI.FGA, AI.ANDERSON];

interface Props {
  /** Unique radio-group name; required because Bootstrap radios are
   * grouped by `name` and a duplicate name on the page swallows the
   * value of every same-named group. */
  name: string;
  value: AiEngine;
  onChange: (value: AiEngine) => void;
  /** Bootstrap button size — defaults to 'sm' so it fits in tight modal
   * headers. */
  size?: 'sm' | 'lg';
  /** Variant for the inactive (outline) state. 'outline-light' reads on
   * dark backgrounds (briefing modal); 'outline-primary' reads on light
   * (load-scenario / campaign setup modals). */
  variant?: 'outline-light' | 'outline-primary';
}

/**
 * AI-engine picker (FGA / Anderson). Used in scenario / campaign /
 * load-scenario setup. The toggle drives the squad-level AI engine
 * via `scenarioAiEngine` on the global context — there is no longer a
 * per-squad toggle.
 */
export function EngineToggle({ name, value, onChange, size = 'sm', variant = 'outline-primary' }: Props) {
  return (
    <ToggleButtonGroup
      type="radio"
      name={name}
      size={size}
      value={value}
      onChange={(v: AiEngine) => { onChange(v); }}
    >
      {AI_OPTIONS.map((eng) => (
        <ToggleButton key={eng} value={eng} variant={variant}>
          {eng}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
