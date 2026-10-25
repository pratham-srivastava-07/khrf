import type { Horizon, MetaResponse } from '../../types/api'
import type { AccuracyParams } from '../../hooks/useAccuracyParams'
import { Field, inputClass } from '../ui/Field'
import { SegmentedControl } from '../ui/SegmentedControl'

interface AccuracyControlsProps {
  meta: MetaResponse
  params: AccuracyParams
  onRangeChange: (start: string, end: string) => void
  onHorizonChange: (horizon: Horizon) => void
}

export function AccuracyControls({ meta, params, onRangeChange, onHorizonChange }: AccuracyControlsProps) {
  const options: { value: Horizon; label: string }[] = [
    { value: 'cutoff', label: 'At cutoff' },
    ...meta.horizons.map((h) => ({ value: h, label: `${h}h` })),
  ]

  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
      <Field label="From" htmlFor="range-start">
        <input
          id="range-start"
          type="date"
          className={inputClass}
          min={meta.data_start}
          // Start can't pass end, so the range is never inverted.
          max={params.end}
          value={params.start}
          required
          onChange={(e) => e.target.value && onRangeChange(e.target.value, params.end)}
        />
      </Field>
      <Field label="To" htmlFor="range-end">
        <input
          id="range-end"
          type="date"
          className={inputClass}
          min={params.start}
          max={meta.data_end}
          value={params.end}
          required
          onChange={(e) => e.target.value && onRangeChange(params.start, e.target.value)}
        />
      </Field>
      <Field label="Forecast made" hint="Hours before the target time">
        <SegmentedControl label="Forecast horizon" options={options} value={params.horizon} onChange={onHorizonChange} />
      </Field>
    </div>
  )
}
