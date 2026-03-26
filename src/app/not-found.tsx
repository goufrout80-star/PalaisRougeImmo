import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <h1 className="text-6xl font-display text-[var(--rouge)]">
        404
      </h1>
      <p className="text-xl text-[var(--charcoal)]">
        Cette page n&apos;existe pas
      </p>
      <Link href="/" className="btn-luxury px-6 py-3 rounded">
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
