import { describe, expect, it } from 'vitest';
import type { BidStateMap, Vehicle } from '../types/vehicle.ts';
import { sortVehicles } from './sort.ts';

function vehicle(overrides: Partial<Vehicle>): Vehicle {
  return {
    id: 'v1',
    vin: 'VIN',
    year: 2020,
    Brand: 'Honda',
    model: 'Civic',
    trim: 'Sport',
    body_style: 'sedan',
    exterior_color: 'White',
    interior_color: 'Black',
    engine: '2.0L I4',
    transmission: 'automatic',
    drivetrain: 'FWD',
    odometer_km: 50_000,
    fuel_type: 'gasoline',
    condition_grade: 3,
    condition_report: 'Good',
    damage_notes: [],
    title_status: 'clean',
    province: 'ON',
    city: 'Toronto',
    auction_start: '2026-05-13T10:00:00.000Z',
    starting_bid: 10_000,
    reserve_price: null,
    buy_now_price: null,
    images: [],
    selling_dealership: 'Dealer',
    lot: 'LOT',
    current_bid: null,
    bid_count: 0,
    ...overrides,
  };
}

describe('sort utilities', () => {
  const vehicles = [
    vehicle({ id: 'old-low', year: 2019, odometer_km: 80_000, condition_grade: 2.5, current_bid: 7_000 }),
    vehicle({ id: 'new-mid', year: 2024, odometer_km: 40_000, condition_grade: 4.1, current_bid: 12_000 }),
    vehicle({ id: 'clean-high', year: 2021, odometer_km: 10_000, condition_grade: 4.8, current_bid: null }),
  ];

  it('sorts by bid using local bid state over initial vehicle bids', () => {
    const bidStateMap: BidStateMap = {
      'clean-high': {
        current_bid: 15_000,
        bid_count: 1,
        last_bid_at: '2026-05-13T12:00:00.000Z',
      },
    };

    expect(sortVehicles(vehicles, 'bid_desc', bidStateMap).map((v) => v.id)).toEqual(['clean-high', 'new-mid', 'old-low']);
    expect(sortVehicles(vehicles, 'bid_asc', bidStateMap).map((v) => v.id)).toEqual(['old-low', 'new-mid', 'clean-high']);
  });

  it('sorts by year, mileage, and condition', () => {
    expect(sortVehicles(vehicles, 'year_desc', {}).map((v) => v.id)).toEqual(['new-mid', 'clean-high', 'old-low']);
    expect(sortVehicles(vehicles, 'odometer_asc', {}).map((v) => v.id)).toEqual(['clean-high', 'new-mid', 'old-low']);
    expect(sortVehicles(vehicles, 'condition_desc', {}).map((v) => v.id)).toEqual(['clean-high', 'new-mid', 'old-low']);
  });
});
