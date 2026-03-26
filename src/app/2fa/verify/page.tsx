'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function TwoFAVerifyPage() {
  const router = useRouter()
  const supabase = createClient()

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres.')
      return
    }
    setLoading(true)
    setError('')

    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totpFactor = factors?.totp?.[0]

    if (!totpFactor) {
      setError('Aucun facteur 2FA trouvé.')
      setLoading(false)
      return
    }

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: totpFactor.id })

    if (challengeError) {
      setError('Erreur de connexion. Réessayez.')
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challengeData.id,
      code,
    })

    if (verifyError) {
      setError('Code incorrect. Réessayez.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role
    if (role === 'admin') router.push('/admin/dashboard')
    else if (role === 'agent') router.push('/agent/dashboard')
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--parchment)] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">

        <div className="bg-[var(--rouge)] px-8 py-6">
          <h1 className="text-white text-xl font-display font-bold">
            PALAIS ROUGE IMMO
          </h1>
          <p className="text-white/75 text-sm mt-1">
            Vérification en deux étapes
          </p>
        </div>

        <div className="px-8 py-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--noir)]">
              Entrez votre code 2FA
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              Ouvrez votre application d&apos;authentification et saisissez le code à 6 chiffres.
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
              className="w-full border border-[var(--border)] rounded-lg px-4 py-4 text-center text-2xl font-mono tracking-[0.6em] focus:outline-none focus:border-[var(--rouge)] focus:ring-2 focus:ring-[var(--rouge-tint,#fdf2f2)]"
            />
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full bg-[var(--rouge)] hover:bg-[var(--rouge-dark)] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
            {loading ? 'Vérification...' : 'Confirmer'}
          </button>

          <button
            onClick={() => {
              supabase.auth.signOut()
              router.push('/login')
            }}
            className="w-full text-sm text-[var(--muted)] hover:text-[var(--charcoal)] transition-colors py-2">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
