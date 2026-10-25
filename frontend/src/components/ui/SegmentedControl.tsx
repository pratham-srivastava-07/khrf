interface Option<T> {
  value: T
  label: string
}

interface SegmentedControlProps<T> {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string | number>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  return (
    // Same height, border and surface as the text inputs (inputClass) so a row of controls lines up.
    // Scrolls sideways on very narrow screens instead of wrapping out of the 44px row.
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex h-11 max-w-full items-stretch gap-1 overflow-x-auto rounded-lg border border-line bg-surface p-1"
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`shrink-0 cursor-pointer rounded-md px-2.5 font-medium whitespace-nowrap sm:px-3 transition-colors duration-150 ease-out ${
              selected ? 'bg-forecast-soft text-forecast' : 'text-ink-muted hover:bg-canvas hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
