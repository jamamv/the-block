import { useState, useCallback } from 'react';
import type { BidState, BidStateMap } from '../types/vehicle.ts';

const STORAGE_KEY = 'the-block:bids';

function loadBidStateMap(): BidStateMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BidStateMap) : {};
  } catch {
    return {};
  }
}

function saveBidStateMap(map: BidStateMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useBidState() {
  const [bidStateMap, setBidStateMap] = useState<BidStateMap>(loadBidStateMap);

  const placeBid = useCallback((vehicleId: string, amount: number) => {
    setBidStateMap((prev) => {
      const prevState = prev[vehicleId];
      const updated: BidState = {
        current_bid: amount,
        bid_count: (prevState?.bid_count ?? 0) + 1,
        last_bid_at: new Date().toISOString(),
      };
      const next = { ...prev, [vehicleId]: updated };
      saveBidStateMap(next);
      return next;
    });
  }, []);

  const buyNow = useCallback((vehicleId: string, price: number) => {
    setBidStateMap((prev) => {
      const prevState = prev[vehicleId];
      const updated: BidState = {
        current_bid: price,
        bid_count: (prevState?.bid_count ?? 0) + 1,
        last_bid_at: new Date().toISOString(),
        bought_now: true,
      };
      const next = { ...prev, [vehicleId]: updated };
      saveBidStateMap(next);
      return next;
    });
  }, []);

  const getBidState = useCallback(
    (vehicleId: string): BidState | undefined => bidStateMap[vehicleId],
    [bidStateMap],
  );

  return { bidStateMap, placeBid, buyNow, getBidState };
}
