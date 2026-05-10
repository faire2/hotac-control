import { describe, expect, it } from 'vitest';
import {
  OPPOSITE_VECTOR,
  resolveSquadVector,
  resolveVector,
} from '../src/data/scenarios/resolve';
import {
  pickFromD20Table,
  rollD20RandomShip,
} from '../src/data/scenarios/randomShipPool';
import type { ShipId } from '../src/data/Ships';

describe('resolveVector', () => {
  it('passes through fixed numeric vectors', () => {
    expect(resolveVector(3)).toBe(3);
    expect(resolveVector(7)).toBe(7);
  });

  it('passes through map letters', () => {
    expect(resolveVector('C')).toBe('C');
  });

  it('clamps 1d6 rolls into 1..6', () => {
    expect(resolveVector('1d6', 1)).toBe(1);
    expect(resolveVector('1d6', 6)).toBe(6);
    expect(resolveVector('1d6', 99)).toBe(6);
    expect(resolveVector('1d6', 0)).toBe(1);
  });

  it('clamps 1d12 rolls into 1..12', () => {
    expect(resolveVector('1d12', 12)).toBe(12);
    expect(resolveVector('1d12', 1)).toBe(1);
  });

  it('1d6+6 produces 7..12', () => {
    expect(resolveVector('1d6+6', 1)).toBe(7);
    expect(resolveVector('1d6+6', 6)).toBe(12);
  });

  it('selects from a tuple by 1-based roll index', () => {
    expect(resolveVector([2, 3, 5], 1)).toBe(2);
    expect(resolveVector([2, 3, 5], 3)).toBe(5);
  });

  it('throws on empty tuple', () => {
    expect(() => resolveVector([])).toThrow(/empty vector tuple/);
  });

  it('rejects oppositeOf without sibling context', () => {
    expect(() =>
      resolveVector({ kind: 'oppositeOf', squadName: 'X' }),
    ).toThrow(/sibling context/);
  });
});

describe('resolveSquadVector', () => {
  it('resolves oppositeOf via sibling map', () => {
    const prior = new Map<string, number>([['Support A', 4]]);
    expect(
      resolveSquadVector(
        { kind: 'oppositeOf', squadName: 'Support A' },
        prior,
      ),
    ).toBe(10);
  });

  it('throws when oppositeOf reference is missing', () => {
    const prior = new Map<string, number>();
    expect(() =>
      resolveSquadVector(
        { kind: 'oppositeOf', squadName: 'Ghost' },
        prior,
      ),
    ).toThrow(/has not been resolved/);
  });

  it('throws when oppositeOf target is non-numeric', () => {
    const prior = new Map<string, 'C'>([['X', 'C']]);
    expect(() =>
      resolveSquadVector(
        { kind: 'oppositeOf', squadName: 'X' },
        prior,
      ),
    ).toThrow(/not numeric/);
  });

  it('falls through to resolveVector for non-oppositeOf inputs', () => {
    const prior = new Map<string, number>();
    expect(resolveSquadVector(5, prior)).toBe(5);
    expect(resolveSquadVector('1d6', prior, 4)).toBe(4);
  });
});

describe('OPPOSITE_VECTOR', () => {
  it('is symmetric for the documented pairs', () => {
    const pairs: [number, number][] = [
      [1, 7], [2, 9], [3, 8], [4, 10], [5, 12], [6, 11],
    ];
    for (const [a, b] of pairs) {
      expect(OPPOSITE_VECTOR[a]).toBe(b);
      expect(OPPOSITE_VECTOR[b]).toBe(a);
    }
  });
});

describe('pickFromD20Table', () => {
  const allEligible = new Set<ShipId>(['TIEIN', 'TIEADVX', 'TIESA', 'TIEPH', 'TIEDEF', 'LAMBDA', 'VT49']);
  const allIntroduced = new Set<ShipId>(['TIEPH', 'TIEDEF']);

  it('maps each bracket to the documented ship', () => {
    const ctx = { introduced: allIntroduced, eligible: allEligible };
    expect(pickFromD20Table(1, ctx)).toBe('TIEIN');
    expect(pickFromD20Table(5, ctx)).toBe('TIEIN');
    expect(pickFromD20Table(6, ctx)).toBe('TIEADVX');
    expect(pickFromD20Table(9, ctx)).toBe('TIEADVX');
    expect(pickFromD20Table(10, ctx)).toBe('TIESA');
    expect(pickFromD20Table(13, ctx)).toBe('TIESA');
    expect(pickFromD20Table(14, ctx)).toBe('TIEPH');
    expect(pickFromD20Table(16, ctx)).toBe('TIEPH');
    expect(pickFromD20Table(17, ctx)).toBe('TIEDEF');
    expect(pickFromD20Table(18, ctx)).toBe('TIEDEF');
    expect(pickFromD20Table(19, ctx)).toBe('LAMBDA');
    expect(pickFromD20Table(20, ctx)).toBe('VT49');
  });

  it('falls back to TIEIN for Phantom rolls when not introduced', () => {
    const ctx = { introduced: new Set<ShipId>(), eligible: allEligible };
    expect(pickFromD20Table(15, ctx)).toBe('TIEIN');
  });

  it('falls back to TIEADVX for Defender rolls when not introduced', () => {
    const ctx = { introduced: new Set<ShipId>(), eligible: allEligible };
    expect(pickFromD20Table(17, ctx)).toBe('TIEADVX');
  });

  it('falls back to LAMBDA for roll 20 when VT49 unavailable', () => {
    const eligible = new Set<ShipId>(['TIEIN', 'TIEADVX', 'TIESA', 'LAMBDA']);
    const ctx = { introduced: new Set<ShipId>(), eligible };
    expect(pickFromD20Table(20, ctx)).toBe('LAMBDA');
  });

  it('returns null when the picked ship is not eligible (caller should reroll)', () => {
    const eligible = new Set<ShipId>(['TIEADVX']);
    const ctx = { introduced: new Set<ShipId>(), eligible };
    expect(pickFromD20Table(1, ctx)).toBeNull(); // TIEIN not eligible
  });
});

describe('rollD20RandomShip', () => {
  it('always returns an eligible ship', () => {
    const eligible: ShipId[] = ['TIEIN', 'TIEADVX', 'TIESA'];
    for (let i = 0; i < 50; i++) {
      const pick = rollD20RandomShip([], eligible);
      expect(eligible).toContain(pick);
    }
  });

  it('throws when no ship is reachable', () => {
    expect(() => rollD20RandomShip([], [])).toThrow(/no eligible ship/);
  });
});
