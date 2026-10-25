# Wind Forecast Decision Dashboard

Decision support for UK day-ahead power buyers: shows the latest national wind forecast available at decision time and how accurate wind forecasts have been (Elexon FUELHH + WINDFOR, January 2026). It does not place orders.

## Live app
TODO: Vercel URL

## Repository layout
TODO

## How to run
### Docker
TODO

### Local
TODO

## Data
Data is ingested once by `scripts/ingest.py` into Parquet files in `backend/data/`. The app never calls Elexon at request time. See `scripts/README.md`.

## Design decisions
- No database: the dataset is small and read-only, so Parquet files are loaded into memory at startup. A database would be introduced if ingestion became continuous.

## AI tools disclosure
TODO: describe AI tool usage (Claude Code was used to help build this project).
