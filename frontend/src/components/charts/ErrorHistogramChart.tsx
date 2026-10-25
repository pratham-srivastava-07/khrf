import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HistogramBin } from '../../types/api'
import { formatSignedGw } from '../../lib/format'
import { COLORS, axisProps } from './chartTheme'
import { Legend } from './Legend'
import { TooltipCard, TooltipRow } from './TooltipCard'

const binLabel = (b: HistogramBin) => `${formatSignedGw(b.bin_start)} to ${formatSignedGw(b.bin_end)} GW`

export function ErrorHistogramChart({ data }: { data: HistogramBin[] }) {
  const total = data.reduce((sum, b) => sum + b.count, 0)
  const over = data.filter((b) => b.bin_start >= 0).reduce((sum, b) => sum + b.count, 0)
  return (
    <figure>
      <figcaption className="sr-only">
        Distribution of forecast errors. {Math.round((over / total) * 100)}% of hours were over-forecast.
      </figcaption>
      <Legend
        items={[
          { label: 'Over-forecast', color: COLORS.over, kind: 'bar' },
          { label: 'Under-forecast', color: COLORS.under, kind: 'bar' },
        ]}
      />
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={2} accessibilityLayer>
          <CartesianGrid vertical={false} stroke={COLORS.grid} />
          <XAxis
            dataKey="bin_start"
            tickFormatter={(v: number) => formatSignedGw(v)}
            interval="preserveStartEnd"
            minTickGap={16}
            {...axisProps}
            label={{ value: 'Error (GW)', position: 'insideBottomRight', offset: -2, fill: COLORS.axis, fontSize: 12 }}
          />
          <YAxis allowDecimals={false} width={40} {...axisProps} axisLine={false} />
          <Tooltip content={<BinTooltip total={total} />} cursor={{ fill: 'var(--color-canvas)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((b) => (
              <Cell key={b.bin_start} fill={b.bin_start >= 0 ? COLORS.over : COLORS.under} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </figure>
  )
}

function BinTooltip({ total, active, payload }: { total: number; active?: boolean; payload?: { payload: HistogramBin }[] }) {
  const b = payload?.[0]?.payload
  if (!active || !b) return null
  return (
    <TooltipCard title={binLabel(b)}>
      <TooltipRow label="Hours" value={String(b.count)} />
      <TooltipRow label="Share" value={`${((b.count / total) * 100).toFixed(1)}%`} />
    </TooltipCard>
  )
}
