import { useMemo } from 'react';
import { useNow } from './useNow.ts';
import {
  getNormalizedAuctionStart,
  getAuctionStatus,
  getCountdownText,
  type AuctionStatus,
} from '../utils/auction.ts';

export type { AuctionStatus };

export function useAuctionStatus(auctionStartIso: string) {
  const now = useNow();

  const normalizedStart = useMemo(
    () => getNormalizedAuctionStart(auctionStartIso),
    [auctionStartIso],
  );

  const status = getAuctionStatus(normalizedStart, now);
  const countdown = getCountdownText(normalizedStart, status, now);

  return { status, countdown, normalizedStart };
}
