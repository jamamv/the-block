import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Vehicle, BidState } from '../../types/vehicle.ts';
import type { AuthUser } from '../../hooks/useAuth.ts';
import { formatCurrency } from '../../utils/format.ts';
import { validateBid, minimumBid } from '../../utils/bid.ts';
import { ReserveBadge } from '../ui/Badge.tsx';
import { useFollowedDealers } from '../../hooks/useFollowedDealers.ts';
import { VERIFIED_DEALERS } from '../../data/vehicles.ts';

interface BidPanelProps {
  vehicle: Vehicle;
  bidState?: BidState;
  onPlaceBid: (vehicleId: string, amount: number) => void;
  onBuyNow: (vehicleId: string, price: number) => void;
  onRetractBid: (vehicleId: string) => void;
  user: AuthUser | null;
}

type BidStep = 'idle' | 'confirm' | 'success' | 'error';
type BuyNowStep = 'idle' | 'confirm' | 'success';

export function BidPanel({ vehicle, bidState, onPlaceBid, onBuyNow, onRetractBid, user }: BidPanelProps) {
  const location = useLocation();
  const { followedDealers, toggleFollow } = useFollowedDealers();
  const isVerified = VERIFIED_DEALERS.has(vehicle.selling_dealership);
  const isFollowing = followedDealers.has(vehicle.selling_dealership);
  const boughtNow = bidState?.bought_now === true;
  const currentBid = bidState?.current_bid ?? vehicle.current_bid;
  const bidCount = bidState?.bid_count ?? vehicle.bid_count;
  const reserveMet = currentBid != null && vehicle.reserve_price != null && currentBid >= vehicle.reserve_price;

  const [inputValue, setInputValue] = useState('');
  const [pendingAmount, setPendingAmount] = useState(0);
  const [bidStep, setBidStep] = useState<BidStep>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [buyNowStep, setBuyNowStep] = useState<BuyNowStep>('idle');
  const [retractConfirm, setRetractConfirm] = useState(false);

  const minBid = currentBid != null ? minimumBid(currentBid) : vehicle.starting_bid;

  function handleBidSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const amount = Number(inputValue.replace(/[^0-9]/g, ''));
    const err = validateBid(amount, currentBid ?? 0);
    if (err) { setErrorMsg(err); setBidStep('error'); return; }
    setPendingAmount(amount);
    setBidStep('confirm');
  }

  function confirmBid() {
    onPlaceBid(vehicle.id, pendingAmount);
    setBidStep('success');
    setInputValue('');
    setTimeout(() => setBidStep('idle'), 3000);
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
          <p className="text-2xl font-bold text-emerald-800">{currentBid != null ? formatCurrency(currentBid) : '—'}</p>
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

  const returnPath = encodeURIComponent(location.pathname);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
      {/* Current bid */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Current Bid</span>
          <ReserveBadge met={reserveMet} />
        </div>
        {currentBid != null
          ? <p className="text-3xl font-bold text-slate-900">{formatCurrency(currentBid)}</p>
          : <p className="text-2xl font-semibold text-slate-400">No bids yet</p>
        }
        <p className="text-xs text-slate-500">
          {bidCount} {bidCount === 1 ? 'bid' : 'bids'} · Starting bid {formatCurrency(vehicle.starting_bid)}
        </p>
      </div>

      {/* Reserve */}
      <div className="rounded-lg bg-slate-50 p-3 text-sm">
        <p className="text-xs text-slate-500 mb-0.5">Reserve</p>
        <p className="font-semibold text-slate-800">{vehicle.reserve_price != null ? formatCurrency(vehicle.reserve_price) : 'No reserve'}</p>
      </div>

      {/* Auth wall — shown when not signed in */}
      {!user && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center space-y-3">
          <p className="text-sm font-medium text-slate-700">Sign in to place bids</p>
          <p className="text-xs text-slate-500">Create a free account to start bidding on vehicles.</p>
          <div className="flex gap-2">
            <Link
              to={`/login?return=${returnPath}`}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to={`/register?return=${returnPath}`}
              className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-white transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Bid form — only when signed in */}
      {user && (
        bidStep === 'confirm' ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-900">Confirm your bid</p>
            <p className="text-sm text-amber-800">
              Place a bid of <span className="font-bold">{formatCurrency(pendingAmount)}</span> on this vehicle?
            </p>
            <div className="flex gap-2">
              <button onClick={confirmBid} className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
                Confirm Bid
              </button>
              <button onClick={() => { setBidStep('idle'); setPendingAmount(0); }} className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">
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
              <label className="text-xs font-medium text-slate-600 block mb-1">Your bid</label>
              <div className={`flex items-center border rounded-lg overflow-hidden transition-colors ${bidStep === 'error' ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'}`}>
                <span className="pl-3 text-slate-400 text-sm font-medium select-none">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9,]*"
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setBidStep('idle'); setErrorMsg(''); }}
                  placeholder={minBid.toLocaleString('en-CA')}
                  className="flex-1 px-2 py-2.5 text-sm outline-none bg-transparent placeholder:text-slate-300 placeholder:font-normal"
                />
              </div>
              <p className={`text-xs mt-1 ${bidStep === 'error' ? 'text-red-600' : 'text-slate-400'}`}>
                {bidStep === 'error' ? errorMsg : `Min. ${formatCurrency(minBid)} · $500 increments`}
              </p>
            </div>
            <button type="submit" className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors">
              Place Bid
            </button>
          </form>
        )
      )}

      {/* Buy Now — only when signed in */}
      {user && vehicle.buy_now_price !== null && (
        <div className="pt-1">
          {buyNowStep === 'confirm' ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-emerald-900">Confirm purchase</p>
              <p className="text-sm text-emerald-800">
                Buy this vehicle now for <span className="font-bold">{formatCurrency(vehicle.buy_now_price)}</span>?
              </p>
              <div className="flex gap-2">
                <button onClick={confirmBuyNow} className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors">
                  Confirm Purchase
                </button>
                <button onClick={() => setBuyNowStep('idle')} className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : buyNowStep === 'success' ? (
            <p className="text-sm text-emerald-600 text-center font-medium py-2">
              ✓ Vehicle purchased for {formatCurrency(vehicle.buy_now_price)}!
            </p>
          ) : (
            <button onClick={() => setBuyNowStep('confirm')} className="w-full py-3 rounded-lg border-2 border-emerald-500 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-colors">
              Buy Now · {formatCurrency(vehicle.buy_now_price)}
            </button>
          )}
        </div>
      )}

      {/* Dealer */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500 font-medium mb-1.5">Sold by</p>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold text-slate-800">{vehicle.selling_dealership}</p>
              {isVerified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{vehicle.city}, {vehicle.province}</p>
          </div>
          <button
            onClick={() => toggleFollow(vehicle.selling_dealership)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              isFollowing
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-300 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {/* Retract — only when signed in and has an active bid */}
      {user && bidState && !boughtNow && (
        <div className="pt-1">
          {retractConfirm ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
              <p className="text-xs text-red-800 font-medium">Retract your bid of {formatCurrency(bidState.current_bid)}?</p>
              <div className="flex gap-2">
                <button onClick={() => { onRetractBid(vehicle.id); setRetractConfirm(false); }} className="flex-1 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
                  Yes, retract
                </button>
                <button onClick={() => setRetractConfirm(false)} className="flex-1 py-1.5 rounded-md border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setRetractConfirm(true)} className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors py-1">
              Retract my bid
            </button>
          )}
        </div>
      )}
    </div>
  );
}
