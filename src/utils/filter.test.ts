import { describe, expect, it } from 'vitest';
import type { Vehicle } from '../types/vehicle.ts';
import { DEFAULT_FILTERS, computeFilterCounts, filterVehicles, isFilterActive } from './filter.ts';

const baseVehicle: Vehicle = {
  id: 'v1',
  vin: 'VIN123',
  year: 2022,
  Brand: 'Honda',
  model: 'Civic',
  trim: 'Sport',
  body_style: 'sedan',
  exterior_color: 'White',
  interior_color: 'Black',
  engine: '2.0L I4',
  transmission: 'automatic',
  drivetrain: 'FWD',
  odometer_km: 25_000,
  fuel_type: 'gasoline',
  condition_grade: 4.2,
  condition_report: 'Good',
  damage_notes: [],
  title_status: 'clean',
  province: 'ON',
  city: 'Toronto',
  auction_start: '2026-05-13T10:00:00.000Z',
  starting_bid: 10_000,
  reserve_price: 12_000,
  buy_now_price: 18_000,
  images: ['/car.jpg'],
  selling_dealership: 'Maple Motors',
  lot: 'A123',
  current_bid: 11_000,
  bid_count: 3,
};

const vehicles: Vehicle[] = [
  baseVehicle,
  {
    ...baseVehicle,
    id: 'v2',
    vin: 'VIN456',
    Brand: 'Ford',
    model: 'F-150',
    body_style: 'truck',
    fuel_type: 'hybrid',
    title_status: 'rebuilt',
    province: 'BC',
    city: 'Vancouver',
    selling_dealership: 'Pacific Trucks',
  },
];

describe('filter utilities', () => {
  it('detects whether any filter is active', () => {
    expect(isFilterActive(DEFAULT_FILTERS)).toBe(false);
    expect(isFilterActive({ ...DEFAULT_FILTERS, search: 'civic' })).toBe(true);
    expect(isFilterActive({ ...DEFAULT_FILTERS, Brands: ['Honda'] })).toBe(true);
  });

  it('filters by search text across vehicle and dealer fields', () => {
    expect(filterVehicles(vehicles, { ...DEFAULT_FILTERS, search: 'maple' })).toEqual([baseVehicle]);
    expect(filterVehicles(vehicles, { ...DEFAULT_FILTERS, search: 'VIN456' })).toEqual([vehicles[1]]);
  });

  it('filters by structured facets', () => {
    const result = filterVehicles(vehicles, {
      ...DEFAULT_FILTERS,
      Brands: ['Ford'],
      bodyStyles: ['truck'],
      titleStatuses: ['rebuilt'],
      provinces: ['BC'],
    });

    expect(result).toEqual([vehicles[1]]);
  });

  it('computes counts for inventory facets', () => {
    const counts = computeFilterCounts(vehicles);

    expect(counts.Brands).toMatchObject({ Honda: 1, Ford: 1 });
    expect(counts.bodyStyles).toMatchObject({ sedan: 1, truck: 1 });
    expect(counts.titleStatuses).toMatchObject({ clean: 1, rebuilt: 1 });
    expect(counts.provinces).toMatchObject({ ON: 1, BC: 1 });
  });
});
