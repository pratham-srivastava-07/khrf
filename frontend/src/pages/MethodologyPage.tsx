import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-heading font-semibold">{title}</h2>
      <div className="space-y-3 leading-relaxed">{children}</div>
    </section>
  )
}

function Term({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div>
      <dt className="font-semibold">{name}</dt>
      <dd className="text-ink-muted">{children}</dd>
    </div>
  )
}

export function MethodologyPage() {
  return (
    <article className="mx-auto max-w-[720px] space-y-10 text-lead">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-title">Methodology</h1>
        <p className="text-ink-muted">
          Where the numbers come from, how the decision cutoff works, and what the figures can and can't tell you.
        </p>
      </header>

      <Section title="Data sources">
        <p>
          All data comes from Elexon BMRS, the GB electricity market data service, for January 2026 at national level.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Forecasts:</strong> the WINDFOR dataset, national wind generation forecasts. Elexon publishes a new
            forecast every 2 to 4 hours, each covering the next two days hour by hour.
          </li>
          <li>
            <strong>Actuals:</strong> the FUELHH dataset, half-hourly generation by fuel type, filtered to wind.
          </li>
        </ul>
        <p>
          The data was downloaded once and stored with the app. The dashboard never contacts Elexon while you use it, so
          every view reflects the same fixed dataset.
        </p>
      </Section>

      <Section title="How the decision cutoff works">
        <p>
          Buyers decide the day before delivery. By default the cutoff is <strong>09:00 London time on the day before
          delivery</strong> (D-1 09:00). You can change it on the Decision View.
        </p>
        <p>
          For each hour of the delivery day, the dashboard shows the most recent forecast published at or before the
          cutoff. Forecasts published after the cutoff are never used, so the view shows only what a buyer could actually
          have seen. Hours with no forecast published by the cutoff are left blank, not filled in.
        </p>
        <p>
          On the Accuracy tab, "At cutoff" applies this same rule to every day in the range. The hour options (4h, 12h
          and so on) instead use, for each hour, the latest forecast published at least that many hours before it.
        </p>
      </Section>

      <Section title="Metrics">
        <p>
          Error is <strong>forecast − actual</strong>. A positive error means the forecast was too high, so less wind
          arrived than expected and more backup power was needed.
        </p>
        <dl className="space-y-3">
          <Term name="Average miss (MAE)">The average size of the error, ignoring direction.</Term>
          <Term name="RMSE">Like MAE, but large misses count for more. A big gap between RMSE and MAE means occasional large misses.</Term>
          <Term name="Bias">The average error with its sign. Positive means forecasts ran high overall.</Term>
          <Term name="MAPE">
            The average error as a percentage of actual output, counted only where actual output was at least 100 MW, to
            avoid huge percentages on near-calm hours.
          </Term>
          <Term name="P90 miss">90% of hours missed by less than this. It is the basis for the buffer guidance.</Term>
          <Term name="Worst over- and under-forecast">The single largest error in each direction, with when it happened.</Term>
        </dl>
      </Section>

      <Section title="Findings and limitations">
        <p>
          <strong>Forecasts ran about 1.9 GW high.</strong> In January 2026 the forecast at the decision cutoff averaged
          13.4 GW against 11.6 GW of actual wind output. The gap is present even for forecasts made just before the hour,
          and it grows on very windy days: around 0.5 GW when 4 to 8 GW was forecast, and over 4 GW when more than 20 GW was
          forecast. When buying, budget for the forecast running high, especially when it predicts strong wind.
        </p>
        <p>
          We checked that this is not a processing error: the sign and units are correct, and shifting the actuals in time
          does not shrink the gap. The pattern fits a difference in what the two datasets count (actuals cover
          transmission-metered wind) and wind farms being curtailed in high wind. This has not been confirmed against
          Elexon's dataset definitions.
        </p>
        <p>
          <strong>One month only.</strong> All figures come from January 2026. Accuracy and bias may differ in other
          seasons.
        </p>
        <p>
          <strong>About two days ahead at most.</strong> WINDFOR does not publish forecasts more than about two days
          ahead; the longest horizon in this data is 47.6 hours, so the furthest option offered is 47h. At 47h only about
          30% of hours have a forecast, so those figures rest on fewer data points.
        </p>
        <p>
          <strong>Hourly forecasts, half-hourly actuals.</strong> Each hourly forecast is compared with the actual for the
          half-hour starting at the same time. The half-hours in between appear on charts but have no forecast of their own.
        </p>
        <p>
          <strong>National level only.</strong> Regional differences, demand and prices are out of scope.
        </p>
      </Section>

      <Section title="Use of AI tools">
        <p>
          This dashboard was built with help from Claude Code, an AI coding assistant, under human direction and review.
        </p>
      </Section>

      <Link
        to="/dashboard"
        className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-forecast transition-colors duration-150 ease-out hover:bg-forecast-soft"
      >
        ← Back to Decision View
      </Link>
    </article>
  )
}
