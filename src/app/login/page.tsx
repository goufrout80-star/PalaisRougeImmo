'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, AlertCircle } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { logLogin } from '@/lib/logger';

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(t('auth.invalidCredentials'));
      setLoading(false);
      return;
    }

    const user = data.user;
    const role = user?.user_metadata?.role ?? '';
    const mfaSkipped = user?.user_metadata?.mfa_skipped;

    logLogin(role, email);

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactor = factors?.totp?.some(
      (f) => f.status === 'verified'
    );

    if (hasVerifiedFactor) {
      router.push('/2fa/verify');
      return;
    }

    if (role === 'admin') {
      router.push('/2fa/setup');
      return;
    }

    if (role === 'agent' && !mfaSkipped) {
      router.push('/2fa/setup');
      return;
    }

    if (role === 'admin') router.push('/admin/dashboard');
    else if (role === 'agent') router.push('/agent/dashboard');
    else router.push('/dashboard');

    setLoading(false);
  };

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 bg-[var(--linen)] min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-luxury p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[var(--rouge)] rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">PR</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-[var(--rouge)] mb-1">{t('auth.login')}</h1>
            <p className="text-sm text-[var(--stone)]">{t('auth.loginSubtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--rouge)] mb-1.5">{t('auth.email') || 'Email'}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-light)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-luxury pl-10"
                  placeholder="admin@palaisrouge.online"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--rouge)] mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-light)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-luxury pl-10"
                  placeholder={t('auth.password')}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.loggingIn') : t('auth.loginButton')}
            </Button>
          </form>

        </div>
      </motion.div>
    </div>
  );
}
