export interface LegendItem {
  label: string
  color: string
  kind: 'line' | 'dashed' | 'area' | 'bar'
}

/** HTML legend placed top-left above a chart; shape as well as color tells series apart. */
export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-caption text-ink-muted">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <Swatch {...item} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

function Swatch({ color, kind }: LegendItem) {
  if (kind === 'area' || kind === 'bar') {
    return (
      <span
        aria-hidden="true"
        className="inline-block size-3 rounded-sm"
        style={{ background: color, opacity: kind === 'area' ? 0.35 : 1 }}
      />
    )
  }
  return (
    <svg aria-hidden="true" width="20" height="4">
      <line x1="0" y1="2" x2="20" y2="2" stroke={color} strokeWidth="2" strokeDasharray={kind === 'dashed' ? '5 4' : undefined} />
    </svg>
  )
}
