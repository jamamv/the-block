import { Link } from 'react-router-dom';
import type { Vehicle, BidState } from '../../types/vehicle.ts';
import { formatCurrency, formatOdometer, formatLot } from '../../utils/format.ts';
import { TitleBadge, FuelBadge } from '../ui/Badge.tsx';
import { AuctionStatusBadge } from '../ui/AuctionStatus.tsx';
import { getPriceLabel, type PriceLabel } from '../../utils/priceInsight.ts';

interface VehicleCardProps {
  vehicle: Vehicle;
  bidState?: BidState;
  isWatched: boolean;
  onToggleWatch: (id: string) => void;
  isInCompare: boolean;
  canAddToCompare: boolean;
  onToggleCompare: (id: string) => void;
}

const PRICE_BADGE: Record<PriceLabel, { text: string; className: string }> = {
  'great-deal': { text: '↓ Great Deal',  className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  'fair-price': { text: 'Fair Price',    className: 'bg-slate-100 text-slate-500' },
  'high-bid':   { text: '↑ High Bid',   className: 'bg-amber-50 text-amber-700 border border-amber-200' },
};

function StarRating({ grade }: { grade: number }) {
  const filled = Math.round(grade);
  const color = grade >= 4 ? 'text-emerald-500' : grade >= 3 ? 'text-amber-500' : 'text-red-400';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < filled ? color : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className={`text-xs font-semibold ml-1 ${color}`}>{grade.toFixed(1)}</span>
    </div>
  );
}

export function VehicleCard({ vehicle, bidState, isWatched, onToggleWatch, isInCompare, canAddToCompare, onToggleCompare }: VehicleCardProps) {
  const currentBid = bidState?.current_bid ?? vehicle.current_bid;
  const bidCount = bidState?.bid_count ?? vehicle.bid_count;
  const reserveMet = currentBid != null && currentBid >= vehicle.reserve_price;
  const priceLabel = getPriceLabel({ ...vehicle, current_bid: currentBid ?? vehicle.current_bid });
  const priceBadge = priceLabel && priceLabel !== 'fair-price' ? PRICE_BADGE[priceLabel] : null;

  return (
    <div className={`group flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-150 ${isInCompare ? 'border-blue-500 ring-2 ring-blue-400' : 'border-slate-200 hover:border-blue-300'}`}>
      <Link to={`/vehicle/${vehicle.id}`} className="flex flex-col flex-1">
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <img
            src={vehicle.images[0]}
            alt={`${vehicle.year} ${vehicle.Brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />

          {/* Gradients for badge legibility */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          {/* Title + fuel badges — top left */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <TitleBadge status={vehicle.title_status} />
            <FuelBadge fuel={vehicle.fuel_type} />
          </div>

          {/* Watch button — top right */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWatch(vehicle.id); }}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${isWatched ? 'bg-white shadow-sm' : 'bg-black/40 hover:bg-black/60'}`}
            aria-label={isWatched ? 'Remove from watchlist' : 'Save to watchlist'}
          >
            <svg className={`w-4 h-4 transition-colors ${isWatched ? 'text-red-500' : 'text-white'}`} fill={isWatched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Auction status — bottom left */}
          <div className="absolute bottom-2.5 left-2.5">
            <AuctionStatusBadge auctionStart={vehicle.auction_start} showCountdown={false} />
          </div>

          {/* Lot number — bottom right */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-md tracking-wide">
            {formatLot(vehicle.lot)}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
              {vehicle.Brand} {vehicle.model} <span className="text-slate-400">({vehicle.year})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{vehicle.trim} · {formatOdometer(vehicle.odometer_km)}</p>
          </div>

          <StarRating grade={vehicle.condition_grade} />

          <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500">
                {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
                {reserveMet && <span className="ml-1 text-emerald-600 font-medium">· Reserve Met</span>}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xl font-bold text-slate-900 leading-tight">
                  {currentBid != null ? formatCurrency(currentBid) : '—'}
                </p>
                {priceBadge && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${priceBadge.className}`}>
                    {priceBadge.text}
                  </span>
                )}
              </div>
            </div>
            {vehicle.buy_now_price !== null && (
              <div className="text-right">
                <p className="text-xs text-slate-400">Buy Now</p>
                <p className="text-sm font-semibold text-blue-700">{formatCurrency(vehicle.buy_now_price)}</p>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Compare button — outside Link so click doesn't navigate */}
      <div className="px-4 pb-3 pt-0">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCompare(vehicle.id); }}
          disabled={!isInCompare && !canAddToCompare}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isInCompare
              ? 'bg-blue-600 text-white border-blue-600'
              : canAddToCompare
              ? 'text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
              : 'text-slate-300 border-slate-100 cursor-not-allowed'
          }`}
        >
          {isInCompare ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Selected
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Compare
            </>
          )}
        </button>
      </div>
    </div>
  );
}
