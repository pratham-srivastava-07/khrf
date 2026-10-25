import type { MetaResponse } from '../../types/api'
import type { DecisionParams } from '../../hooks/useDecisionParams'
import { defaultCutoffLocal } from '../../lib/time'
import { Field, inputClass } from '../ui/Field'
import { Switch } from '../ui/Switch'

interface DecisionControlsProps {
  meta: MetaResponse
  params: DecisionParams
  onDateChange: (date: string) => void
  onCutoffChange: (local: string | null) => void
  onShowActualsChange: (show: boolean) => void
}

export function DecisionControls({ meta, params, onDateChange, onCutoffChange, onShowActualsChange }: DecisionControlsProps) {
  const defaultCutoff = defaultCutoffLocal(params.date)
  const cutoffValue = params.cutoffLocal ?? defaultCutoff

  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
      <Field label="Delivery date" htmlFor="delivery-date">
        <input
          id="delivery-date"
          type="date"
          className={inputClass}
          min={meta.data_start}
          max={meta.data_end}
          value={params.date}
          required
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
        />
      </Field>
      <Field
        label="Decision cutoff (London time)"
        htmlFor="cutoff"
        hint={params.cutoffLocal ? 'Custom cutoff' : `Default: ${meta.default_cutoff_rule.replace(' Europe/London', ' London')}`}
      >
        <input
          id="cutoff"
          type="datetime-local"
          className={inputClass}
          value={cutoffValue}
          onChange={(e) => e.target.value && onCutoffChange(e.target.value === defaultCutoff ? null : e.target.value)}
        />
        {params.cutoffLocal && (
          <button
            type="button"
            onClick={() => onCutoffChange(null)}
            className="h-11 cursor-pointer rounded-lg px-3 font-medium text-forecast transition-colors duration-150 ease-out hover:bg-forecast-soft"
          >
            Reset
          </button>
        )}
      </Field>
      <Field label="Chart">
        <Switch label="Show actuals" checked={params.showActuals} onChange={onShowActualsChange} />
      </Field>
    </div>
  )
}
