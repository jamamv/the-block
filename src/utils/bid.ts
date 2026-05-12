export const MIN_BID_INCREMENT = 500;

export function minimumBid(currentBid: number): number {
  return currentBid + MIN_BID_INCREMENT;
}

export function validateBid(
  amount: number,
  currentBid: number,
): string | null {
  if (isNaN(amount) || amount <= 0) return 'Please enter a valid amount.';
  if (amount < minimumBid(currentBid)) {
    return `Minimum bid is $${minimumBid(currentBid).toLocaleString('en-CA')}.`;
  }
  return null;
}
