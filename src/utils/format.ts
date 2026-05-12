import type { BodyStyle, TitleStatus } from '../types/vehicle.ts';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount);
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

export function formatLot(lot: string): string {
  return `Lot ${lot}`;
}
