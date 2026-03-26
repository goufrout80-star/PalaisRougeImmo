export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-[var(--linen)] ${className}`} />
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-white">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-white">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="text-center space-y-2">
      <Skeleton className="h-10 w-24 mx-auto" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function PropertyDetailSkeleton() {
  return (
    <div className="space-y-6 pt-32 px-4 max-w-7xl mx-auto">
      <Skeleton className="h-96 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}
