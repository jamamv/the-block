import { useSettings } from '../../contexts/SettingsContext.tsx';

export function LoadingScreen() {
  const { t } = useSettings();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] dark:bg-slate-900">
      <span className="text-sm text-slate-400">{t('misc.loading')}</span>
    </div>
  );
}
