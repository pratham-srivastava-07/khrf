import { ForecastActualChart } from '../components/charts/ForecastActualChart'
import { DecisionControls } from '../components/decision/DecisionControls'
import { ForecastBanner } from '../components/decision/ForecastBanner'
import { ReliabilityStrip } from '../components/decision/ReliabilityStrip'
import { SummaryCards, SummaryCardsSkeleton } from '../components/decision/SummaryCards'
import { Card } from '../components/ui/Card'
import { QueryState } from '../components/ui/QueryState'
import { Skeleton } from '../components/ui/Skeleton'
import { useDecisionParams } from '../hooks/useDecisionParams'
import { useForecast } from '../hooks/useForecast'
import { useMeta } from '../hooks/useMeta'
import { formatDate, formatGw } from '../lib/format'
import type { MetaResponse } from '../types/api'

export function DecisionView() {
  const { data: meta } = useMeta()
  // AppShell renders pages only after meta has loaded.
  return meta ? <DecisionViewContent meta={meta} /> : null
}

function DecisionViewContent({ meta }: { meta: MetaResponse }) {
  const { params, setDate, setCutoff, setShowActuals } = useDecisionParams(meta)
  const forecast = useForecast({ date: params.date, cutoff: params.cutoffUtc })

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-title">Wind forecast at decision time</h1>
        <p className="text-ink-muted">
          The latest national wind forecast published before your cutoff, for the day you are buying for.
        </p>
      </header>

      <DecisionControls
        meta={meta}
        params={params}
        onDateChange={setDate}
        onCutoffChange={setCutoff}
        onShowActualsChange={setShowActuals}
      />

      <QueryState
        query={forecast}
        errorTitle="Couldn't load the forecast"
        emptyMessage="No forecast available for this date."
        skeleton={
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <SummaryCardsSkeleton />
            <Skeleton className="h-[440px] w-full" />
          </div>
        }
      >
        {(data) => {
          const hasActuals = data.points.some((p) => p.actual_mw !== null)
          return (
            <div className="space-y-6">
              <ForecastBanner forecast={data} />
              <SummaryCards forecast={data} />
              <Card
                title={formatDate(data.date)}
                description={
                  params.showActuals && !hasActuals ? 'No actual generation recorded for this day yet. Values in MW.' : 'Generation in MW, London time.'
                }
              >
                <ForecastActualChart
                  points={data.points}
                  showActuals={params.showActuals && hasActuals}
                  scale="day"
                  summary={`Wind forecast for ${formatDate(data.date)}: peak ${formatGw(data.summary.peak_mw)} GW, minimum ${formatGw(data.summary.min_mw)} GW.`}
                />
              </Card>
            </div>
          )
        }}
      </QueryState>

      <ReliabilityStrip meta={meta} />
    </div>
  )
}
