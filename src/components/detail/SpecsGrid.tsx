import type { Vehicle } from '../../types/vehicle.ts';
import { formatOdometer, bodyStyleLabel } from '../../utils/format.ts';

interface SpecsGridProps {
  vehicle: Vehicle;
}

export function SpecsGrid({ vehicle }: SpecsGridProps) {
  const specs = [
    { label: 'Year', value: vehicle.year },
    { label: 'Brand', value: vehicle.Brand },
    { label: 'Model', value: vehicle.model },
    { label: 'Trim', value: vehicle.trim },
    { label: 'Type', value: bodyStyleLabel(vehicle.body_style) },
    { label: 'Engine', value: vehicle.engine },
    { label: 'Transmission', value: vehicle.transmission },
    { label: 'Drivetrain', value: vehicle.drivetrain },
    { label: 'Odometer', value: formatOdometer(vehicle.odometer_km) },
    { label: 'Fuel Type', value: vehicle.fuel_type },
    { label: 'Exterior Color', value: vehicle.exterior_color },
    { label: 'Interior Color', value: vehicle.interior_color },
    { label: 'Province', value: `${vehicle.city}, ${vehicle.province}` },
    { label: 'VIN', value: vehicle.vin },
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
