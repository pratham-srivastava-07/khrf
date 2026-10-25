import type { ReactNode } from 'react'
import { ApiError } from '../../api/client'
import { EmptyState } from './EmptyState'
import { ErrorPanel } from './ErrorPanel'

interface QueryStateProps<T> {
  query: { data: T | undefined; isPending: boolean; isError: boolean; error: Error | null; refetch: () => unknown }
  /** Shown while loading; should match the shape of the final content. */
  skeleton: ReactNode
  /** Shown when the API says the selection has no data (HTTP 400). */
  emptyMessage?: string
  errorTitle: string
  children: (data: T) => ReactNode
}

/** Loading, empty, error and success states for one query. */
export function QueryState<T>({ query, skeleton, emptyMessage, errorTitle, children }: QueryStateProps<T>) {
  if (query.isPending) return <>{skeleton}</>
  if (query.isError || query.data === undefined) {
    const error = query.error
    if (emptyMessage && error instanceof ApiError && error.status === 400) {
      return <EmptyState message={emptyMessage} detail={error.message} />
    }
    return (
      <ErrorPanel title={errorTitle} message={error?.message ?? 'Something went wrong.'} onRetry={() => void query.refetch()} />
    )
  }
  return <>{children(query.data)}</>
}
