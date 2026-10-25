import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  /** id of the input the label names; omit for controls that label themselves (e.g. a switch). */
  htmlFor?: string
  hint?: string
  children: ReactNode
}

/**
 * One control column: label, control, then a hint row. The hint row is always
 * reserved so controls in a row stay aligned whether or not they have a hint.
 */
export function Field({ label, htmlFor, hint, children }: FieldProps) {
  const labelClass = 'text-caption font-medium text-ink-muted'
  return (
    <div className="flex max-w-full min-w-0 flex-col gap-1">
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
        </label>
      ) : (
        <span className={labelClass}>{label}</span>
      )}
      <div className="flex h-11 max-w-full items-center gap-2">{children}</div>
      <p className="min-h-[18px] text-caption text-ink-muted">{hint}</p>
    </div>
  )
}

export const inputClass =
  'h-11 rounded-lg border border-line bg-surface px-3 num text-ink transition-colors duration-150 ease-out hover:border-ink-muted'
