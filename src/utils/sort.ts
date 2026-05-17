import type { Vehicle, BidStateMap, SortKey } from '../types/vehicle.ts';

function currentBid(vehicle: Vehicle, bidStateMap: BidStateMap): number {
  return bidStateMap[vehicle.id]?.current_bid ?? vehicle.current_bid ?? 0;
}

export function sortVehicles(
  vehicles: Vehicle[],
  key: SortKey,
  bidStateMap: BidStateMap,
): Vehicle[] {
  const sorted = [...vehicles];
  switch (key) {
    case 'bid_desc':
      return sorted.sort((a, b) => currentBid(b, bidStateMap) - currentBid(a, bidStateMap));
    case 'bid_asc':
      return sorted.sort((a, b) => currentBid(a, bidStateMap) - currentBid(b, bidStateMap));
    case 'year_desc':
      return sorted.sort((a, b) => b.year - a.year);
    case 'odometer_asc':
      return sorted.sort((a, b) => a.odometer_km - b.odometer_km);
    case 'condition_desc':
      return sorted.sort((a, b) => b.condition_grade - a.condition_grade);
  }
}
