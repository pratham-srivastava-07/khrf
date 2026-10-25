import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Point } from "../../types/api";
import { toChartData, type ChartDatum } from "../../lib/chartData";
import {
  formatDateTime,
  formatDay,
  formatMw,
  formatTime,
  formatUtc,
} from "../../lib/format";
import { ACTUAL_DASH, COLORS, axisProps, formatAxisMw } from "./chartTheme";
import { Legend, type LegendItem } from "./Legend";
import { TooltipCard, TooltipRow } from "./TooltipCard";

const TICK_FORMAT = {
  day: formatTime,
  window: formatDateTime,
  range: formatDay,
};

interface ForecastActualChartProps {
  points: Point[];
  showActuals: boolean;
  /** Shade the gap between forecast and actual (amber over, blue under). */
  showErrorBands?: boolean;
  /** ISO time to mark with a vertical line. */
  focus?: string | null;
  /** x-axis labels: 'day' times, 'window' date and time, 'range' dates. */
  scale: "day" | "window" | "range";
  summary: string;
}

export function ForecastActualChart({
  points,
  showActuals,
  showErrorBands = false,
  focus = null,
  scale,
  summary,
}: ForecastActualChartProps) {
  const data = useMemo(() => toChartData(points), [points]);
  const focusT = focus ? Date.parse(focus) : null;
  const bands = showActuals && showErrorBands;

  const legend: LegendItem[] = [
    { label: "Forecast", color: COLORS.forecast, kind: "line" },
  ];
  if (showActuals)
    legend.push({ label: "Actual", color: COLORS.actual, kind: "dashed" });
  if (bands) {
    legend.push({ label: "Over-forecast", color: COLORS.over, kind: "area" });
    legend.push({ label: "Under-forecast", color: COLORS.under, kind: "area" });
  }

  return (
    <figure>
      <figcaption className="sr-only">{summary}</figcaption>
      <Legend items={legend} />
      {/* Shorter on phones so the chart and its controls fit one screen. */}
      <div className="h-64 sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} stroke={COLORS.grid} />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={TICK_FORMAT[scale]}
              minTickGap={scale === "window" ? 48 : 24}
              {...axisProps}
            />
            <YAxis
              tickFormatter={formatAxisMw}
              width={56}
              {...axisProps}
              axisLine={false}
            />
            <Tooltip
              content={<ForecastTooltip showActuals={showActuals} />}
              cursor={{ stroke: COLORS.axis, strokeWidth: 1 }}
            />
            {bands && (
              <>
                <Area
                  dataKey="overBand"
                  stroke="none"
                  fill={COLORS.over}
                  fillOpacity={0.18}
                  isAnimationActive={false}
                  activeDot={false}
                />
                <Area
                  dataKey="underBand"
                  stroke="none"
                  fill={COLORS.under}
                  fillOpacity={0.18}
                  isAnimationActive={false}
                  activeDot={false}
                />
              </>
            )}
            {showActuals && (
              <Line
                dataKey="actual"
                stroke={COLORS.actual}
                strokeWidth={2}
                strokeDasharray={ACTUAL_DASH}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            )}
            <Line
              dataKey="forecastLine"
              stroke={COLORS.forecast}
              strokeWidth={2}
              dot={IsolatedDot}
              activeDot={{ r: 4 }}
              animationDuration={600}
            />
            {focusT !== null && (
              <ReferenceLine
                x={focusT}
                stroke={COLORS.focus}
                strokeDasharray="3 3"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/** Dot only for forecasts with no line segment to show them (sparse long horizons). */
function IsolatedDot({
  cx,
  cy,
  payload,
}: {
  cx?: number;
  cy?: number;
  payload?: ChartDatum;
}) {
  if (!payload?.isolated || cx === undefined || cy === undefined) return <g />;
  return <circle cx={cx} cy={cy} r={3} fill={COLORS.forecast} />;
}

interface ForecastTooltipProps {
  showActuals: boolean;
  active?: boolean;
  payload?: { payload: ChartDatum }[];
}

function ForecastTooltip({
  showActuals,
  active,
  payload,
}: ForecastTooltipProps) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  const error =
    d.forecast !== null && d.actual !== null ? d.forecast - d.actual : null;
  return (
    <TooltipCard title={formatDateTime(d.t)} subtitle={formatUtc(d.t)}>
      <TooltipRow
        label="Forecast"
        color={COLORS.forecast}
        value={d.forecast !== null ? formatMw(d.forecast) : "No forecast"}
      />
      {showActuals && (
        <TooltipRow
          label="Actual"
          color={COLORS.actual}
          value={d.actual !== null ? formatMw(d.actual) : "No data"}
        />
      )}
      {showActuals && error !== null && (
        <TooltipRow
          label={error > 0 ? "Over by" : "Under by"}
          value={formatMw(Math.abs(error))}
        />
      )}
      {d.publishTime && (
        <TooltipRow label="Published" value={formatDateTime(d.publishTime)} />
      )}
    </TooltipCard>
  );
}
