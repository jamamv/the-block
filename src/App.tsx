import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useBidState } from './hooks/useBidState.ts';
import { useAuth } from './hooks/useAuth.ts';
import { useWatchlist } from './hooks/useWatchlist.ts';
import { InventoryPage } from './components/inventory/InventoryPage.tsx';
import { DetailPage } from './components/detail/DetailPage.tsx';
import { SubmitPage } from './components/submit/SubmitPage.tsx';
import { BidsPage } from './components/bids/BidsPage.tsx';
import { LoginPage } from './components/auth/LoginPage.tsx';
import { RegisterPage } from './components/auth/RegisterPage.tsx';
import type { BidStateMap } from './types/vehicle.ts';
import type { AuthUser } from './hooks/useAuth.ts';
import { SettingsProvider } from './contexts/SettingsContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { BottomNav } from './components/layout/BottomNav.tsx';
import { LoadingScreen } from './components/layout/LoadingScreen.tsx';
import { WelcomeModal } from './components/layout/WelcomeModal.tsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const { user, loading, login, register, loginAsGuest, logout } = useAuth();
  const { bidStateMap, placeBid, buyNow, retractBid } = useBidState(user);
  const { watchlist, toggleWatch } = useWatchlist(user);

  if (loading) {
    return (
      <SettingsProvider>
        <LoadingScreen />
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
      <ScrollToTop />
      <WelcomeModal user={user} />
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
