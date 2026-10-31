/** Glass-style loading placeholder with a soft shimmer. */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} aria-hidden="true" />
}

export function SkeletonCard({ className = '', children }) {
  return (
    <div className={`glass relative overflow-hidden p-5 sm:p-6 ${className}`} aria-hidden="true">
      {children ?? (
        <>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-8 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <Skeleton className="mt-6 h-24 w-full" />
        </>
      )}
    </div>
  )
}

export function LoadingLabel({ children = 'Loading…' }) {
  return (
    <span className="sr-only" role="status">
      {children}
    </span>
  )
}
