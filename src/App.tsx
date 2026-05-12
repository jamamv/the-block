import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useBidState } from './hooks/useBidState.ts';
import { useAuth } from './hooks/useAuth.ts';
import { InventoryPage } from './components/inventory/InventoryPage.tsx';
import { DetailPage } from './components/detail/DetailPage.tsx';
import { MyBidsPanel } from './components/ui/MyBidsPanel.tsx';
import { LoginPage } from './components/auth/LoginPage.tsx';
import { RegisterPage } from './components/auth/RegisterPage.tsx';
import { vehicles } from './data/vehicles.ts';
import { getNormalizedAuctionStart, getAuctionStatus } from './utils/auction.ts';
import type { BidStateMap } from './types/vehicle.ts';
import type { AuthUser } from './hooks/useAuth.ts';

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

function Header({
  bidStateMap,
  onRetractBid,
  user,
  onLogout,
}: {
  bidStateMap: BidStateMap;
  onRetractBid: (id: string) => void;
  user: AuthUser | null;
  onLogout: () => void;
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const hasLive = useHasLiveAuctions();
  const bidCount = Object.keys(bidStateMap).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900 tracking-tight">The Block</span>
          <span className="text-xs text-slate-400 font-medium hidden sm:block">by OPENLANE</span>
        </Link>

        <div className="flex items-center gap-3 relative">
          {hasLive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Live Auction
            </span>
          )}

          {user ? (
            <>
              <button
                onClick={() => setPanelOpen((v) => !v)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
              >
                My Bids
                {bidCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {bidCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className="text-sm text-slate-700 font-medium hidden sm:block truncate max-w-[120px]">
                  {user.name}
                </span>
                <button
                  onClick={onLogout}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign in
            </Link>
          )}

          {panelOpen && user && (
            <MyBidsPanel
              bidStateMap={bidStateMap}
              onClose={() => setPanelOpen(false)}
              onRetractBid={onRetractBid}
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const { bidStateMap, placeBid, buyNow, retractBid } = useBidState();
  const { user, loading, login, register, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-slate-400">Loading…</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header
          bidStateMap={bidStateMap}
          onRetractBid={retractBid}
          user={user}
          onLogout={logout}
        />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<InventoryPage bidStateMap={bidStateMap} />} />
            <Route
              path="/vehicle/:id"
              element={
                <DetailPage
                  bidStateMap={bidStateMap}
                  onPlaceBid={placeBid}
                  onBuyNow={buyNow}
                  onRetractBid={retractBid}
                  user={user}
                />
              }
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={login} />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" replace /> : <RegisterPage onRegister={register} />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
