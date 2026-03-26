'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <h1 className="text-3xl font-display text-[var(--rouge)]">
        Une erreur est survenue
      </h1>
      <p className="text-[var(--muted)]">{error.message}</p>
      <button
        onClick={reset}
        className="btn-luxury px-6 py-3 rounded"
      >
        Réessayer
      </button>
    </div>
  )
}
