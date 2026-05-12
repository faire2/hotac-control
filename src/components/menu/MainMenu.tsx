import Dropdown from 'react-bootstrap/Dropdown';

interface Props {
  onNewClick: () => void;
  onOpenClick: () => void;
  onLoadScenarioClick: () => void;
  /** Stub for OAuth/Neon work; today no-ops or shows a placeholder. */
  onLogoutClick: () => void;
}

/**
 * Top-bar Menu dropdown: New / Open / Load scenario / Logout.
 *
 * - **New**: opens the New-Game picker (Campaign / Scenario / Free Play).
 * - **Open**: opens the saved-campaigns browser (resume or delete).
 * - **Load scenario**: opens the scenario picker (also accepts player
 *   count + rank so a scenario can be entered straight from the menu).
 * - **Logout**: stub. The app has no auth today; the entry is here so the
 *   eventual OAuth/Neon migration drops in without UI churn. Until then it
 *   shows a placeholder alert.
 */
export function MainMenu({
  onNewClick,
  onOpenClick,
  onLoadScenarioClick,
  onLogoutClick,
}: Props) {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" id="main-menu-toggle">
        Menu
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={onNewClick}>New</Dropdown.Item>
        <Dropdown.Item onClick={onOpenClick}>Open</Dropdown.Item>
        <Dropdown.Item onClick={onLoadScenarioClick}>Load scenario</Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={onLogoutClick}>Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
