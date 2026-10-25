import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HourError } from '../../types/api'
import { formatMw } from '../../lib/format'
import { COLORS, axisProps, formatAxisMw } from './chartTheme'
import { Legend } from './Legend'
import { TooltipCard, TooltipRow } from './TooltipCard'

const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`

export function ErrorByHourChart({ data }: { data: HourError[] }) {
  const worst = data.reduce((a, b) => (b.mae > a.mae ? b : a), data[0])
  return (
    <figure>
      <figcaption className="sr-only">
        Average miss by hour of day (London). Largest at {hourLabel(worst.hour)}: {formatMw(worst.mae)}.
      </figcaption>
      <Legend
        items={[
          { label: 'Average miss (MAE)', color: COLORS.forecast, kind: 'bar' },
          { label: 'Bias: over', color: COLORS.over, kind: 'bar' },
          { label: 'Bias: under', color: COLORS.under, kind: 'bar' },
        ]}
      />
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2} accessibilityLayer>
          <CartesianGrid vertical={false} stroke={COLORS.grid} />
          <XAxis dataKey="hour" tickFormatter={hourLabel} interval={3} {...axisProps} />
          <YAxis tickFormatter={formatAxisMw} width={56} {...axisProps} axisLine={false} />
          <ReferenceLine y={0} stroke={COLORS.axis} />
          <Tooltip content={<HourTooltip />} cursor={{ fill: 'var(--color-canvas)' }} />
          <Bar dataKey="mae" fill={COLORS.forecast} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="bias" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.hour} fill={d.bias >= 0 ? COLORS.over : COLORS.under} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </figure>
  )
}

function HourTooltip({ active, payload }: { active?: boolean; payload?: { payload: HourError }[] }) {
  const d = payload?.[0]?.payload
  if (!active || !d) return null
  return (
    <TooltipCard title={`${hourLabel(d.hour)} London`}>
      <TooltipRow label="Average miss" color={COLORS.forecast} value={formatMw(d.mae)} />
      <TooltipRow
        label={d.bias >= 0 ? 'Bias (over)' : 'Bias (under)'}
        color={d.bias >= 0 ? COLORS.over : COLORS.under}
        value={formatMw(Math.abs(d.bias))}
      />
    </TooltipCard>
  )
}
