"""Ingest Elexon wind data into Parquet files for the dashboard.

Run manually, never at request time:
    backend/.venv/Scripts/python scripts/ingest.py

Writes backend/data/actuals.parquet, forecasts.parquet and meta.json,
and prints a validation report. See scripts/README.md for API details.
"""

import sys
from datetime import datetime, timezone

import httpx

import config
import transform
import validation
from elexon_client import fetch_wind_actuals, fetch_wind_forecasts
from models import IngestMeta, RowCounts


def main() -> int:
    print("Fetching from Elexon BMRS...")
    with httpx.Client(timeout=config.TIMEOUT_SECONDS) as client:
        forecast_records = fetch_wind_forecasts(
            client, config.FORECAST_PUBLISH_FROM, config.FORECAST_PUBLISH_TO
        )
        actual_records = fetch_wind_actuals(client, config.ACTUALS_FROM, config.ACTUALS_TO)

    log: dict[str, int] = {}
    actuals = transform.actuals_frame(actual_records, log)
    forecasts = transform.forecasts_frame(forecast_records, config.MAX_HORIZON_HOURS, log)

    errors = validation.check_actuals(actuals) + validation.check_forecasts(
        forecasts, config.MAX_HORIZON_HOURS
    )
    validation.print_report(actuals, forecasts, log, errors, config.DATA_START, config.DATA_END)
    if errors:
        print("\nValidation failed; files not written.")
        return 1

    meta = IngestMeta(
        data_start=config.DATA_START.isoformat(),
        data_end=config.DATA_END.isoformat(),
        default_cutoff_rule=config.DEFAULT_CUTOFF_RULE,
        horizons=config.HORIZONS + [transform.max_horizon_hours(forecasts, actuals)],
        ingested_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        row_counts=RowCounts(actuals=len(actuals), forecasts=len(forecasts)),
    )

    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    actuals.to_parquet(config.DATA_DIR / "actuals.parquet", index=False)
    forecasts.to_parquet(config.DATA_DIR / "forecasts.parquet", index=False)
    (config.DATA_DIR / "meta.json").write_text(meta.model_dump_json(indent=2) + "\n", encoding="utf-8")

    print(f"\nhorizons written to meta.json             {meta.horizons}")
    print("\n-- output files")
    for name in ("actuals.parquet", "forecasts.parquet", "meta.json"):
        print(f"{name:42s} {(config.DATA_DIR / name).stat().st_size / 1024:.1f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
