import { useState } from 'react';
import type { AllyAction } from '../../data/allyActions';
import { ICON_CLASS } from '../../data/icons';

interface Props {
  /** The ally's resolved action bar (mission `removeActions` already applied). */
  actions: readonly AllyAction[];
}

/**
 * Action bar for a player-piloted rebel ally. Each action is a click-to-
 * select button with the same lock-on glow + pulse treatment as the
 * maneuver-dial cells — players mark which action they're taking this
 * round, matching the dial's interaction model (and clearing the
 * selection on a second click).
 *
 * Linked actions render as "Primary ▸ Follow-up" inside the same button
 * (e.g. the HWK-290's Focus ▸ Rotate) — selecting a linked action
 * selects both halves as one declaration.
 */
export function AllyActions({ actions }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (actions.length === 0) return null;
  return (
    <div className="ally-actions d-flex flex-column">
      <h3 className="squadSectionHeader">Actions</h3>
      <ul className="ally-actions-list">
        {actions.map((action) => {
          const isSelected = action.id === selectedId;
          const linkedAria = action.linked ? ` then ${action.linked.label}` : '';
          return (
            <li key={action.id} className="ally-actions-item">
              <button
                type="button"
                className={`ally-actions-button${isSelected ? ' ally-actions-button--selected' : ''}`}
                aria-pressed={isSelected}
                aria-label={`${action.label}${linkedAria}${isSelected ? ' — selected' : ''}`}
                onClick={() => {
                  setSelectedId((prev) => (prev === action.id ? null : action.id));
                }}
              >
                <i className={`${ICON_CLASS[action.icon]} ally-actions-icon`} aria-hidden="true" />
                <span className="ally-actions-label">{action.label}</span>
                {action.linked && (
                  <span className="ally-actions-linked">
                    <i className={`${ICON_CLASS.linked} ally-actions-link-arrow`} aria-hidden="true" />
                    <i className={`${ICON_CLASS[action.linked.icon]} ally-actions-icon`} aria-hidden="true" />
                    <span className="ally-actions-label">{action.linked.label}</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
