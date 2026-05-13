import { describe, expect, it } from 'vitest';
import { AUCTION_DURATION_MS, getAuctionStatus, getCountdownText } from './auction.ts';

describe('auction utilities', () => {
  const now = new Date('2026-05-13T12:00:00.000Z').getTime();

  it('classifies upcoming, live, ending-soon, and ended auctions', () => {
    expect(getAuctionStatus(new Date(now + 60_000), now)).toBe('upcoming');
    expect(getAuctionStatus(new Date(now - 3 * 60 * 60 * 1000), now)).toBe('live');
    expect(getAuctionStatus(new Date(now - AUCTION_DURATION_MS + 30 * 60 * 1000), now)).toBe('ending-soon');
    expect(getAuctionStatus(new Date(now - AUCTION_DURATION_MS), now)).toBe('ended');
  });

  it('formats countdown text based on auction status', () => {
    expect(getCountdownText(new Date(now + 90 * 60 * 1000), 'upcoming', now)).toBe('Starts in 1h 30m');
    expect(getCountdownText(new Date(now - 23 * 60 * 60 * 1000), 'ending-soon', now)).toBe('Ends in 1h 0m');
    expect(getCountdownText(new Date(now - AUCTION_DURATION_MS), 'ended', now)).toBe('Ended');
  });
});
