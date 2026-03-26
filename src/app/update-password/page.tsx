'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Session is now active, user can update password
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--parchment)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-[var(--rouge)] rounded-t-2xl px-8 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">PR</span>
            </div>
            <span className="font-display text-lg font-bold text-white tracking-wide">PALAIS ROUGE IMMO</span>
          </div>
          <p className="text-white/70 text-xs font-semibold tracking-[0.2em] uppercase mt-1">Marrakech</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-b-2xl shadow-luxury px-8 py-8">
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-[var(--noir)] mb-2">
                Mot de passe mis à jour
              </h2>
              <p className="text-sm text-[var(--stone)]">Redirection vers la page de connexion…</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold text-[var(--noir)] mb-2 text-center">
                Nouveau mot de passe
              </h2>
              <p className="text-sm text-[var(--stone)] text-center mb-8">
                Choisissez un nouveau mot de passe pour votre compte.
              </p>

              {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-luxury pr-11"
                      placeholder="Minimum 8 caractères"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--stone)] hover:text-[var(--noir)] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--noir)] mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="input-luxury"
                    placeholder="Répétez le mot de passe"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
