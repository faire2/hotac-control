import type { AllyAction } from '../../data/allyActions';
import { ICON_CLASS } from '../../data/icons';

interface Props {
  /** The ally's resolved action bar (mission `removeActions` already applied). */
  actions: readonly AllyAction[];
}

/**
 * Action bar for a player-piloted rebel ally — one action per line. Replaces
 * the AI decision carousel (target-priority / attack-priority), which is
 * meaningless for allies the players steer themselves. Linked actions render
 * as "Primary ▸ Follow-up" on a single row (e.g. the HWK-290's Focus ▸ Rotate).
 */
export function AllyActions({ actions }: Props) {
  if (actions.length === 0) return null;
  return (
    <div className="ally-actions d-flex flex-column">
      <h3 className="squadSectionHeader">Actions</h3>
      <ul className="ally-actions-list">
        {actions.map((action) => (
          <li key={action.id} className="ally-actions-item">
            <i className={`${ICON_CLASS[action.icon]} ally-actions-icon`} aria-hidden="true" />
            <span className="ally-actions-label">{action.label}</span>
            {action.linked && (
              <span className="ally-actions-linked">
                <i className={`${ICON_CLASS.linked} ally-actions-link-arrow`} aria-hidden="true" />
                <i className={`${ICON_CLASS[action.linked.icon]} ally-actions-icon`} aria-hidden="true" />
                <span className="ally-actions-label">{action.linked.label}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
