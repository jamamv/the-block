import { Link } from 'react-router-dom';
import type { Vehicle, BidState } from '../../types/vehicle.ts';
import { formatOdometer, formatLot } from '../../utils/format.ts';
import { TitleBadge, FuelBadge } from '../ui/Badge.tsx';
import { AuctionStatusBadge } from '../ui/AuctionStatus.tsx';
import { getPriceLabel, type PriceLabel } from '../../utils/priceInsight.ts';
import { useSettings } from '../../contexts/SettingsContext.tsx';

interface VehicleCardProps {
  vehicle: Vehicle;
  bidState?: BidState;
  isWatched: boolean;
  onToggleWatch: (id: string) => void;
  isInCompare: boolean;
  canAddToCompare: boolean;
  onToggleCompare: (id: string) => void;
}

const PRICE_BADGE: Record<PriceLabel, { textKey: 'sort.bid_desc' | 'sort.bid_asc'; prefix: string; className: string }> = {
  'great-deal': { textKey: 'sort.bid_asc', prefix: '↓ ', className: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' },
  'fair-price': { textKey: 'sort.bid_desc', prefix: '', className: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400' },
  'high-bid':   { textKey: 'sort.bid_desc', prefix: '↑ ', className: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' },
};

const PRICE_BADGE_TEXT: Record<PriceLabel, string> = {
  'great-deal': '↓ Great Deal',
  'fair-price': 'Fair Price',
  'high-bid':   '↑ High Bid',
};

function ConditionBar({ grade }: { grade: number }) {
  const barColor = grade >= 4 ? 'bg-emerald-500' : grade >= 3 ? 'bg-amber-400' : 'bg-red-400';
  const textColor = grade >= 4 ? 'text-emerald-600 dark:text-emerald-400' : grade >= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap">Condition</span>
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${(grade / 5) * 100}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${textColor}`}>{grade.toFixed(1)}<span className="text-slate-300 dark:text-slate-600 font-normal">/5</span></span>
    </div>
  );
}

export function VehicleCard({ vehicle, bidState, isWatched, onToggleWatch, isInCompare, canAddToCompare, onToggleCompare }: VehicleCardProps) {
  const { fmt, t } = useSettings();
  const currentBid = bidState?.current_bid ?? vehicle.current_bid;
  const bidCount = bidState?.bid_count ?? vehicle.bid_count;
  const reserveMet = currentBid != null && vehicle.reserve_price != null && currentBid >= vehicle.reserve_price;
  const priceLabel = getPriceLabel({ ...vehicle, current_bid: currentBid ?? null });
  const priceBadge = priceLabel && priceLabel !== 'fair-price' ? PRICE_BADGE[priceLabel] : null;
  const priceBadgeText = priceLabel && priceLabel !== 'fair-price' ? PRICE_BADGE_TEXT[priceLabel] : null;

  return (
    <div className={`group flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-150 ${isInCompare ? 'border-blue-500 ring-2 ring-blue-400' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'}`}>
      <Link to={`/vehicle/${vehicle.id}`} className="flex flex-col flex-1">
        <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900 overflow-hidden">
          <img
            src={vehicle.images[0]}
            alt={`${vehicle.year} ${vehicle.Brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />

          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <TitleBadge status={vehicle.title_status} />
            <FuelBadge fuel={vehicle.fuel_type} />
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWatch(vehicle.id); }}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${isWatched ? 'bg-white shadow-sm' : 'bg-black/40 hover:bg-black/60'}`}
            aria-label={isWatched ? t('card.remove_watch') : t('card.save_watch')}
          >
            <svg className={`w-4 h-4 transition-colors ${isWatched ? 'text-red-500' : 'text-white'}`} fill={isWatched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <div className="absolute bottom-2.5 left-2.5">
            <AuctionStatusBadge auctionStart={vehicle.auction_start} showCountdown={false} />
          </div>

          <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-md tracking-wide">
            {formatLot(vehicle.lot)}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
              {vehicle.Brand} {vehicle.model} <span className="text-slate-400 dark:text-slate-500">({vehicle.year})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{vehicle.trim} · {formatOdometer(vehicle.odometer_km)}</p>
          </div>

          <ConditionBar grade={vehicle.condition_grade} />

          <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentBid != null
                  ? <>{bidCount} {bidCount === 1 ? t('misc.bid') : t('misc.bids')}{reserveMet && <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-medium">· {t('misc.reserve_met')}</span>}</>
                  : t('card.starting_at')
                }
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {fmt(currentBid ?? vehicle.starting_bid)}
                </p>
                {priceBadge && priceBadgeText && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${priceBadge.className}`}>
                    {priceBadgeText}
                  </span>
                )}
              </div>
            </div>
            {vehicle.buy_now_price !== null && (
              <div className="text-right">
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('bid.buy_now')}</p>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">{fmt(vehicle.buy_now_price)}</p>
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-3 pt-0">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCompare(vehicle.id); }}
          disabled={!isInCompare && !canAddToCompare}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isInCompare
              ? 'bg-blue-600 text-white border-blue-600'
              : canAddToCompare
              ? 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              : 'text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-700 cursor-not-allowed'
          }`}
        >
          {isInCompare ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {t('misc.selected')}
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              {t('misc.compare')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
