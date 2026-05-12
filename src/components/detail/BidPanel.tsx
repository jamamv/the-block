import { useState } from 'react';
import type { Vehicle, BidState } from '../../types/vehicle.ts';
import { formatCurrency } from '../../utils/format.ts';
import { validateBid, minimumBid } from '../../utils/bid.ts';
import { ReserveBadge } from '../ui/Badge.tsx';

interface BidPanelProps {
  vehicle: Vehicle;
  bidState?: BidState;
  onPlaceBid: (vehicleId: string, amount: number) => void;
  onBuyNow: (vehicleId: string, price: number) => void;
  onRetractBid: (vehicleId: string) => void;
}

type BidStep = 'idle' | 'confirm' | 'success' | 'error';
type BuyNowStep = 'idle' | 'confirm' | 'success';

export function BidPanel({ vehicle, bidState, onPlaceBid, onBuyNow, onRetractBid }: BidPanelProps) {
  const boughtNow = bidState?.bought_now === true;
  const currentBid = bidState?.current_bid ?? vehicle.current_bid;
  const bidCount = bidState?.bid_count ?? vehicle.bid_count;
  const reserveMet = currentBid >= vehicle.reserve_price;

  const [inputValue, setInputValue] = useState('');
  const [pendingAmount, setPendingAmount] = useState(0);
  const [bidStep, setBidStep] = useState<BidStep>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [buyNowStep, setBuyNowStep] = useState<BuyNowStep>('idle');
  const [retractConfirm, setRetractConfirm] = useState(false);

  const minBid = minimumBid(currentBid);

  function handleBidSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const amount = Number(inputValue.replace(/[^0-9]/g, ''));
    const err = validateBid(amount, currentBid);
    if (err) {
      setErrorMsg(err);
      setBidStep('error');
      return;
    }
    setPendingAmount(amount);
    setBidStep('confirm');
  }

  function confirmBid() {
    onPlaceBid(vehicle.id, pendingAmount);
    setBidStep('success');
    setInputValue('');
    setTimeout(() => setBidStep('idle'), 3000);
  }

  function cancelBid() {
    setBidStep('idle');
    setPendingAmount(0);
  }

  function confirmBuyNow() {
    onBuyNow(vehicle.id, vehicle.buy_now_price!);
    setBuyNowStep('success');
  }

  if (boughtNow) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center space-y-1">
          <p className="text-emerald-700 font-semibold text-sm">Purchased</p>
          <p className="text-2xl font-bold text-emerald-800">{formatCurrency(currentBid)}</p>
          <p className="text-xs text-emerald-600">You bought this vehicle outright.</p>
        </div>
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Sold by</p>
          <p className="text-sm font-semibold text-slate-800">{vehicle.selling_dealership}</p>
          <p className="text-xs text-slate-500">{vehicle.city}, {vehicle.province}</p>
        </div>
      </div>
    );
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

      <div className="rounded-lg bg-slate-50 p-3 text-sm">
        <p className="text-xs text-slate-500 mb-0.5">Reserve</p>
        <p className="font-semibold text-slate-800">{formatCurrency(vehicle.reserve_price)}</p>
      </div>

      {/* Bid form */}
      {bidStep === 'confirm' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-900">Confirm your bid</p>
          <p className="text-sm text-amber-800">
            Place a bid of <span className="font-bold">{formatCurrency(pendingAmount)}</span> on this vehicle?
          </p>
          <div className="flex gap-2">
            <button
              onClick={confirmBid}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Confirm Bid
            </button>
            <button
              onClick={cancelBid}
              className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : bidStep === 'success' ? (
        <p className="text-sm text-emerald-600 text-center font-medium py-2">
          ✓ Bid of {formatCurrency(pendingAmount)} placed!
        </p>
      ) : (
        <form onSubmit={handleBidSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Your bid
            </label>
            <div className={`flex items-center border rounded-lg overflow-hidden transition-colors ${bidStep === 'error' ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'}`}>
              <span className="pl-3 text-slate-400 text-sm font-medium select-none">$</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9,]*"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setBidStep('idle');
                  setErrorMsg('');
                }}
                placeholder={minBid.toLocaleString('en-CA')}
                className="flex-1 px-2 py-2.5 text-sm outline-none bg-transparent placeholder:text-slate-300 placeholder:font-normal"
              />
            </div>
            <p className={`text-xs mt-1 ${bidStep === 'error' ? 'text-red-600' : 'text-slate-400'}`}>
              {bidStep === 'error' ? errorMsg : `Min. ${formatCurrency(minBid)} · $500 increments`}
            </p>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Place Bid
          </button>
        </form>
      )}

      {/* Buy Now */}
      {vehicle.buy_now_price !== null && (
        <div className="pt-1">
          {buyNowStep === 'confirm' ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-emerald-900">Confirm purchase</p>
              <p className="text-sm text-emerald-800">
                Buy this vehicle now for <span className="font-bold">{formatCurrency(vehicle.buy_now_price)}</span>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={confirmBuyNow}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
                >
                  Confirm Purchase
                </button>
                <button
                  onClick={() => setBuyNowStep('idle')}
                  className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : buyNowStep === 'success' ? (
            <p className="text-sm text-emerald-600 text-center font-medium py-2">
              ✓ Vehicle purchased for {formatCurrency(vehicle.buy_now_price)}!
            </p>
          ) : (
            <button
              onClick={() => setBuyNowStep('confirm')}
              className="w-full py-3 rounded-lg border-2 border-emerald-500 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-colors"
            >
              Buy Now · {formatCurrency(vehicle.buy_now_price)}
            </button>
          )}
        </div>
      )}

      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500 font-medium mb-1">Sold by</p>
        <p className="text-sm font-semibold text-slate-800">{vehicle.selling_dealership}</p>
        <p className="text-xs text-slate-500">{vehicle.city}, {vehicle.province}</p>
      </div>

      {bidState && !boughtNow && (
        <div className="pt-1">
          {retractConfirm ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
              <p className="text-xs text-red-800 font-medium">Retract your bid of {formatCurrency(bidState.current_bid)}?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { onRetractBid(vehicle.id); setRetractConfirm(false); }}
                  className="flex-1 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                >
                  Yes, retract
                </button>
                <button
                  onClick={() => setRetractConfirm(false)}
                  className="flex-1 py-1.5 rounded-md border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setRetractConfirm(true)}
              className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors py-1"
            >
              Retract my bid
            </button>
          )}
        </div>
      )}
    </div>
  );
}
