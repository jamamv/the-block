import type { BodyStyle, TitleStatus, FuelType } from '../types/vehicle.ts';
import { getT } from './i18n.ts';

type TFn = ReturnType<typeof getT>;

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

export function conditionLabel(grade: number, t: TFn = getT('en')): string {
  if (grade >= 4.5) return t('condition.excellent');
  if (grade >= 3.5) return t('condition.good');
  if (grade >= 2.5) return t('condition.fair');
  return t('condition.poor');
}

export function conditionColor(grade: number): string {
  if (grade >= 4.5) return 'text-emerald-600';
  if (grade >= 3.5) return 'text-blue-600';
  if (grade >= 2.5) return 'text-amber-600';
  return 'text-red-600';
}

export function titleStatusLabel(status: TitleStatus, t: TFn = getT('en')): string {
  const keys: Record<TitleStatus, 'title.clean' | 'title.rebuilt' | 'title.salvage'> = {
    clean: 'title.clean',
    rebuilt: 'title.rebuilt',
    salvage: 'title.salvage',
  };
  return t(keys[status]);
}

export function bodyStyleLabel(style: BodyStyle, t: TFn = getT('en')): string {
  const keys: Record<BodyStyle, 'body.suv' | 'body.sedan' | 'body.truck' | 'body.coupe' | 'body.hatchback'> = {
    suv: 'body.suv',
    sedan: 'body.sedan',
    truck: 'body.truck',
    coupe: 'body.coupe',
    hatchback: 'body.hatchback',
  };
  return t(keys[style]);
}

export function fuelTypeLabel(fuel: FuelType, t: TFn = getT('en')): string {
  const keys: Record<FuelType, 'fuel.gasoline' | 'fuel.hybrid' | 'fuel.electric' | 'fuel.diesel'> = {
    gasoline: 'fuel.gasoline',
    hybrid: 'fuel.hybrid',
    electric: 'fuel.electric',
    diesel: 'fuel.diesel',
  };
  return t(keys[fuel]);
}

export function formatLot(lot: string): string {
  return `Lot ${lot}`;
}
