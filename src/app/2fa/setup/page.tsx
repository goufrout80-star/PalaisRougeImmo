'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function TwoFASetupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [userRole, setUserRole] = useState<string>('')
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const role = user.user_metadata?.role ?? ''
      setUserRole(role)

      // Check if already enrolled
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const verified = factors?.totp?.find(f => f.status === 'verified')
      if (verified) {
        redirectToDashboard(role)
        return
      }

      // Start enrollment
      const { data, error: enrollError } =
        await supabase.auth.mfa.enroll({ factorType: 'totp' })

      if (enrollError || !data) {
        setError('Erreur lors de la configuration 2FA.')
        setLoading(false)
        return
      }

      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
      setLoading(false)
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const redirectToDashboard = (role: string) => {
    if (role === 'admin') router.push('/admin/dashboard')
    else if (role === 'agent') router.push('/agent/dashboard')
    else router.push('/dashboard')
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres.')
      return
    }
    setVerifying(true)
    setError('')

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId })

    if (challengeError) {
      setError('Erreur de défi 2FA.')
      setVerifying(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    })

    if (verifyError) {
      setError('Code incorrect. Réessayez.')
      setVerifying(false)
      return
    }

    await supabase.auth.updateUser({
      data: { mfa_setup_complete: true }
    })

    redirectToDashboard(userRole)
  }

  const handleSkip = async () => {
    if (userRole !== 'agent') return
    await supabase.auth.updateUser({
      data: { mfa_skipped: true }
    })
    router.push('/agent/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--parchment)]">
        <div className="w-8 h-8 border-2 border-[var(--rouge)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--parchment)] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-[var(--rouge)] px-8 py-6">
          <h1 className="text-white text-xl font-display font-bold">
            PALAIS ROUGE IMMO
          </h1>
          <p className="text-white/75 text-sm mt-1">
            Authentification à deux facteurs
          </p>
        </div>

        <div className="px-8 py-8 space-y-6">
          {/* Instructions */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--noir)]">
              Configurez votre application 2FA
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              Scannez le QR code avec Google Authenticator,
              Authy ou toute application compatible TOTP.
            </p>
          </div>

          {/* App suggestions */}
          <div className="bg-[var(--rouge-tint,#fdf2f2)] rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-[var(--rouge)] mb-1 uppercase tracking-wide">
              Applications recommandées
            </p>
            <p className="text-xs text-[var(--charcoal)]">
              Google Authenticator · Authy · Microsoft Authenticator · 1Password · Bitwarden
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            {qrCode && (
              <div className="p-4 bg-white border-2 border-[var(--border)] rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCode}
                  alt="QR Code 2FA"
                  width={180}
                  height={180}
                />
              </div>
            )}

            <button
              onClick={() => setShowManual(!showManual)}
              className="text-sm text-[var(--rouge)] underline underline-offset-2">
              {showManual ? 'Masquer la clé manuelle' : 'Entrer la clé manuellement'}
            </button>

            {showManual && (
              <div className="w-full bg-[var(--linen,#f5f0eb)] rounded-lg p-4 text-center">
                <p className="text-xs text-[var(--muted)] mb-2">
                  Clé secrète (à saisir dans votre application)
                </p>
                <code className="text-sm font-mono font-bold text-[var(--noir)] tracking-widest break-all select-all">
                  {secret}
                </code>
              </div>
            )}
          </div>

          {/* Verification input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--charcoal)]">
              Code de vérification (6 chiffres)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-[var(--border)] rounded-lg px-4 py-3 text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:border-[var(--rouge)] focus:ring-2 focus:ring-[var(--rouge-tint,#fdf2f2)]"
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleVerify}
              disabled={verifying || code.length !== 6}
              className="w-full bg-[var(--rouge)] hover:bg-[var(--rouge-dark)] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
              {verifying ? 'Vérification...' : 'Activer la 2FA'}
            </button>

            {userRole === 'agent' && (
              <button
                onClick={handleSkip}
                className="w-full text-[var(--muted)] text-sm hover:text-[var(--charcoal)] transition-colors py-2">
                Passer pour l&apos;instant (non recommandé)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
