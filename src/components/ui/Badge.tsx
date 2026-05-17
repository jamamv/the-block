import type { TitleStatus, FuelType } from '../../types/vehicle.ts';
import { titleStatusLabel } from '../../utils/format.ts';
import { useSettings } from '../../contexts/SettingsContext.tsx';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function TitleBadge({ status }: { status: TitleStatus }) {
  const styles: Record<TitleStatus, string> = {
    clean: 'bg-emerald-100 text-emerald-700',
    rebuilt: 'bg-amber-100 text-amber-700',
    salvage: 'bg-red-100 text-red-700',
  };
  return <Badge className={styles[status]}>{titleStatusLabel(status)}</Badge>;
}

export function FuelBadge({ fuel }: { fuel: FuelType }) {
  const { t } = useSettings();
  const styles: Record<FuelType, string> = {
    gasoline: 'bg-slate-100 text-slate-600',
    hybrid: 'bg-teal-100 text-teal-700',
    electric: 'bg-blue-100 text-blue-700',
    diesel: 'bg-orange-100 text-orange-700',
  };
  const labels: Record<FuelType, string> = {
    gasoline: t('badge.fuel_gas'),
    hybrid: t('badge.fuel_hybrid'),
    electric: t('badge.fuel_electric'),
    diesel: t('badge.fuel_diesel'),
  };
  return <Badge className={styles[fuel]}>{labels[fuel]}</Badge>;
}

export function ConditionBadge({ grade }: { grade: number }) {
  const { t } = useSettings();
  let style = 'bg-slate-100 text-slate-600';
  if (grade >= 4.5) style = 'bg-emerald-100 text-emerald-700';
  else if (grade >= 3.5) style = 'bg-blue-100 text-blue-700';
  else if (grade >= 2.5) style = 'bg-amber-100 text-amber-700';
  else style = 'bg-red-100 text-red-700';
  return <Badge className={style}>{t('badge.grade', { grade: grade.toFixed(1) })}</Badge>;
}

export function ReserveBadge({ met }: { met: boolean }) {
  const { t } = useSettings();
  return met ? (
    <Badge className="bg-emerald-100 text-emerald-700">{t('badge.reserve_met')}</Badge>
  ) : (
    <Badge className="bg-slate-100 text-slate-500">{t('badge.reserve_not_met')}</Badge>
  );
}
