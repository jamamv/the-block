import { NavLink } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext.tsx';

export function BottomNav({
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
