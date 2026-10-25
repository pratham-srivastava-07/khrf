interface ErrorPanelProps {
  title: string
  message: string
  onRetry?: () => void
}

/** Inline error card: what failed, why, and a way to try again. */
export function ErrorPanel({ title, message, onRetry }: ErrorPanelProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="mt-0.5 size-5 shrink-0 text-alert"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <circle cx="10" cy="10" r="8" />
        <path d="M10 6v4.5M10 13.5v.01" strokeLinecap="round" />
      </svg>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-ink-muted">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 cursor-pointer rounded-lg border border-line px-4 font-medium transition-colors duration-150 ease-out hover:bg-canvas"
        >
          Try again
        </button>
      )}
    </div>
  )
}
