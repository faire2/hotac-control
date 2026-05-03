import { describe, expect, test } from 'vitest';
import { runValidator } from '../src/data/__validate__';

describe('data layer invariants', () => {
  test('runValidator does not throw against current data', () => {
    expect(() => {
      runValidator();
    }).not.toThrow();
  });
});
