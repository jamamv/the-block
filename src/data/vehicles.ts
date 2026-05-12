import rawVehicles from '../../data/vehicles.json';
import type { Vehicle, BodyStyle } from '../types/vehicle.ts';

export const vehicles: Vehicle[] = (rawVehicles as Vehicle[]).map((v) => ({
  ...v,
  body_style: v.body_style.toLowerCase() as BodyStyle,
}));

export const ALL_MAKES: string[] = [...new Set(vehicles.map((v) => v.make))].sort();

export const ALL_PROVINCES: string[] = [...new Set(vehicles.map((v) => v.province))].sort();

export const ALL_BODY_STYLES: BodyStyle[] = [
  'suv',
  'sedan',
  'truck',
  'coupe',
  'hatchback',
];

export function getVehicleById(id: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === id);
}
