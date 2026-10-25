# CLAUDE.md

## Product
Wind Forecast Decision Dashboard: a web app that helps a UK utility's day-ahead power buyers see the latest wind forecast available at decision time and understand how accurate wind forecasts have been. Decision support only; no order placement. Scope: national-level wind, Elexon data (FUELHH, WINDFOR), January 2026.

## Stack
React + TypeScript (Vite, Tailwind, Recharts) / FastAPI + pandas / Parquet files (no database) / Docker / Vercel.

## Read these first (in /docs)
1. `docs/prd.md` - what to build and why
2. `docs/trd.md` - technical decisions; do not deviate
3. `docs/app-flow.md` - screens, navigation, interactions
4. `docs/ui-ux-design-brief.md` - look and feel; names the design skills to load
5. `docs/schema.md` - data files and API models
6. `docs/implementation-plan.md` - build order; follow it phase by phase

## Ground rules
- Follow the docs; if something is unspecified, ask instead of guessing.
- Never use forecasts published after the decision cutoff.
- Never call Elexon at request time; use ingested data.
- Keep logic in backend services; keep routers and components thin.
- Add tests with each backend change.
- Disclose AI tool usage in the README.