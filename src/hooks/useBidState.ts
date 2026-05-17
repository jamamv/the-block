import { useState, useCallback, useEffect } from 'react';
import type { BidState, BidStateMap } from '../types/vehicle.ts';
import type { AuthUser } from '../lib/api.ts';
import { apiFetchBids, apiPlaceBid, apiRetractBid } from '../lib/api.ts';
import { getVehicleById } from '../data/vehicles.ts';

const STORAGE_KEY = 'the-block:bids';

function isRealUser(user: AuthUser | null): boolean {
  return user !== null && user.id !== 'guest';
}

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

export function useBidState(user: AuthUser | null) {
  const [bidStateMap, setBidStateMap] = useState<BidStateMap>(loadBidStateMap);

  // When a real user's session resolves, fetch their server bids and replace local state.
  // Guest users keep localStorage only.
  useEffect(() => {
    if (!isRealUser(user)) return;
    apiFetchBids().then((serverBids) => {
      setBidStateMap(serverBids);
      saveBidStateMap(serverBids);
    }).catch(() => {});
  }, [user?.id]);

  const placeBid = useCallback((vehicleId: string, amount: number) => {
    setBidStateMap((prev) => {
      const staticCount = getVehicleById(vehicleId)?.bid_count ?? 0;
      const updated: BidState = {
        current_bid: amount,
        bid_count: prev[vehicleId] ? prev[vehicleId].bid_count : staticCount + 1,
        last_bid_at: new Date().toISOString(),
      };
      const next = { ...prev, [vehicleId]: updated };
      saveBidStateMap(next);
      return next;
    });
    if (isRealUser(user)) apiPlaceBid(vehicleId, amount).catch(() => {});
  }, [user]);

  const buyNow = useCallback((vehicleId: string, price: number) => {
    setBidStateMap((prev) => {
      const staticCount = getVehicleById(vehicleId)?.bid_count ?? 0;
      const updated: BidState = {
        current_bid: price,
        bid_count: prev[vehicleId] ? prev[vehicleId].bid_count : staticCount + 1,
        last_bid_at: new Date().toISOString(),
        bought_now: true,
      };
      const next = { ...prev, [vehicleId]: updated };
      saveBidStateMap(next);
      return next;
    });
    if (isRealUser(user)) apiPlaceBid(vehicleId, price, true).catch(() => {});
  }, [user]);

  const retractBid = useCallback((vehicleId: string) => {
    setBidStateMap((prev) => {
      const next = { ...prev };
      delete next[vehicleId];
      saveBidStateMap(next);
      return next;
    });
    if (isRealUser(user)) apiRetractBid(vehicleId).catch(() => {});
  }, [user]);

  return { bidStateMap, placeBid, buyNow, retractBid };
}
