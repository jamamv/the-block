import rawVehicles from '../../data/vehicles.json';

// Compute the original timestamp range once from the dataset
const timestamps = (rawVehicles as Array<{ auction_start: string }>).map(
  (v) => new Date(v.auction_start).getTime(),
);
const MIN_TS = Math.min(...timestamps);
const RANGE_MS = Math.max(...timestamps) - MIN_TS;

// Map the original 6.5-day spread onto a window relative to "now":
//   -40h (some auctions already ended) → +36h (some auctions upcoming)
// Gives roughly: 20% ended, 30% live, 50% upcoming
const WINDOW_START_MS = -40 * 60 * 60 * 1000;
const WINDOW_END_MS = 36 * 60 * 60 * 1000;
const WINDOW_RANGE_MS = WINDOW_END_MS - WINDOW_START_MS;

export const AUCTION_DURATION_MS = 24 * 60 * 60 * 1000;

export function getNormalizedAuctionStart(auctionStartIso: string): Date {
  const original = new Date(auctionStartIso).getTime();
  const t = (original - MIN_TS) / RANGE_MS; // 0..1
  return new Date(Date.now() + WINDOW_START_MS + t * WINDOW_RANGE_MS);
}

export type AuctionStatus = 'live' | 'ending-soon' | 'upcoming' | 'ended';

export function getAuctionStatus(normalizedStart: Date, now = Date.now()): AuctionStatus {
  const start = normalizedStart.getTime();
  const end = start + AUCTION_DURATION_MS;
  if (now < start) return 'upcoming';
  if (now >= end) return 'ended';
  if (end - now < 2 * 60 * 60 * 1000) return 'ending-soon';
  return 'live';
}

export function getCountdownText(
  normalizedStart: Date,
  status: AuctionStatus,
  now = Date.now(),
): string {
  const start = normalizedStart.getTime();
  const end = start + AUCTION_DURATION_MS;

  const fmt = (ms: number): string => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return '< 1m';
  };

  if (status === 'upcoming') return `Starts in ${fmt(start - now)}`;
  if (status === 'live' || status === 'ending-soon') return `Ends in ${fmt(end - now)}`;
  return 'Ended';
}
