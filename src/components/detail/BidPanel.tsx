import { useState } from 'react';
import type { Vehicle, BidState } from '../../types/vehicle.ts';
import { formatCurrency } from '../../utils/format.ts';
import { validateBid, minimumBid } from '../../utils/bid.ts';
import { ReserveBadge } from '../ui/Badge.tsx';

interface BidPanelProps {
  vehicle: Vehicle;
  bidState?: BidState;
  onPlaceBid: (vehicleId: string, amount: number) => void;
}

type FormState = 'idle' | 'success' | 'error';

export function BidPanel({ vehicle, bidState, onPlaceBid }: BidPanelProps) {
  const currentBid = bidState?.current_bid ?? vehicle.current_bid;
  const bidCount = bidState?.bid_count ?? vehicle.bid_count;
  const reserveMet = currentBid >= vehicle.reserve_price;

  const [inputValue, setInputValue] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const minBid = minimumBid(currentBid);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(inputValue.replace(/[^0-9]/g, ''));
    const err = validateBid(amount, currentBid);
    if (err) {
      setErrorMsg(err);
      setFormState('error');
      return;
    }
    onPlaceBid(vehicle.id, amount);
    setFormState('success');
    setInputValue('');
    setErrorMsg('');
    setTimeout(() => setFormState('idle'), 3000);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Current Bid</span>
          <ReserveBadge met={reserveMet} />
        </div>
        <p className="text-3xl font-bold text-slate-900">{formatCurrency(currentBid)}</p>
        <p className="text-xs text-slate-500">
          {bidCount} {bidCount === 1 ? 'bid' : 'bids'} · Starting bid {formatCurrency(vehicle.starting_bid)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500 mb-0.5">Reserve</p>
          <p className="font-semibold text-slate-800">{formatCurrency(vehicle.reserve_price)}</p>
        </div>
        {vehicle.buy_now_price !== null && (
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-600 mb-0.5">Buy Now</p>
            <p className="font-semibold text-blue-800">{formatCurrency(vehicle.buy_now_price)}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">
            Your bid (min. {formatCurrency(minBid)})
          </label>
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <span className="pl-3 text-slate-500 text-sm">$</span>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setFormState('idle');
                setErrorMsg('');
              }}
              min={minBid}
              step={500}
              placeholder={minBid.toString()}
              className="flex-1 px-2 py-2.5 text-sm outline-none bg-transparent"
            />
          </div>
          {formState === 'error' && (
            <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          Place Bid
        </button>

        {formState === 'success' && (
          <p className="text-sm text-emerald-600 text-center font-medium">
            ✓ Bid placed successfully!
          </p>
        )}
      </form>

      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500 font-medium mb-1">Sold by</p>
        <p className="text-sm font-semibold text-slate-800">{vehicle.selling_dealership}</p>
        <p className="text-xs text-slate-500">{vehicle.city}, {vehicle.province}</p>
      </div>
    </div>
  );
}
