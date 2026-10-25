"""Backend settings."""

import os
from pathlib import Path
from zoneinfo import ZoneInfo

# Folder holding actuals.parquet, forecasts.parquet and meta.json.
# Override with the DATA_DIR environment variable (see backend/.env.example).
DATA_DIR = Path(os.environ.get("DATA_DIR") or Path(__file__).resolve().parent.parent / "data")

LONDON = ZoneInfo("Europe/London")

# Default decision cutoff: D-1 09:00 Europe/London.
DEFAULT_CUTOFF_DAYS_BEFORE = 1
DEFAULT_CUTOFF_HOUR = 9

# Forecasts were ingested up to this horizon; larger horizons cannot match.
MAX_HORIZON_HOURS = 48.0

# Responses cached per distinct parsed query.
CACHE_SIZE = 256

# WINDFOR forecasts are hourly; each value covers one hour.
FORECAST_RESOLUTION_HOURS = 1.0

# MAPE is only computed where the actual is at least this large.
MAPE_MIN_ACTUAL_MW = 100.0

HISTOGRAM_BIN_WIDTH_MW = 500.0

DECIMALS = 1
