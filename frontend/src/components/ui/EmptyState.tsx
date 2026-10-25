import type { ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  detail?: string
  action?: ReactNode
}

export function EmptyState({ message, detail, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12h4l2-5 4 10 2-5h6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="font-medium">{message}</p>
      {detail && <p className="text-caption text-ink-muted">{detail}</p>}
      {action}
    </div>
  )
}
