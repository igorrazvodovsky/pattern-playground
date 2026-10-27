import { describe, expect, it } from 'vitest';
import { SCOPE_LEVELS, isAscendingRange, levelsSpanned } from './facets';

describe('isAscendingRange', () => {
  it('accepts a single level', () => {
    expect(isAscendingRange('view', SCOPE_LEVELS)).toBe(true);
  });

  it('accepts a pair from low to high', () => {
    expect(isAscendingRange(['element', 'view'], SCOPE_LEVELS)).toBe(true);
  });

  it('rejects a pair from high to low', () => {
    expect(isAscendingRange(['view', 'element'], SCOPE_LEVELS)).toBe(false);
  });

  it('rejects a pair with equal ends', () => {
    expect(isAscendingRange(['view', 'view'], SCOPE_LEVELS)).toBe(false);
  });
});

describe('levelsSpanned', () => {
  it('returns a single level as itself', () => {
    expect(levelsSpanned('area', SCOPE_LEVELS)).toEqual(['area']);
  });

  it('includes every level between the ends of a pair', () => {
    expect(levelsSpanned(['component', 'product'], SCOPE_LEVELS)).toEqual([
      'component',
      'view',
      'area',
      'product',
    ]);
  });
});
