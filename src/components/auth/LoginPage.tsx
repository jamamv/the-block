import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { AuthUser } from '../../lib/api.ts';
import { useSettings } from '../../contexts/SettingsContext.tsx';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<AuthUser>;
  onGuest: () => void;
}

export function LoginPage({ onLogin, onGuest }: LoginPageProps) {
  const { t } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError(t('auth.err_email_required')); return; }
    if (!password) { setError(t('auth.err_password_required')); return; }

    setSubmitting(true);
    try {
      await onLogin(email.trim(), password);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.err_login'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{t('auth.sign_in')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('auth.sign_in_subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                autoFocus
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.password_placeholder')}
                required
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-300"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? t('auth.signing_in') : t('auth.sign_in')}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { onGuest(); navigate(returnTo, { replace: true }); }}
              className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              {t('auth.guest')}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              {t('auth.no_account')}{' '}
              <Link
                to={`/register${returnTo !== '/' ? `?return=${encodeURIComponent(returnTo)}` : ''}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('auth.create_one')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
