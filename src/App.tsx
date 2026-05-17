import { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useBidState } from './hooks/useBidState.ts';
import { useAuth } from './hooks/useAuth.ts';
import { useWatchlist } from './hooks/useWatchlist.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { InventoryPage } from './components/inventory/InventoryPage.tsx';
import { DetailPage } from './components/detail/DetailPage.tsx';
import { SubmitPage } from './components/submit/SubmitPage.tsx';
import { BidsPage } from './components/bids/BidsPage.tsx';
import { NotificationBell } from './components/ui/NotificationBell.tsx';
import { LoginPage } from './components/auth/LoginPage.tsx';
import { RegisterPage } from './components/auth/RegisterPage.tsx';
import { vehicles } from './data/vehicles.ts';
import { getNormalizedAuctionStart, getAuctionStatus } from './utils/auction.ts';
import type { BidStateMap } from './types/vehicle.ts';
import type { AuthUser } from './hooks/useAuth.ts';
import { SettingsProvider, useSettings } from './contexts/SettingsContext.tsx';

/* ── hooks ─────────────────────────────────────────────────────────── */

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

/* ── SettingsPopover ─────────────────────────────────────────────────── */

function SettingsPopover() {
  const { darkMode, currency, locale, toggleDark, setCurrency, setLocale, t } = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${open ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
        aria-label="Settings"
      >
        <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden p-3 space-y-3">
          {/* Dark mode */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t('settings.appearance')}</p>
            <button
              onClick={toggleDark}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                {t('settings.dark')}
              </span>
              <div className={`relative w-8 h-4.5 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`} style={{ height: '18px', width: '32px' }}>
                <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          {/* Currency */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t('settings.currency')}</p>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
              <button onClick={() => setCurrency('CAD')} className={`flex-1 py-1 rounded-md text-xs font-semibold transition-colors ${currency === 'CAD' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>CAD</button>
              <button onClick={() => setCurrency('USD')} className={`flex-1 py-1 rounded-md text-xs font-semibold transition-colors ${currency === 'USD' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>USD</button>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          {/* Language */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t('settings.language')}</p>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
              <button onClick={() => setLocale('en')} className={`flex-1 py-1 rounded-md text-xs font-semibold transition-colors ${locale === 'en' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>EN</button>
              <button onClick={() => setLocale('fr')} className={`flex-1 py-1 rounded-md text-xs font-semibold transition-colors ${locale === 'fr' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>FR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── UserMenu ───────────────────────────────────────────────────────── */

function UserMenu({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const { t } = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const initials = user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 focus:outline-none group"
        aria-label="Account menu"
      >
        <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ring-2 ring-blue-100 dark:ring-blue-900 group-hover:ring-blue-200 transition-all">
          {initials}
        </span>
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform hidden sm:block ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
          </div>
          <div className="p-1.5">
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('nav.sign_out')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Header ─────────────────────────────────────────────────────────── */

function Header({
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

/* ── Mobile bottom tab bar ──────────────────────────────────────────── */

function BottomNav({
  bidCount,
  savedCount,
  savedActive,
  bidsActive,
  onToggleSaved,
  onToggleBids,
}: {
  bidCount: number;
  savedCount: number;
  savedActive: boolean;
  bidsActive: boolean;
  onToggleSaved: () => void;
  onToggleBids: () => void;
}) {
  const { t } = useSettings();
  const tabCls = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
      active ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'
    }`;

  return (
    <nav className="fixed bottom-0 inset-x-0 sm:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-[0_-1px_12px_0_rgba(0,0,0,0.06)] z-30">
      <div className="grid grid-cols-4 h-16 px-1 safe-pb">

        <NavLink to="/" end className={({ isActive }) => tabCls(isActive && !savedActive)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          {t('nav.inventory_tab')}
        </NavLink>

        <button onClick={onToggleSaved} className={tabCls(savedActive)}>
          <span className="relative">
            <svg
              className="w-5 h-5"
              fill={savedActive ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </span>
          {t('nav.saved_tab')}
        </button>

        <button onClick={onToggleBids} className={tabCls(bidsActive)}>
          <span className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {bidCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                {bidCount > 9 ? '9+' : bidCount}
              </span>
            )}
          </span>
          {t('nav.bids_tab')}
        </button>

        <NavLink to="/submit" className={({ isActive }) => tabCls(isActive)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('nav.list_tab')}
        </NavLink>

      </div>
    </nav>
  );
}

/* ── App ────────────────────────────────────────────────────────────── */

export default function App() {
  const { user, loading, login, register, loginAsGuest, logout } = useAuth();
  const { bidStateMap, placeBid, buyNow, retractBid } = useBidState(user);
  const { watchlist, toggleWatch } = useWatchlist(user);

  if (loading) {
    return (
      <SettingsProvider>
        <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] dark:bg-slate-900">
          <span className="text-sm text-slate-400">Loading…</span>
        </div>
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppShell
          bidStateMap={bidStateMap}
          watchlist={watchlist}
          toggleWatch={toggleWatch}
          placeBid={placeBid}
          buyNow={buyNow}
          retractBid={retractBid}
          user={user}
          login={login}
          register={register}
          loginAsGuest={loginAsGuest}
          logout={logout}
        />
      </BrowserRouter>
    </SettingsProvider>
  );
}

function AppShell({
  bidStateMap, watchlist, toggleWatch,
  placeBid, buyNow, retractBid,
  user, login, register, loginAsGuest, logout,
}: {
  bidStateMap: BidStateMap;
  watchlist: Set<string>;
  toggleWatch: (id: string) => void;
  placeBid: (vehicleId: string, amount: number) => void;
  buyNow: (vehicleId: string, price: number) => void;
  retractBid: (vehicleId: string) => void;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  loginAsGuest: () => void;
  logout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const bidCount = Object.keys(bidStateMap).length;
  const savedCount = watchlist.size;
  const savedActive = location.pathname === '/' && new URLSearchParams(location.search).get('saved') === '1';
  const bidsActive = location.pathname === '/bids';

  function toggleSaved() {
    navigate(savedActive ? '/' : '/?saved=1');
  }

  function toggleBids() {
    navigate(bidsActive ? '/' : '/bids');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F7] dark:bg-slate-900 transition-colors">
      <Header
        bidStateMap={bidStateMap}
        watchlist={watchlist}
        user={user}
        onLogout={logout}
      />

      <main className="flex-1 pb-16 sm:pb-0">
        <Routes>
          <Route path="/" element={
            <InventoryPage
              bidStateMap={bidStateMap}
              watchlist={watchlist}
              toggleWatch={toggleWatch}
            />
          } />
          <Route path="/vehicle/:id" element={
            <DetailPage
              bidStateMap={bidStateMap}
              onPlaceBid={placeBid}
              onBuyNow={buyNow}
              onRetractBid={retractBid}
              user={user}
              watchlist={watchlist}
              onToggleWatch={toggleWatch}
            />
          } />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/bids" element={
            <BidsPage bidStateMap={bidStateMap} onRetractBid={retractBid} />
          } />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={login} onGuest={loginAsGuest} />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage onRegister={register} />} />
        </Routes>
      </main>

      <footer className="hidden sm:block border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">The Block</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <a
              href="https://www.openlane.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              OPENLANE
            </a>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} The Block. Built for the OPENLANE coding challenge.
          </p>
        </div>
      </footer>

      <BottomNav
        bidCount={bidCount}
        savedCount={savedCount}
        savedActive={savedActive}
        bidsActive={bidsActive}
        onToggleSaved={toggleSaved}
        onToggleBids={toggleBids}
      />
    </div>
  );
}
