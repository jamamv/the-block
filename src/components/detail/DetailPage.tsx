import { useParams, Link } from 'react-router-dom';
import type { BidStateMap } from '../../types/vehicle.ts';
import type { AuthUser } from '../../hooks/useAuth.ts';
import { getVehicleById } from '../../data/vehicles.ts';
import { formatLot } from '../../utils/format.ts';
import { TitleBadge, FuelBadge, ConditionBadge } from '../ui/Badge.tsx';
import { AuctionStatusBadge } from '../ui/AuctionStatus.tsx';
import { ImageGallery } from './ImageGallery.tsx';
import { SpecsGrid } from './SpecsGrid.tsx';
import { ConditionPanel } from './ConditionPanel.tsx';
import { BidPanel } from './BidPanel.tsx';
import { useSettings } from '../../contexts/SettingsContext.tsx';
import { useAuctionStatus } from '../../hooks/useAuctionStatus.ts';

interface DetailPageProps {
  bidStateMap: BidStateMap;
  onPlaceBid: (vehicleId: string, amount: number) => void;
  onBuyNow: (vehicleId: string, price: number) => void;
  onRetractBid: (vehicleId: string) => void;
  user: AuthUser | null;
  watchlist: Set<string>;
  onToggleWatch: (id: string) => void;
}

export function DetailPage({ bidStateMap, onPlaceBid, onBuyNow, onRetractBid, user, watchlist, onToggleWatch }: DetailPageProps) {
  const { fmt, t } = useSettings();
  const { id } = useParams<{ id: string }>();
  const vehicle = id ? getVehicleById(id) : undefined;

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">Vehicle not found</p>
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← {t('nav.inventory')}
        </Link>
      </div>
    );
  }

  const bidState = bidStateMap[vehicle.id];
  const isWatched = watchlist.has(vehicle.id);
  const { status: auctionStatus, countdown } = useAuctionStatus(vehicle.auction_start);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="mb-5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          {t('nav.inventory')}
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
          {vehicle.Brand} {vehicle.model} ({vehicle.year})
        </span>
      </nav>

      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {vehicle.Brand} {vehicle.model} {vehicle.trim}{' '}
          <span className="text-slate-400 dark:text-slate-500">({vehicle.year})</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {formatLot(vehicle.lot)} · {vehicle.vin}
        </p>
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <TitleBadge status={vehicle.title_status} />
          <FuelBadge fuel={vehicle.fuel_type} />
          <ConditionBadge grade={vehicle.condition_grade} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <ImageGallery images={vehicle.images} alt={`${vehicle.year} ${vehicle.Brand} ${vehicle.model}`} />

          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Specifications</h2>
            <SpecsGrid vehicle={vehicle} />
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Condition</h2>
            <ConditionPanel vehicle={vehicle} />
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Auction Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t('bid.starting')}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{fmt(vehicle.starting_bid)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t('bid.reserve')}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {vehicle.reserve_price != null ? fmt(vehicle.reserve_price) : t('bid.no_reserve')}
                </p>
              </div>
              {vehicle.buy_now_price !== null && (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t('bid.buy_now')}</p>
                  <p className="font-semibold text-blue-700 dark:text-blue-400">{fmt(vehicle.buy_now_price)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Auction Start</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {new Date(vehicle.auction_start).toLocaleDateString('en-CA', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="md:sticky md:top-20 md:self-start space-y-3">
          <BidPanel
            vehicle={vehicle}
            bidState={bidState}
            auctionStatus={auctionStatus}
            countdown={countdown}
            onPlaceBid={onPlaceBid}
            onBuyNow={onBuyNow}
            onRetractBid={onRetractBid}
            user={user}
          />

          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => onToggleWatch(vehicle.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isWatched
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-red-300 hover:text-red-500'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill={isWatched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isWatched ? 'Saved' : 'Save'}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${vehicle.year} ${vehicle.Brand} ${vehicle.model} — ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1ebe5d] transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t('misc.share')}
              </a>
            </div>

            <AuctionStatusBadge auctionStart={vehicle.auction_start} />
          </div>
        </div>
      </div>
    </div>
  );
}
