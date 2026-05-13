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

/* ── UserMenu ───────────────────────────────────────────────────────── */

function UserMenu({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
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
        <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all">
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
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
          </div>
          <div className="p-1.5">
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
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
  const hasLive = useHasLiveAuctions();
  const bidCount = Object.keys(bidStateMap).length;
  const savedCount = watchlist.size;
  const notifications = useNotifications(bidStateMap, watchlist);
  const navigate = useNavigate();
  const location = useLocation();

  const pageCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-slate-900 bg-slate-100'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`;

  const savedActive = location.pathname === '/' && new URLSearchParams(location.search).get('saved') === '1';

  function goToSaved() {
    navigate(savedActive ? '/' : '/?saved=1');
  }

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-[0_1px_0_0_#f1f5f9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-1">
          <span className="text-[15px] font-bold text-slate-900 tracking-tight">The Block</span>
          <span className="hidden lg:block text-xs text-slate-300 font-medium">by OPENLANE</span>
        </Link>

        {/* Divider */}
        <span className="hidden sm:block w-px h-4 bg-slate-200 flex-shrink-0" />

        {/* Page nav — desktop */}
        <nav className="hidden sm:flex items-center gap-0.5 flex-shrink-0">
          <NavLink to="/" end className={pageCls}>Inventory</NavLink>
          <NavLink to="/submit" className={pageCls}>List a Car</NavLink>
        </nav>

        {/* Spacer pushes right cluster to the right */}
        <div className="flex-1" />

        {/* Personal nav — desktop */}
        <div className="hidden sm:flex items-center gap-0.5">

          {/* Saved */}
          <button
            onClick={goToSaved}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              savedActive
                ? 'text-red-600 bg-red-50'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            aria-label="Saved vehicles"
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
            <span className="hidden md:block">Saved</span>
            {savedCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none tabular-nums ${
                savedActive ? 'bg-red-200 text-red-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {savedCount}
              </span>
            )}
          </button>

          {/* My Bids */}
          {(() => {
            const bidsActive = location.pathname === '/bids';
            return (
              <button
                onClick={() => navigate(bidsActive ? '/' : '/bids')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  bidsActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="hidden md:block">My Bids</span>
                {bidCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none tabular-nums ${bidsActive ? 'bg-blue-200 text-blue-700' : 'bg-blue-600 text-white'}`}>
                    {bidCount}
                  </span>
                )}
              </button>
            );
          })()}
        </div>

        {/* Divider */}
        <span className="hidden sm:block w-px h-4 bg-slate-200 flex-shrink-0" />

        {/* Utility */}
        <div className="flex items-center gap-1.5">
          {hasLive && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold tracking-wide flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
              Live
            </span>
          )}
          <NotificationBell notifications={notifications} />
        </div>

        {/* Divider */}
        <span className="w-px h-4 bg-slate-200 flex-shrink-0" />

        {/* Account */}
        {user ? (
          <UserMenu user={user} onLogout={onLogout} />
        ) : (
          <Link
            to="/login"
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign in
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
  const tabCls = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
      active ? 'text-blue-600' : 'text-slate-400'
    }`;

  return (
    <nav className="fixed bottom-0 inset-x-0 sm:hidden bg-white border-t border-slate-100 shadow-[0_-1px_12px_0_rgba(0,0,0,0.06)] z-30">
      <div className="grid grid-cols-4 h-16 px-1 safe-pb">

        <NavLink to="/" end className={({ isActive }) => tabCls(isActive && !savedActive)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Inventory
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
          Saved
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
          Bids
        </button>

        <NavLink to="/submit" className={({ isActive }) => tabCls(isActive)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          List Car
        </NavLink>

      </div>
    </nav>
  );
}

/* ── App ────────────────────────────────────────────────────────────── */

export default function App() {
  const { bidStateMap, placeBid, buyNow, retractBid } = useBidState();
  const { user, loading, login, register, loginAsGuest, logout } = useAuth();
  const { watchlist, toggleWatch } = useWatchlist();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-slate-400">Loading…</span>
      </div>
    );
  }

  return (
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
    <div className="min-h-screen flex flex-col">
      <Header
        bidStateMap={bidStateMap}
        watchlist={watchlist}
        user={user}
        onLogout={logout}
      />

      {/* Bottom nav needs its own padding on mobile */}
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
