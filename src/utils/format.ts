import type { BodyStyle, TitleStatus, FuelType } from '../types/vehicle.ts';

const USD_RATE = 0.73;

export function formatCurrency(amount: number, currency: 'CAD' | 'USD' = 'CAD'): string {
  const displayAmount = currency === 'USD' ? Math.round(amount * USD_RATE) : amount;
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(displayAmount);
}

export function formatOdometer(km: number): string {
  return `${km.toLocaleString('en-CA')} km`;
}

export function conditionLabel(grade: number): string {
  if (grade >= 4.5) return 'Excellent';
  if (grade >= 3.5) return 'Good';
  if (grade >= 2.5) return 'Fair';
  return 'Poor';
}

export function conditionColor(grade: number): string {
  if (grade >= 4.5) return 'text-emerald-600';
  if (grade >= 3.5) return 'text-blue-600';
  if (grade >= 2.5) return 'text-amber-600';
  return 'text-red-600';
}

export function titleStatusLabel(status: TitleStatus): string {
  const labels: Record<TitleStatus, string> = {
    clean: 'Clean',
    rebuilt: 'Rebuilt',
    salvage: 'Salvage',
  };
  return labels[status];
}

export function bodyStyleLabel(style: BodyStyle): string {
  const labels: Record<BodyStyle, string> = {
    suv: 'SUV',
    sedan: 'Sedan',
    truck: 'Truck',
    coupe: 'Coupe',
    hatchback: 'Hatchback',
  };
  return labels[style];
}

export function fuelTypeLabel(fuel: FuelType): string {
  const labels: Record<FuelType, string> = {
    gasoline: 'Gasoline',
    hybrid: 'Hybrid',
    electric: 'Electric',
    diesel: 'Diesel',
  };
  return labels[fuel];
}

export function formatLot(lot: string): string {
  return `Lot ${lot}`;
}
