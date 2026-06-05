import { afterEach, describe, expect, it, vi } from 'vitest';
import getUpgrades from '../src/data/upgrades/getUpgrades';
import { UPGRADES } from '../src/data/Ships';

/**
 * Anderson elite handling mirrors the Community engine: non-elite enemies
 * receive only the card's Basic section; elite enemies additionally receive
 * the Elite-section rows their initiative unlocks.
 *
 * `Math.random` is pinned to 0 so `pickAndersonVariant` deterministically
 * selects variant index 0. For TIEIN variant 0 that is: Basic = Hull Upgrade;
 * Elite = Shield Upgrade @4, Vult Skerris @4, Turr Phennir @5,
 * Targeting Matrix @6, Seventh Sister @6.
 */
describe('getUpgrades — Anderson elite handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('non-elite gets Basic only; elite gets Basic + initiative-gated Elite', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const nonEliteR6 = getUpgrades('TIEIN', 6, UPGRADES.ANDERSON, false).upgrades;
    const nonEliteR4 = getUpgrades('TIEIN', 4, UPGRADES.ANDERSON, false).upgrades;
    const eliteR6 = getUpgrades('TIEIN', 6, UPGRADES.ANDERSON, true).upgrades;
    const eliteR4 = getUpgrades('TIEIN', 4, UPGRADES.ANDERSON, true).upgrades;

    // Non-elite: Basic section only, regardless of rank.
    expect(nonEliteR6).toHaveLength(1);
    expect(nonEliteR4).toEqual(nonEliteR6);

    // Elite: Basic + Elite rows whose initiative <= rank.
    expect(eliteR6).toHaveLength(6); // 1 basic + 5 elite (all init <= 6)
    expect(eliteR4).toHaveLength(3); // 1 basic + 2 elite (init <= 4)

    // The elite list begins with the same Basic row a non-elite would get.
    expect(eliteR6.slice(0, 1)).toEqual(nonEliteR6);
  });
});
