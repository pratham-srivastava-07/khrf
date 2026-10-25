import { useRef } from 'react'
import { AccuracyControls } from '../components/accuracy/AccuracyControls'
import { BufferCallout } from '../components/accuracy/BufferCallout'
import { MetricCards, MetricCardsSkeleton } from '../components/accuracy/MetricCards'
import { TimeseriesPanel } from '../components/accuracy/TimeseriesPanel'
import { ErrorByHorizonChart } from '../components/charts/ErrorByHorizonChart'
import { ErrorByHourChart } from '../components/charts/ErrorByHourChart'
import { ErrorHistogramChart } from '../components/charts/ErrorHistogramChart'
import { Card } from '../components/ui/Card'
import { QueryState } from '../components/ui/QueryState'
import { Skeleton } from '../components/ui/Skeleton'
import { useAccuracy } from '../hooks/useAccuracy'
import { useAccuracyParams } from '../hooks/useAccuracyParams'
import { useMeta } from '../hooks/useMeta'
import type { MetaResponse } from '../types/api'

export function AccuracyPage() {
  const { data: meta } = useMeta()
  // AppShell renders pages only after meta has loaded.
  return meta ? <AccuracyContent meta={meta} /> : null
}

function AccuracyContent({ meta }: { meta: MetaResponse }) {
  const { params, setRange, setHorizon, setFocus } = useAccuracyParams(meta)
  const accuracy = useAccuracy({ start: params.start, end: params.end, horizon: params.horizon })
  const timeseriesRef = useRef<HTMLDivElement>(null)

  const focusOn = (time: string) => {
    setFocus(time)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    timeseriesRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-title">How accurate are wind forecasts?</h1>
        <p className="text-ink-muted">
          Error = forecast − actual. Positive means the forecast was too high, so less wind arrived than expected.
        </p>
      </header>

      <AccuracyControls meta={meta} params={params} onRangeChange={setRange} onHorizonChange={setHorizon} />

      <QueryState
        query={accuracy}
        errorTitle="Couldn't load accuracy"
        emptyMessage="No forecasts for this selection."
        skeleton={
          <div className="space-y-6">
            <MetricCardsSkeleton />
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-6 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[340px]" />
              ))}
            </div>
          </div>
        }
      >
        {(data) => (
          <div className="space-y-6">
            <MetricCards metrics={data.metrics} onFocus={focusOn} />
            <BufferCallout accuracy={data} />
            <div className="grid gap-6 lg:grid-cols-3">
              <Card title="Error by hour of day" description="London time">
                <ErrorByHourChart data={data.by_hour} />
              </Card>
              <Card title="Error distribution" description="Hours per 0.5 GW error band">
                <ErrorHistogramChart data={data.histogram} />
              </Card>
              <Card title="Error vs horizon" description="How far ahead the forecast was made">
                <ErrorByHorizonChart data={data.by_horizon} selected={data.horizon} />
              </Card>
            </div>
          </div>
        )}
      </QueryState>

      <TimeseriesPanel ref={timeseriesRef} params={params} onClearFocus={() => setFocus(null)} />
    </div>
  )
}
