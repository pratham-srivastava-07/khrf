import type { ReactNode } from 'react'

/** Tooltip shell matching the card surface. */
export function TooltipCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-w-48 rounded-lg border border-line bg-surface px-3 py-2 text-caption shadow-card">
      <p className="font-semibold text-ink">{title}</p>
      {subtitle && <p className="text-ink-muted">{subtitle}</p>}
      <dl className="mt-2 space-y-1">{children}</dl>
    </div>
  )
}

export function TooltipRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 text-ink-muted">
        {color && <span aria-hidden="true" className="inline-block size-2 rounded-full" style={{ background: color }} />}
        {label}
      </dt>
      <dd className="font-medium text-ink num">{value}</dd>
    </div>
  )
}
