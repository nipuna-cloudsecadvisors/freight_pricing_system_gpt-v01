import { describe, it, expect } from 'vitest';
import { calculateProcessedPercentage } from '../utils/rate-helpers';

describe('calculateProcessedPercentage', () => {
  it('returns 0 when preferred line is not specified', () => {
    expect(calculateProcessedPercentage(null, 3, 5)).toBe(0);
  });

  it('returns capped value', () => {
    expect(calculateProcessedPercentage('line', 10, 5)).toBe(100);
  });

  it('handles valid percentages', () => {
    expect(calculateProcessedPercentage('line', 1, 4)).toBe(25);
  });
});
