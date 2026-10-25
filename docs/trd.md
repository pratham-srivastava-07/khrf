# TRD: Technical Requirements & Decisions

Decisions here are final. Do not substitute tools or add dependencies without asking.

## 1. Stack
| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript (strict), Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Data fetching | TanStack Query (React Query) |
| Routing | react-router-dom |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Data processing | pandas, pyarrow (Parquet) |
| Validation | Pydantic v2 |
| Testing | pytest (backend), Vitest + React Testing Library (frontend) |
| Lint/format | ruff (Python), ESLint + Prettier (TS) |
| Container | Docker, docker-compose |
| Deploy | Vercel (static frontend + FastAPI serverless function) |

## 2. No database
Dataset is small and read-only. Pre-ingested Parquet files committed to the repo are loaded into memory at backend startup. Note this reasoning in the README: a database would be introduced if ingestion became continuous.

## 3. Data sources (Elexon BMRS, no auth needed)
Base: `https://data.elexon.co.uk/bmrs/api/v1`
- Actuals: `GET /datasets/FUELHH/stream` with a publish/time window and `fuelType=WIND`.
- Forecasts: `GET /datasets/WINDFOR/stream` with a publish time window.
Verify exact query parameter names against the Elexon API docs in the first implementation step and record them in `scripts/README`. If a request window is too large, chunk it (e.g. 7 days) with retry and backoff.

## 4. Ingestion
- Script: `scripts/ingest.py`, run manually, never at request time.
- Window: forecasts needed for delivery days 2026-01-01 to 2026-01-31. Fetch forecasts published from 2025-12-17 (14 days before) through 2026-01-31, then keep only rows with horizon <= 48 h (startTime - publishTime). Actuals: 2026-01-01 to 2026-01-31 (plus a one-day margin).
- Output: `backend/data/actuals.parquet`, `backend/data/forecasts.parquet`, `backend/data/meta.json`.
- All timestamps stored as UTC, timezone-aware.
- Drop duplicates, sort, validate (see schema.md).

## 5. Core logic (backend/app/services)
- **Cutoff selection**: for each target startTime in the delivery day, choose the forecast row with the max publishTime where publishTime <= cutoff. Implement via sort + groupby-last or merge_asof; must be unit tested.
- **Default cutoff**: D-1 09:00 Europe/London converted to UTC (configurable via query param; DST-safe via zoneinfo).
- **Horizon accuracy**: horizon = startTime - publishTime in hours. For horizon h, use for each startTime the latest forecast with horizon >= h (i.e. published at or before startTime - h).
- **Metrics**: error = forecast - actual. MAE, RMSE, bias = mean(error), MAPE only where actual >= 100 MW, P90 of |error|, max over- and under-forecast with timestamps.
- Round outputs to 1 decimal place MW.

## 6. API contract (all JSON, prefix /api)
1. `GET /api/meta` -> available date range, default cutoff rule, horizons list.
2. `GET /api/forecast?date=YYYY-MM-DD&cutoff=ISO8601(optional)` -> decision-time forecast for the delivery day, with summary stats and actuals if present.
3. `GET /api/accuracy?start=YYYY-MM-DD&end=YYYY-MM-DD&horizon=<hours|cutoff>` -> metrics, error-by-hour, histogram bins, error-by-horizon.
4. `GET /api/timeseries?start=YYYY-MM-DD&end=YYYY-MM-DD&horizon=<hours|cutoff>` -> aligned forecast/actual points.
5. `GET /api/health` -> `{status: "ok"}`.

Errors: 400 for invalid params, 404 for out-of-range dates, JSON body `{detail: string}`. Response models defined in Pydantic; mirrored by hand-written TypeScript types in `frontend/src/types/api.ts`.

## 7. Repository layout
```
/
  CLAUDE.md
  README.md
  docs/            (these files)
  backend/
    app/ main.py, config.py, models.py, routers/, services/
    data/          (parquet + meta.json)
    tests/
    requirements.txt
    Dockerfile
  api/index.py     (Vercel entrypoint re-exporting FastAPI app)
  frontend/
    src/ api/, components/, pages/, hooks/, types/, lib/
    Dockerfile
  scripts/ingest.py
  docker-compose.yml
  vercel.json
```

## 8. Docker
- `docker compose up` starts backend (port 8000) and frontend dev server (port 5173) with Vite proxying `/api` to the backend.
- Backend image: python:3.11-slim. Frontend image: node:20-alpine.

## 9. Deployment (Vercel)
- Frontend built as static output. FastAPI exposed via `api/index.py`. Data files bundled via `includeFiles` in `vercel.json`.
- Keep the function bundle under Vercel's size limit; Parquet files should be a few MB at most.
- Frontend uses relative `/api` base URL in all environments.

## 10. Quality bars
- TypeScript strict, no `any`.
- Backend functions pure and typed; routers thin; logic in services.
- Tests: cutoff selection (including DST and missing data), each metric, and each endpoint happy path + one error path.
- No secrets required. No analytics.
- README must disclose AI tooling use.

## 11. Performance
All data in memory; precompute nothing at request time that takes >100 ms. Cache responses with `functools.lru_cache` on parsed parameters.