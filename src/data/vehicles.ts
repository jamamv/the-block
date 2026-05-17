import rawVehicles from '../../data/vehicles.json';
import type { Vehicle, BodyStyle, FuelType } from '../types/vehicle.ts';

export const vehicles: Vehicle[] = (rawVehicles as Vehicle[]).map((v) => ({
  ...v,
  body_style: v.body_style.toLowerCase() as BodyStyle,
}));

export const ALL_BrandS: string[] = [...new Set(vehicles.map((v) => v.Brand))].sort();

export const ALL_PROVINCES: string[] = [...new Set(vehicles.map((v) => v.province))].sort();

export const ALL_BODY_STYLES: BodyStyle[] = [
  'suv',
  'sedan',
  'truck',
  'coupe',
  'hatchback',
];

export const ALL_FUEL_TYPES: FuelType[] = ['gasoline', 'hybrid', 'electric', 'diesel'];

export function getVehicleById(id: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === id);
}

const _dealerCounts: Record<string, number> = {};
for (const v of vehicles) {
  _dealerCounts[v.selling_dealership] = (_dealerCounts[v.selling_dealership] ?? 0) + 1;
}
export const VERIFIED_DEALERS = new Set(
  Object.entries(_dealerCounts).filter(([, c]) => c >= 5).map(([name]) => name),
);
