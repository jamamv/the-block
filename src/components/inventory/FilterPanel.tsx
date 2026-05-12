import type { FilterState, BodyStyle, TitleStatus } from '../../types/vehicle.ts';
import { ALL_MAKES, ALL_PROVINCES, ALL_BODY_STYLES } from '../../data/vehicles.ts';
import { bodyStyleLabel, titleStatusLabel } from '../../utils/format.ts';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

function CheckGroup<T extends string>({
  title,
  options,
  selected,
  label,
  onChange,
}: {
  title: string;
  options: T[];
  selected: T[];
  label: (v: T) => string;
  onChange: (v: T[]) => void;
}) {
  function toggle(value: T) {
    onChange(
      selected.includes(value)
        ? selected.filter((s) => s !== value)
        : [...selected, value],
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</h3>
      <div className="space-y-1">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            {label(opt)}
          </label>
        ))}
      </div>
    </div>
  );
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const TITLE_STATUSES: TitleStatus[] = ['clean', 'rebuilt', 'salvage'];

  return (
    <div className="space-y-5">
      <CheckGroup
        title="Make"
        options={ALL_MAKES}
        selected={filters.makes}
        label={(v) => v}
        onChange={(makes) => onChange({ ...filters, makes })}
      />
      <CheckGroup
        title="Body Style"
        options={ALL_BODY_STYLES}
        selected={filters.bodyStyles}
        label={(v) => bodyStyleLabel(v as BodyStyle)}
        onChange={(bodyStyles) => onChange({ ...filters, bodyStyles: bodyStyles as BodyStyle[] })}
      />
      <CheckGroup
        title="Title Status"
        options={TITLE_STATUSES}
        selected={filters.titleStatuses}
        label={(v) => titleStatusLabel(v as TitleStatus)}
        onChange={(titleStatuses) => onChange({ ...filters, titleStatuses: titleStatuses as TitleStatus[] })}
      />
      <CheckGroup
        title="Province"
        options={ALL_PROVINCES}
        selected={filters.provinces}
        label={(v) => v}
        onChange={(provinces) => onChange({ ...filters, provinces })}
      />
    </div>
  );
}
