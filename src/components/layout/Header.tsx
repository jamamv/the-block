import { useState, useEffect, useMemo } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { NotificationBell } from '../ui/NotificationBell.tsx';
import { vehicles } from '../../data/vehicles.ts';
import { getNormalizedAuctionStart, getAuctionStatus } from '../../utils/auction.ts';
import type { BidStateMap } from '../../types/vehicle.ts';
import type { AuthUser } from '../../hooks/useAuth.ts';
import { useSettings } from '../../contexts/SettingsContext.tsx';
import { SettingsPopover } from './SettingsPopover.tsx';
import { UserMenu } from './UserMenu.tsx';

function useHasLiveAuctions(): boolean {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  return useMemo(
    () => vehicles.some((v) => {
      const s = getAuctionStatus(getNormalizedAuctionStart(v.auction_start), now);
      return s === 'live' || s === 'ending-soon';
    }),
    [now],
  );
}

export function Header({
  bidStateMap,
  watchlist,
  user,
  onLogout,
}: {
  bidStateMap: BidStateMap;
  watchlist: Set<string>;
  user: AuthUser | null;
  onLogout: () => void;
}) {
  const { t } = useSettings();
  const hasLive = useHasLiveAuctions();
  const bidCount = Object.keys(bidStateMap).length;
  const savedCount = watchlist.size;
  const notifications = useNotifications(bidStateMap, watchlist);
  const navigate = useNavigate();
  const location = useLocation();

  const pageCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
    }`;

  const savedActive = location.pathname === '/' && new URLSearchParams(location.search).get('saved') === '1';

  function goToSaved() {
    navigate(savedActive ? '/' : '/?saved=1');
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20 shadow-[0_1px_0_0_#f1f5f9] dark:shadow-[0_1px_0_0_#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">

        <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-1">
          <span className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">The Block</span>
          <a
            href="https://www.openlane.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-slate-300 dark:text-slate-600 font-medium hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
          >by OPENLANE</a>
        </Link>

        <span className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

        <nav className="hidden sm:flex items-center gap-0.5 flex-shrink-0">
          <NavLink to="/" end className={pageCls}>{t('nav.inventory')}</NavLink>
          <NavLink to="/submit" className={pageCls}>{t('nav.list_car')}</NavLink>
        </nav>

        <div className="flex-1" />

        <div className="hidden sm:flex items-center gap-0.5">
          <button
            onClick={goToSaved}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              savedActive
                ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            aria-label={t('nav.saved')}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill={savedActive ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="hidden md:block">{t('nav.saved')}</span>
            {savedCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none tabular-nums ${
                savedActive ? 'bg-red-200 text-red-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {savedCount}
              </span>
            )}
          </button>

          {(() => {
            const bidsActive = location.pathname === '/bids';
            return (
              <button
                onClick={() => navigate(bidsActive ? '/' : '/bids')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  bidsActive
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="hidden md:block">{t('nav.my_bids')}</span>
                {bidCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none tabular-nums ${bidsActive ? 'bg-blue-200 text-blue-700' : 'bg-blue-600 text-white'}`}>
                    {bidCount}
                  </span>
                )}
              </button>
            );
          })()}
        </div>

        <span className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

        <div className="flex items-center gap-1.5">
          {hasLive && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold tracking-wide flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
              {t('status.live')}
            </span>
          )}
          <NotificationBell notifications={notifications} />
          <SettingsPopover />
        </div>

        <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

        {user ? (
          <UserMenu user={user} onLogout={onLogout} />
        ) : (
          <Link
            to="/login"
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('nav.sign_in')}
          </Link>
        )}
      </div>
    </header>
  );
}
