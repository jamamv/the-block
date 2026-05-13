import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { AuctionNotification } from '../../hooks/useNotifications.ts';

interface NotificationBellProps {
  notifications: AuctionNotification[];
}

const TYPE_META = {
  'bid-ending':       { dot: 'bg-red-500',    label: 'Your bid' },
  'watchlist-live':   { dot: 'bg-red-500',    label: 'Saved · Live' },
  'watchlist-ending': { dot: 'bg-orange-500', label: 'Saved · Ending' },
};

export function NotificationBell({ notifications }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const count = notifications.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
        aria-label={`${count} notification${count !== 1 ? 's' : ''}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-30 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {count > 0 && <span className="text-xs text-slate-400">{count} active</span>}
          </div>

          {count === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-400">No alerts right now.</p>
              <p className="text-xs text-slate-300 mt-1">Watch vehicles or place bids to get alerts.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto scrollbar-thin">
              {notifications.map((n) => {
                const meta = TYPE_META[n.type];
                return (
                  <Link
                    key={n.id}
                    to={`/vehicle/${n.vehicleId}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <img src={n.image} className="w-12 h-9 object-cover rounded-lg flex-shrink-0" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                        <span className="text-xs text-slate-500">{meta.label} · {n.countdown}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
