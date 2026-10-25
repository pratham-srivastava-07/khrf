import type { ReactNode } from "react";

type Tone = "default" | "over" | "under";

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  hint?: ReactNode;
  tone?: Tone;
  /** Makes the card a button, e.g. to jump to the point it describes. */
  onClick?: () => void;
  actionLabel?: string;
}

const TONE_CLASS: Record<Tone, string> = {
  default: "text-ink",
  over: "text-over",
  under: "text-under",
};

export function MetricCard({
  label,
  value,
  unit,
  hint,
  tone = "default",
  onClick,
  actionLabel,
}: MetricCardProps) {
  const body = (
    <>
      <p className="text-caption font-medium text-ink-muted">{label}</p>
      <p
        className={`mt-1 text-2xl leading-tight sm:text-title font-semibold tracking-tight num ${TONE_CLASS[tone]}`}
      >
        {value}
        {unit && (
          <span className="ml-1 text-body font-medium tracking-normal text-ink-muted">
            {unit}
          </span>
        )}
      </p>
      {hint && <p className="mt-1 text-caption text-ink-muted">{hint}</p>}
      {onClick && actionLabel && (
        <p className="mt-2 text-caption font-medium text-forecast">
          {actionLabel} →
        </p>
      )}
    </>
  );

  const base =
    "rounded-card border border-line bg-surface p-4 text-left shadow-card";
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`${base} cursor-pointer transition-colors duration-150 ease-out hover:border-forecast`}
    >
      {body}
    </button>
  ) : (
    <div className={base}>{body}</div>
  );
}
