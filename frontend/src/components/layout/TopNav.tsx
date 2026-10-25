import { Link, NavLink } from 'react-router-dom'

const TABS = [
  { to: '/dashboard', label: 'Decision View', end: true },
  { to: '/dashboard/accuracy', label: 'Accuracy', end: false },
  { to: '/dashboard/methodology', label: 'Methodology', end: false },
]

export function TopNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      {/* Mobile: title row above a scrollable tab row. md+: one 56px row with centred tabs. */}
      <div className="mx-auto flex max-w-[1280px] flex-col px-4 sm:px-6 md:h-14 md:flex-row md:items-center md:gap-6">
        <Link to="/" className="flex h-12 shrink-0 items-center font-semibold md:h-auto">
          Wind Forecast <span className="ml-1 hidden font-normal text-ink-muted sm:inline">· GB day-ahead</span>
        </Link>
        <nav aria-label="Main" className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-1 md:justify-center md:px-0">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `relative flex h-11 shrink-0 items-center px-3 font-medium whitespace-nowrap transition-colors duration-150 ease-out after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors after:duration-150 md:h-14 ${
                  isActive
                    ? 'text-ink after:bg-forecast'
                    : 'text-ink-muted after:bg-transparent hover:text-ink'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        {/* Balances the title so the tabs stay centred on wide screens. */}
        <div aria-hidden="true" className="hidden w-[180px] lg:block" />
      </div>
    </header>
  )
}
