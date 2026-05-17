import type { Vehicle } from '../types/vehicle.ts';
import { vehicles as allVehicles } from '../data/vehicles.ts';

export type PriceLabel = 'great-deal' | 'fair-price' | 'high-bid';

const cache = new Map<string, PriceLabel | null>();

export function getPriceLabel(vehicle: Vehicle): PriceLabel | null {
  const cacheKey = `${vehicle.id}-${vehicle.current_bid ?? 'none'}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const bid = vehicle.current_bid;
  if (bid == null) {
    cache.set(cacheKey, null);
    return null;
  }

  // Peer group: same body_style + fuel_type; fall back to body_style only
  let peers = allVehicles
    .filter(v => v.id !== vehicle.id && v.body_style === vehicle.body_style && v.fuel_type === vehicle.fuel_type && v.current_bid != null)
    .map(v => v.current_bid as number);

  if (peers.length < 5) {
    peers = allVehicles
      .filter(v => v.id !== vehicle.id && v.body_style === vehicle.body_style && v.current_bid != null)
      .map(v => v.current_bid as number);
  }

  if (peers.length < 3) {
    cache.set(cacheKey, null);
    return null;
  }

  // Percentile rank of this bid within the peer group.
  // Bottom 25%: buyer is getting a relative deal.
  // Top 25%: bid is running high relative to peers.
  // Middle 50%: no badge — don't label the majority.
  const sorted = [...peers].sort((a, b) => a - b);
  const rank = sorted.filter(p => p < bid).length / sorted.length;

  const label: PriceLabel = rank < 0.25 ? 'great-deal' : rank > 0.75 ? 'high-bid' : 'fair-price';
  cache.set(cacheKey, label);
  return label;
}
