import type { Vehicle } from '../../types/vehicle.ts';
import { conditionLabel, conditionColor } from '../../utils/format.ts';
import { useSettings } from '../../contexts/SettingsContext.tsx';

interface ConditionPanelProps {
  vehicle: Vehicle;
}

export function ConditionPanel({ vehicle }: ConditionPanelProps) {
  const { t } = useSettings();
  const pct = Math.round((vehicle.condition_grade / 5) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div
          className={`w-16 h-16 rounded-full border-4 flex items-center justify-center flex-shrink-0 ${conditionColor(vehicle.condition_grade).replace('text-', 'border-')}`}
        >
          <span className={`text-xl font-bold ${conditionColor(vehicle.condition_grade)}`}>
            {vehicle.condition_grade.toFixed(1)}
          </span>
        </div>
        <div>
          <p className={`text-base font-semibold ${conditionColor(vehicle.condition_grade)}`}>
            {conditionLabel(vehicle.condition_grade)}
          </p>
          <p className="text-xs text-slate-500">{t('detail.out_of_5')}</p>
          <div className="mt-1.5 w-40 h-2 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          {t('detail.inspector_report')}
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed">{vehicle.condition_report}</p>
      </div>

      {vehicle.damage_notes.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            {t('detail.damage_notes')}
          </h4>
          <ul className="space-y-1">
            {vehicle.damage_notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-amber-500 mt-0.5">⚠</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {vehicle.damage_notes.length === 0 && (
        <p className="text-sm text-emerald-600 flex items-center gap-1">
          <span>✓</span> {t('detail.no_damage')}
        </p>
      )}
    </div>
  );
}
