import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useBidState } from './hooks/useBidState.ts';
import { InventoryPage } from './components/inventory/InventoryPage.tsx';
import { DetailPage } from './components/detail/DetailPage.tsx';

function Header() {
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
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live Auction
          </span>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const { bidStateMap, placeBid } = useBidState();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<InventoryPage bidStateMap={bidStateMap} />}
            />
            <Route
              path="/vehicle/:id"
              element={
                <DetailPage bidStateMap={bidStateMap} onPlaceBid={placeBid} />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
