import { Outlet } from 'react-router-dom'
import { useMeta } from '../../hooks/useMeta'
import { ErrorPanel } from '../ui/ErrorPanel'
import { Skeleton } from '../ui/Skeleton'
import { TopNav } from './TopNav'

/** Nav plus page area. Pages render only once /api/meta has loaded. */
export function AppShell() {
  const meta = useMeta()

  return (
    <div className="min-h-dvh">
      <TopNav />
      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
        {meta.isPending ? (
          <PageSkeleton />
        ) : meta.isError ? (
          <ErrorPanel
            title="Couldn't load the dashboard"
            message={meta.error.message}
            onRetry={() => void meta.refetch()}
          />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-6">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
