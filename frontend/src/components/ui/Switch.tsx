interface SwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex h-11 cursor-pointer items-center gap-2 font-medium"
    >
      <span
        aria-hidden="true"
        className={`relative h-6 w-10 rounded-full transition-colors duration-150 ease-out ${checked ? 'bg-forecast' : 'bg-line'}`}
      >
        <span
          className={`absolute top-1 left-1 size-4 rounded-full bg-surface shadow-card transition-transform duration-150 ease-out ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </span>
      {label}
    </button>
  )
}
