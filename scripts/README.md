# Data ingestion

`ingest.py` fetches wind data from Elexon BMRS once and writes clean files to `backend/data/`. The backend never calls Elexon at request time.

```
backend/.venv/Scripts/python scripts/ingest.py    # Windows
backend/.venv/bin/python scripts/ingest.py        # macOS/Linux
```

## Files
| File | Role |
|---|---|
| `ingest.py` | Entry point: fetch, transform, validate, write |
| `config.py` | Endpoints, time windows, retry settings, output path |
| `models.py` | Pydantic models for raw Elexon records and `meta.json` |
| `elexon_client.py` | HTTP calls, 7-day chunking, retry with exponential backoff |
| `transform.py` | Records to clean DataFrames (dedupe, null drop, horizon filter) |
| `validation.py` | Table-level checks (uniqueness, sort order, horizon range) and the report |

## Elexon API (verified against the official OpenAPI spec)
Spec: `https://data.elexon.co.uk/swagger/v1/swagger.json` (the source behind https://bmrs.elexon.co.uk/api-documentation). Base URL: `https://data.elexon.co.uk/bmrs/api/v1`. No API key.

### WINDFOR: `GET /datasets/WINDFOR/stream`
| Param | Type | Notes |
|---|---|---|
| `publishDateTimeFrom` | date-time | Optional. ISO 8601 UTC, e.g. `2025-12-17T00:00:00Z` |
| `publishDateTimeTo` | date-time | Optional. Without both, only the latest forecast is returned |

Response: JSON array of `{dataset, publishTime, startTime, generation}`. `generation` is an integer MW.

Observed: forecasts are **hourly** (`startTime` always on the hour), published every 2-4 hours at :30, 73 target hours per publish. Horizons range from -25.5 h to 66.5 h before filtering.

### FUELHH: `GET /datasets/FUELHH/stream`
| Param | Type | Notes |
|---|---|---|
| `settlementDateFrom` | date | `yyyy-MM-dd`. Cannot be combined with publish params |
| `settlementDateTo` | date | `yyyy-MM-dd` |
| `fuelType` | string[] | `WIND` |
| `settlementPeriod` | int[] | Not used |
| `publishDateTimeFrom` / `publishDateTimeTo` | date-time | Not used (settlement dates are used instead) |

Response: JSON array of `{dataset, publishTime, startTime, settlementDate, settlementPeriod, fuelType, generation}`. Half-hourly.

### Pagination and volume
Stream endpoints return the whole window in one array, with no paging. A single 46-day WINDFOR request (about 3 MB) returned the same rows as 7-day requests. The script still requests 7-day chunks with retry and backoff so one failure doesn't lose the whole run.

## Windows
- Forecasts: published 2025-12-17T00:00Z to 2026-02-01T00:00Z, then kept only where `0 <= start_time - publish_time <= 48 h`.
- Actuals: settlement dates 2025-12-31 to 2026-02-01 (January plus one day each side).
