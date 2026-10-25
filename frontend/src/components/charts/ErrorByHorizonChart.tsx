import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Horizon, HorizonError } from '../../types/api'
import { formatMw } from '../../lib/format'
import { ACTUAL_DASH, COLORS, axisProps, formatAxisMw } from './chartTheme'
import { Legend } from './Legend'
import { TooltipCard, TooltipRow } from './TooltipCard'

export function ErrorByHorizonChart({ data, selected }: { data: HorizonError[]; selected: Horizon }) {
  const first = data[0]
  const last = data[data.length - 1]
  return (
    <figure>
      <figcaption className="sr-only">
        Average miss grows from {formatMw(first.mae)} at {first.horizon} hours ahead to {formatMw(last.mae)} at{' '}
        {last.horizon} hours ahead.
      </figcaption>
      <Legend
        items={[
          { label: 'Average miss (MAE)', color: COLORS.forecast, kind: 'line' },
          { label: 'RMSE', color: COLORS.actual, kind: 'dashed' },
        ]}
      />
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke={COLORS.grid} />
          <XAxis
            dataKey="horizon"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={data.map((d) => d.horizon)}
            tickFormatter={(h: number) => `${h}h`}
            {...axisProps}
          />
          <YAxis tickFormatter={formatAxisMw} width={56} {...axisProps} axisLine={false} domain={[0, 'auto']} />
          <Tooltip content={<HorizonTooltip />} cursor={{ stroke: COLORS.axis, strokeWidth: 1 }} />
          {selected !== 'cutoff' && <ReferenceLine x={selected} stroke={COLORS.axis} strokeDasharray="3 3" />}
          <Line dataKey="mae" stroke={COLORS.forecast} strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
          <Line
            dataKey="rmse"
            stroke={COLORS.actual}
            strokeWidth={2}
            strokeDasharray={ACTUAL_DASH}
            dot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  )
}

function HorizonTooltip({ active, payload }: { active?: boolean; payload?: { payload: HorizonError }[] }) {
  const d = payload?.[0]?.payload
  if (!active || !d) return null
  return (
    <TooltipCard title={`${d.horizon} hours ahead`}>
      <TooltipRow label="Average miss" color={COLORS.forecast} value={formatMw(d.mae)} />
      <TooltipRow label="RMSE" color={COLORS.actual} value={formatMw(d.rmse)} />
    </TooltipCard>
  )
}
