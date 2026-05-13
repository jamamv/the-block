import { useState, useEffect, useMemo } from 'react';
import type { BidStateMap } from '../types/vehicle.ts';
import { vehicles } from '../data/vehicles.ts';
import { getNormalizedAuctionStart, getAuctionStatus, getCountdownText } from '../utils/auction.ts';

export interface AuctionNotification {
  id: string;
  vehicleId: string;
  type: 'bid-ending' | 'watchlist-live' | 'watchlist-ending';
  title: string;
  countdown: string;
  image: string;
}

const PRIORITY: Record<AuctionNotification['type'], number> = {
  'bid-ending': 0,
  'watchlist-live': 1,
  'watchlist-ending': 2,
};

export function useNotifications(bidStateMap: BidStateMap, watchlist: Set<string>): AuctionNotification[] {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const notes: AuctionNotification[] = [];

    for (const v of vehicles) {
      const start = getNormalizedAuctionStart(v.auction_start);
      const status = getAuctionStatus(start, now);
      const inBids = v.id in bidStateMap;
      const inWatch = watchlist.has(v.id);

      if (inBids && (status === 'ending-soon' || status === 'live')) {
        notes.push({
          id: `bid-${v.id}`,
          vehicleId: v.id,
          type: 'bid-ending',
          title: `${v.year} ${v.Brand} ${v.model}`,
          countdown: getCountdownText(start, status, now),
          image: v.images[0],
        });
      } else if (inWatch && !inBids) {
        if (status === 'live') {
          notes.push({
            id: `watch-live-${v.id}`,
            vehicleId: v.id,
            type: 'watchlist-live',
            title: `${v.year} ${v.Brand} ${v.model}`,
            countdown: 'Live now',
            image: v.images[0],
          });
        } else if (status === 'ending-soon') {
          notes.push({
            id: `watch-ending-${v.id}`,
            vehicleId: v.id,
            type: 'watchlist-ending',
            title: `${v.year} ${v.Brand} ${v.model}`,
            countdown: getCountdownText(start, status, now),
            image: v.images[0],
          });
        }
      }
    }

    return notes.sort((a, b) => PRIORITY[a.type] - PRIORITY[b.type]);
  }, [bidStateMap, watchlist, now]);
}
