# Implementation Plan

Follow phases in order. Complete and verify each phase before starting the next. Commit after each phase. Time budget: 16 hours total.

## Phase 0: Setup (0.5h)
1. Create repo structure from trd.md section 7.
2. Init backend (venv, requirements.txt: fastapi, uvicorn, pandas, pyarrow, pydantic, httpx, pytest, ruff).
3. Init frontend with Vite React-TS; add tailwindcss, recharts, @tanstack/react-query, react-router-dom, vitest, testing-library.
4. Add .gitignore, README skeleton (include AI-tools disclosure placeholder).

## Phase 1: Data exploration and ingestion (2h)
1. Call both Elexon endpoints in a notebook or scratch script; confirm parameter names, response shape, pagination, and volume.
2. Write `scripts/ingest.py` per trd.md section 4 and schema.md.
3. Generate parquet files and meta.json; print validation report.
4. Check file sizes are small enough for Vercel.
**Verify:** row counts sane (about 1,488 actual rows for January), no duplicates, horizon range correct.

## Phase 2: Core backend logic (3h)
1. `services/data_store.py`: load parquet at startup into module-level DataFrames.
2. `services/cutoff.py`: default cutoff computation (Europe/London -> UTC), latest-forecast-before-cutoff selection.
3. `services/accuracy.py`: horizon-based alignment and all metrics.
4. Write pytest tests first or alongside: cutoff selection (including DST day and gaps), each metric against hand-computed values.
**Verify:** `pytest` green.

## Phase 3: API layer (1.5h)
1. Pydantic models in `models.py`.
2. Routers for `/api/meta`, `/api/forecast`, `/api/accuracy`, `/api/timeseries`, `/api/health`.
3. Input validation and error responses.
4. Endpoint tests with FastAPI TestClient.
**Verify:** manual curl of each endpoint returns expected shapes.

## Phase 4: Frontend foundation (1.5h)
1. Load the design skills per ui-ux-design-brief.md; establish the design system (Tailwind theme tokens for colors, fonts, spacing).
2. `types/api.ts`, `api/client.ts`, React Query hooks per endpoint.
3. App shell: router, top nav, layout, global error and loading components.
4. Vite proxy to backend.

## Phase 5: Decision View (2h)
1. Controls (date, cutoff, actuals toggle) synced to URL params.
2. Banner, summary cards, main chart, reliability strip.
3. Loading, empty, and error states.
**Verify:** change date and cutoff, confirm forecast_as_of changes and never exceeds cutoff.

## Phase 6: Accuracy view (2h)
1. Controls (range, horizon).
2. Metric cards, buffer callout, three charts, time series.
3. Click-through from worst-error cards to the time series.

## Phase 7: Methodology page and polish (1h)
1. Write methodology content.
2. Run design-taste-skill review and emil-design-engineering interaction polish on each screen.
3. Accessibility pass (ui-ux-pro-max): keyboard, contrast, aria labels.

## Phase 8: Docker (0.75h)
1. Backend and frontend Dockerfiles, `docker-compose.yml`.
2. Verify `docker compose up` works from a clean clone.

## Phase 9: Vercel deployment (1h)
1. `api/index.py`, `vercel.json` (routes, includeFiles for data).
2. Deploy, test all endpoints and views on the live URL, check cold start time.
3. Open the URL in incognito to verify public access.

## Phase 10: README and video (1.5h)
1. README: directory details, how to run (Docker and local), Vercel link, design decisions, AI-tools disclosure.
2. Video (max 10 min): Part 1 client pitch (about 5 min: problem, forecast view, accuracy findings, how to use the buffer); Part 2 tech review (about 5 min: architecture, cutoff logic, tests, no-database decision, deployment). Upload as unlisted on YouTube.
3. Create public repo with an anonymous name, push, verify in incognito, then submit the form.

## Definition of done
All endpoints tested, all three screens working on the live URL, Docker works from clean clone, README complete, video uploaded, repo public.