import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ALL_BrandS, ALL_PROVINCES } from '../../data/vehicles.ts';
import { useSettings } from '../../contexts/SettingsContext.tsx';

const BODY_STYLES = ['SUV', 'Sedan', 'Truck', 'Coupe', 'Hatchback'];
const FUEL_TYPES = ['Gasoline', 'Hybrid', 'Electric', 'Diesel'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'Single-speed'];
const TITLE_STATUSES = ['Clean', 'Rebuilt', 'Salvage'];

interface FormData {
  year: string;
  brand: string;
  model: string;
  trim: string;
  bodyStyle: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  odometer: string;
  conditionGrade: string;
  titleStatus: string;
  province: string;
  city: string;
  startingBid: string;
  reservePrice: string;
  buyNowPrice: string;
  dealership: string;
  notes: string;
}

const EMPTY: FormData = {
  year: '', brand: '', model: '', trim: '', bodyStyle: '', fuelType: '',
  transmission: '', drivetrain: '', odometer: '', conditionGrade: '',
  titleStatus: '', province: '', city: '', startingBid: '', reservePrice: '',
  buyNowPrice: '', dealership: '', notes: '',
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';
const selectCls = inputCls + ' cursor-pointer';

export function SubmitPage() {
  const { t } = useSettings();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((err) => ({ ...err, [field]: undefined }));
    };
  }

  function validate(): boolean {
    const required: (keyof FormData)[] = ['year', 'brand', 'model', 'bodyStyle', 'fuelType', 'transmission', 'drivetrain', 'odometer', 'conditionGrade', 'titleStatus', 'province', 'city', 'startingBid', 'reservePrice', 'dealership'];
    const next: typeof errors = {};
    for (const f of required) {
      if (!form[f].trim()) next[f] = t('submit.required');
    }
    const yr = Number(form.year);
    if (form.year && (isNaN(yr) || yr < 1980 || yr > new Date().getFullYear() + 1)) next.year = t('submit.valid_year');
    if (form.conditionGrade) {
      const g = Number(form.conditionGrade);
      if (isNaN(g) || g < 1 || g > 5) next.conditionGrade = t('submit.valid_grade');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{t('submit.success_title')}</h2>
        <p className="text-sm text-slate-500 mb-1">
          <span className="font-semibold text-slate-700">{form.year} {form.brand} {form.model}</span> {t('submit.success_queued')}
        </p>
        <p className="text-sm text-slate-400 mb-8">{t('submit.success_desc')}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setForm(EMPTY); setSubmitted(false); }}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            {t('submit.another')}
          </button>
          <Link to="/" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            {t('submit.back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('submit.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('submit.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">{t('submit.vehicle_details')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label={t('submit.year')} required>
              <input type="text" inputMode="numeric" value={form.year} onChange={set('year')} placeholder="2022" className={`${inputCls} ${errors.year ? 'border-red-400' : ''}`} />
              {errors.year && <p className="text-xs text-red-500 mt-0.5">{errors.year}</p>}
            </Field>
            <Field label={t('submit.brand')} required>
              <select value={form.brand} onChange={set('brand')} className={`${selectCls} ${errors.brand ? 'border-red-400' : ''}`}>
                <option value="">{t('submit.select')}</option>
                {ALL_BrandS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.brand && <p className="text-xs text-red-500 mt-0.5">{errors.brand}</p>}
            </Field>
            <Field label={t('submit.model')} required>
              <input type="text" value={form.model} onChange={set('model')} placeholder="Civic" className={`${inputCls} ${errors.model ? 'border-red-400' : ''}`} />
              {errors.model && <p className="text-xs text-red-500 mt-0.5">{errors.model}</p>}
            </Field>
            <Field label={t('submit.trim')}>
              <input type="text" value={form.trim} onChange={set('trim')} placeholder="Sport" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label={t('submit.body_style')} required>
              <select value={form.bodyStyle} onChange={set('bodyStyle')} className={`${selectCls} ${errors.bodyStyle ? 'border-red-400' : ''}`}>
                <option value="">{t('submit.select')}</option>
                {BODY_STYLES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.bodyStyle && <p className="text-xs text-red-500 mt-0.5">{errors.bodyStyle}</p>}
            </Field>
            <Field label={t('submit.fuel_type')} required>
              <select value={form.fuelType} onChange={set('fuelType')} className={`${selectCls} ${errors.fuelType ? 'border-red-400' : ''}`}>
                <option value="">{t('submit.select')}</option>
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.fuelType && <p className="text-xs text-red-500 mt-0.5">{errors.fuelType}</p>}
            </Field>
            <Field label={t('submit.transmission')} required>
              <select value={form.transmission} onChange={set('transmission')} className={`${selectCls} ${errors.transmission ? 'border-red-400' : ''}`}>
                <option value="">{t('submit.select')}</option>
                {TRANSMISSIONS.map((tx) => <option key={tx} value={tx}>{tx}</option>)}
              </select>
              {errors.transmission && <p className="text-xs text-red-500 mt-0.5">{errors.transmission}</p>}
            </Field>
            <Field label={t('submit.drivetrain')} required>
              <select value={form.drivetrain} onChange={set('drivetrain')} className={`${selectCls} ${errors.drivetrain ? 'border-red-400' : ''}`}>
                <option value="">{t('submit.select')}</option>
                {['AWD', '4WD', 'FWD', 'RWD'].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.drivetrain && <p className="text-xs text-red-500 mt-0.5">{errors.drivetrain}</p>}
            </Field>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label={t('submit.odometer')} required>
              <input type="text" inputMode="numeric" value={form.odometer} onChange={set('odometer')} placeholder="45000" className={`${inputCls} ${errors.odometer ? 'border-red-400' : ''}`} />
              {errors.odometer && <p className="text-xs text-red-500 mt-0.5">{errors.odometer}</p>}
            </Field>
            <Field label={t('submit.condition_grade')} required>
              <input type="text" inputMode="decimal" value={form.conditionGrade} onChange={set('conditionGrade')} placeholder="3.5" className={`${inputCls} ${errors.conditionGrade ? 'border-red-400' : ''}`} />
              {errors.conditionGrade && <p className="text-xs text-red-500 mt-0.5">{errors.conditionGrade}</p>}
            </Field>
            <Field label={t('submit.title_status')} required>
              <select value={form.titleStatus} onChange={set('titleStatus')} className={`${selectCls} ${errors.titleStatus ? 'border-red-400' : ''}`}>
                <option value="">{t('submit.select')}</option>
                {TITLE_STATUSES.map((ts) => <option key={ts} value={ts}>{ts}</option>)}
              </select>
              {errors.titleStatus && <p className="text-xs text-red-500 mt-0.5">{errors.titleStatus}</p>}
            </Field>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">{t('submit.location')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label={t('submit.province')} required>
              <select value={form.province} onChange={set('province')} className={`${selectCls} ${errors.province ? 'border-red-400' : ''}`}>
                <option value="">{t('submit.select')}</option>
                {ALL_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.province && <p className="text-xs text-red-500 mt-0.5">{errors.province}</p>}
            </Field>
            <Field label={t('submit.city')} required>
              <input type="text" value={form.city} onChange={set('city')} placeholder="Toronto" className={`${inputCls} ${errors.city ? 'border-red-400' : ''}`} />
              {errors.city && <p className="text-xs text-red-500 mt-0.5">{errors.city}</p>}
            </Field>
            <Field label={t('submit.dealership')} required>
              <input type="text" value={form.dealership} onChange={set('dealership')} placeholder="Maple Motors" className={`${inputCls} ${errors.dealership ? 'border-red-400' : ''}`} />
              {errors.dealership && <p className="text-xs text-red-500 mt-0.5">{errors.dealership}</p>}
            </Field>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">{t('submit.pricing')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label={t('submit.starting_bid')} required>
              <input type="text" inputMode="numeric" value={form.startingBid} onChange={set('startingBid')} placeholder="5000" className={`${inputCls} ${errors.startingBid ? 'border-red-400' : ''}`} />
              {errors.startingBid && <p className="text-xs text-red-500 mt-0.5">{errors.startingBid}</p>}
            </Field>
            <Field label={t('submit.reserve_price')} required>
              <input type="text" inputMode="numeric" value={form.reservePrice} onChange={set('reservePrice')} placeholder="12000" className={`${inputCls} ${errors.reservePrice ? 'border-red-400' : ''}`} />
              {errors.reservePrice && <p className="text-xs text-red-500 mt-0.5">{errors.reservePrice}</p>}
            </Field>
            <Field label={t('submit.buy_now_price')}>
              <input type="text" inputMode="numeric" value={form.buyNowPrice} onChange={set('buyNowPrice')} placeholder={t('submit.optional')} className={inputCls} />
            </Field>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <Field label={t('submit.condition_notes')}>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={3}
              placeholder={t('submit.condition_placeholder')}
              className={`${inputCls} resize-none`}
            />
          </Field>
        </section>

        <div className="flex items-center justify-end gap-3 pt-1 pb-6">
          <Link to="/" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors">
            {t('submit.cancel')}
          </Link>
          <button type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors">
            {t('submit.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
