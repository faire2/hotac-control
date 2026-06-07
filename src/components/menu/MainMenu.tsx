import Dropdown from 'react-bootstrap/Dropdown';

interface Props {
  onNewClick: () => void;
  onOpenClick: () => void;
  onLoadScenarioClick: () => void;
  onShipsOverviewClick: () => void;
  /** Stub for OAuth/Neon work; today no-ops or shows a placeholder. */
  onLogoutClick: () => void;
}

/**
 * Top-bar Menu dropdown: New / Open / Load scenario / Ships overview / Logout.
 *
 * - **New**: opens the New-Game picker (Campaign / Scenario / Free Play).
 * - **Open**: opens the saved-campaigns browser (resume or delete).
 * - **Load scenario**: opens the mission-map gallery, which doubles as the
 *   scenario picker — every authored mission is visible on a card with its
 *   map thumbnail, and clicking a card opens the briefing in start mode.
 * - **Ships overview**: opens the read-only AI-ship reference — every
 *   ship the selected engine covers, with its full maneuver matrix and
 *   every variant of every upgrade card it could roll. Doesn't touch any
 *   game state.
 * - **Logout**: stub. The app has no auth today; the entry is here so the
 *   eventual OAuth/Neon migration drops in without UI churn. Until then it
 *   shows a placeholder alert.
 */
export function MainMenu({
  onNewClick,
  onOpenClick,
  onLoadScenarioClick,
  onShipsOverviewClick,
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
        <Dropdown.Item onClick={onShipsOverviewClick}>Ships overview</Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={onLogoutClick}>Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
