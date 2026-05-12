import { useState, useEffect, useMemo } from 'react';
import {
  getNormalizedAuctionStart,
  getAuctionStatus,
  getCountdownText,
  type AuctionStatus,
} from '../utils/auction.ts';

export type { AuctionStatus };

export function useAuctionStatus(auctionStartIso: string) {
  const [now, setNow] = useState(() => Date.now());

  const normalizedStart = useMemo(
    () => getNormalizedAuctionStart(auctionStartIso),
    [auctionStartIso],
  );

  const status = getAuctionStatus(normalizedStart, now);
  const countdown = getCountdownText(normalizedStart, status, now);

  useEffect(() => {
    if (status === 'ended') return;
    // Live/ending-soon: tick every 30s (countdown shows h/m, not seconds)
    // Upcoming: tick every 60s
    const interval = status === 'upcoming' ? 60_000 : 30_000;
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [status]);

  return { status, countdown, normalizedStart };
}
