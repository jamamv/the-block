import type { Vehicle } from '../types/vehicle.ts';
import { vehicles as allVehicles } from '../data/vehicles.ts';

export type PriceLabel = 'great-deal' | 'fair-price' | 'high-bid';

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Cached at module load — runs once per vehicle id
const cache = new Map<string, PriceLabel | null>();

export function getPriceLabel(vehicle: Vehicle): PriceLabel | null {
  if (cache.has(vehicle.id)) return cache.get(vehicle.id)!;

  const bid = vehicle.current_bid;
  if (bid == null) { cache.set(vehicle.id, null); return null; }

  // Prefer body_style + fuel_type match; fall back to body_style only
  let peers = allVehicles
    .filter(v => v.id !== vehicle.id && v.body_style === vehicle.body_style && v.fuel_type === vehicle.fuel_type && v.current_bid != null)
    .map(v => v.current_bid as number);

  if (peers.length < 5) {
    peers = allVehicles
      .filter(v => v.id !== vehicle.id && v.body_style === vehicle.body_style && v.current_bid != null)
      .map(v => v.current_bid as number);
  }

  if (peers.length < 3) { cache.set(vehicle.id, null); return null; }

  const ratio = bid / median(peers);
  const label: PriceLabel = ratio < 0.87 ? 'great-deal' : ratio > 1.13 ? 'high-bid' : 'fair-price';
  cache.set(vehicle.id, label);
  return label;
}
