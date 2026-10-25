import { Link } from 'react-router-dom'

/** Single hero: what the tool answers, and one way in. */
export function LandingPage() {
  return (
    <main className="flex min-h-dvh items-center bg-canvas px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="max-w-2xl">
          <h1 className="hero-enter text-4xl leading-[1.05] font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Know the wind before you buy.
          </h1>
          <p
            className="hero-enter mt-5 max-w-[46ch] text-lead leading-relaxed text-ink-muted sm:text-lg"
            style={{ animationDelay: '80ms' }}
          >
            The latest GB wind forecast available at your decision cutoff, and how far forecasts have missed.
          </p>
          <div className="hero-enter mt-8" style={{ animationDelay: '160ms' }}>
            <Link
              to="/dashboard"
              className="group inline-flex h-12 items-center gap-2 rounded-lg bg-forecast px-6 text-lead font-semibold text-white shadow-card transition-[background-color,transform] duration-150 ease-out hover:bg-[#0b6870] active:scale-[0.98]"
            >
              Open dashboard
              <span aria-hidden="true" className="transition-transform duration-150 ease-out group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
