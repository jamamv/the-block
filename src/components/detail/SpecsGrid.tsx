import type { Vehicle } from '../../types/vehicle.ts';
import { formatOdometer, bodyStyleLabel } from '../../utils/format.ts';
import { useSettings } from '../../contexts/SettingsContext.tsx';

interface SpecsGridProps {
  vehicle: Vehicle;
}

export function SpecsGrid({ vehicle }: SpecsGridProps) {
  const { t } = useSettings();

  const specs = [
    { label: t('specs.year'),         value: vehicle.year },
    { label: t('specs.brand'),        value: vehicle.Brand },
    { label: t('specs.model'),        value: vehicle.model },
    { label: t('specs.trim'),         value: vehicle.trim },
    { label: t('specs.type'),         value: bodyStyleLabel(vehicle.body_style) },
    { label: t('specs.engine'),       value: vehicle.engine },
    { label: t('specs.transmission'), value: vehicle.transmission },
    { label: t('specs.drivetrain'),   value: vehicle.drivetrain },
    { label: t('specs.odometer'),     value: formatOdometer(vehicle.odometer_km) },
    { label: t('specs.fuel_type'),    value: vehicle.fuel_type },
    { label: t('specs.exterior'),     value: vehicle.exterior_color },
    { label: t('specs.interior'),     value: vehicle.interior_color },
    { label: t('specs.province'),     value: `${vehicle.city}, ${vehicle.province}` },
    { label: t('specs.vin'),          value: vehicle.vin },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
      {specs.map(({ label, value }) => (
        <div key={label} className="flex flex-col">
          <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</dt>
          <dd className="text-sm text-slate-800 font-medium mt-0.5">{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
