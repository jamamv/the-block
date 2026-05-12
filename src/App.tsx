import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useBidState } from './hooks/useBidState.ts';
import { InventoryPage } from './components/inventory/InventoryPage.tsx';
import { DetailPage } from './components/detail/DetailPage.tsx';
import { MyBidsPanel } from './components/ui/MyBidsPanel.tsx';
import type { BidStateMap } from './types/vehicle.ts';

function Header({ bidStateMap }: { bidStateMap: BidStateMap }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const bidCount = Object.keys(bidStateMap).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900 tracking-tight">
            The Block
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:block">
            by OPENLANE
          </span>
        </Link>
        <div className="flex items-center gap-3 relative">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live Auction
          </span>
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
          {panelOpen && (
            <MyBidsPanel
              bidStateMap={bidStateMap}
              onClose={() => setPanelOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const { bidStateMap, placeBid, buyNow } = useBidState();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header bidStateMap={bidStateMap} />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<InventoryPage bidStateMap={bidStateMap} />}
            />
            <Route
              path="/vehicle/:id"
              element={
                <DetailPage bidStateMap={bidStateMap} onPlaceBid={placeBid} onBuyNow={buyNow} />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
