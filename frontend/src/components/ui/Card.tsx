import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, description, actions, children, className = '' }: CardProps) {
  return (
    <section className={`rounded-card border border-line bg-surface p-4 shadow-card sm:p-5 ${className}`}>
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lead font-semibold">{title}</h2>}
            {description && <p className="text-ink-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
