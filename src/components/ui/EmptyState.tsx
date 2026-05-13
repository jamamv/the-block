import { useSettings } from '../../contexts/SettingsContext.tsx';

interface EmptyStateProps {
  onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  const { t } = useSettings();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">{t('misc.no_vehicles')}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        {t('misc.no_vehicles_desc')}
      </p>
      <button
        onClick={onClear}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        {t('misc.clear_filters')}
      </button>
    </div>
  );
}
