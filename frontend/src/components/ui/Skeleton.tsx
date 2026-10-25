interface SkeletonProps {
  className?: string
}

/** Placeholder block; give it the size of the content it stands in for. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-shimmer rounded-md bg-[linear-gradient(90deg,var(--color-line)_25%,var(--color-canvas)_50%,var(--color-line)_75%)] bg-[length:200%_100%] ${className}`}
    />
  )
}
