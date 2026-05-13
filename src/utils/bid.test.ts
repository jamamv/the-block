import { describe, expect, it } from 'vitest';
import { minimumBid, validateBid } from './bid.ts';

describe('bid utilities', () => {
  it('adds the fixed minimum increment to the current bid', () => {
    expect(minimumBid(10_000)).toBe(10_500);
  });

  it('rejects empty, negative, and too-low bid amounts', () => {
    expect(validateBid(Number.NaN, 10_000)).toBe('Please enter a valid amount.');
    expect(validateBid(-1, 10_000)).toBe('Please enter a valid amount.');
    expect(validateBid(10_499, 10_000)).toBe('Minimum bid is $10,500.');
  });

  it('accepts a bid at the minimum increment', () => {
    expect(validateBid(10_500, 10_000)).toBeNull();
  });
});
