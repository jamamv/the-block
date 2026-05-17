import { getT } from './i18n.ts';

type TFn = ReturnType<typeof getT>;

const MIN_BID_INCREMENT = 500;

export function minimumBid(currentBid: number): number {
  return currentBid + MIN_BID_INCREMENT;
}

export function validateBid(
  amount: number,
  currentBid: number,
  t: TFn = getT('en'),
): string | null {
  if (isNaN(amount) || amount <= 0) return t('bid.err_invalid');
  if (amount < minimumBid(currentBid)) {
    return t('bid.err_minimum', { amount: `$${minimumBid(currentBid).toLocaleString('en-CA')}` });
  }
  return null;
}
