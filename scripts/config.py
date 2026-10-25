"""Ingestion settings: source endpoints, time windows and output paths."""

from datetime import date, datetime, timedelta, timezone
from pathlib import Path

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1"
WINDFOR_PATH = "/datasets/WINDFOR/stream"
FUELHH_PATH = "/datasets/FUELHH/stream"

DATA_DIR = Path(__file__).resolve().parent.parent / "backend" / "data"

# Delivery days covered by the dashboard.
DATA_START = date(2026, 1, 1)
DATA_END = date(2026, 1, 31)

# Forecasts: published from 14 days before the first delivery day
# through the end of the last delivery day (UTC).
FORECAST_PUBLISH_FROM = datetime(2025, 12, 17, tzinfo=timezone.utc)
FORECAST_PUBLISH_TO = datetime(2026, 2, 1, tzinfo=timezone.utc)
MAX_HORIZON_HOURS = 48.0

# Actuals: settlement dates with a one-day margin each side.
ACTUALS_FROM = DATA_START - timedelta(days=1)
ACTUALS_TO = DATA_END + timedelta(days=1)

CHUNK_DAYS = 7
MAX_RETRIES = 4
BACKOFF_SECONDS = 2.0
TIMEOUT_SECONDS = 60.0

# Horizon options offered in the UI. Ingest appends the largest horizon the
# data supports (see transform.max_horizon_hours).
HORIZONS = [4, 12, 24, 36]
DEFAULT_CUTOFF_RULE = "D-1 09:00 Europe/London"
