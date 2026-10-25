"""Data access: the repository interface and its Parquet implementation.

Services never read files; they receive DataFrames from a WindDataRepository.
Swapping Parquet for a database means writing another implementation.
"""

from pathlib import Path
from typing import Protocol

import pandas as pd

from app import config
from app.models import MetaResponse


class WindDataRepository(Protocol):
    def forecasts(self) -> pd.DataFrame:
        """Columns: start_time, publish_time, generation_mw, horizon_hours (UTC)."""
        ...

    def actuals(self) -> pd.DataFrame:
        """Columns: start_time, generation_mw (UTC)."""
        ...

    def meta(self) -> MetaResponse: ...


class ParquetRepository:
    """Loads the ingested files into memory once, at construction."""

    def __init__(self, data_dir: Path) -> None:
        self._forecasts = pd.read_parquet(data_dir / "forecasts.parquet")
        self._actuals = pd.read_parquet(data_dir / "actuals.parquet")
        self._meta = MetaResponse.model_validate_json((data_dir / "meta.json").read_text(encoding="utf-8"))

    def forecasts(self) -> pd.DataFrame:
        return self._forecasts

    def actuals(self) -> pd.DataFrame:
        return self._actuals

    def meta(self) -> MetaResponse:
        return self._meta


def load_repository() -> WindDataRepository:
    """The repository the app uses, loaded from config.DATA_DIR."""
    return ParquetRepository(config.DATA_DIR)
