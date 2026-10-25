"""API response models (docs/schema.md section 6), mirrored in frontend/src/types/api.ts.

Services build these with full-precision values; MW fields are rounded only
when serialized to JSON.
"""

import datetime as dt
from typing import Annotated, Literal

from pydantic import AwareDatetime, BaseModel, PlainSerializer

from app import config


def _round(value: float) -> float:
    return round(value, config.DECIMALS)


# Rounded to config.DECIMALS in JSON output only.
MW = Annotated[float, PlainSerializer(_round, return_type=float)]

# Forecast horizon in hours, or "cutoff" for the daily decision cutoff.
Horizon = float | Literal["cutoff"]


class Point(BaseModel):
    time: AwareDatetime
    forecast_mw: MW | None
    actual_mw: MW | None
    publish_time: AwareDatetime | None


class ForecastSummary(BaseModel):
    peak_mw: MW
    min_mw: MW
    avg_mw: MW
    total_mwh: MW


class ForecastResponse(BaseModel):
    date: dt.date
    cutoff_utc: AwareDatetime
    forecast_as_of_min: AwareDatetime
    forecast_as_of_max: AwareDatetime
    points: list[Point]
    summary: ForecastSummary


class ExtremeError(BaseModel):
    time: AwareDatetime
    error_mw: MW


class Metrics(BaseModel):
    mae: MW
    rmse: MW
    bias: MW
    mape: MW | None  # percent; None when no actual >= MAPE_MIN_ACTUAL_MW
    p90_abs_error: MW
    worst_over: ExtremeError | None  # None when nothing was over-forecast
    worst_under: ExtremeError | None  # None when nothing was under-forecast
    n_points: int


class HourError(BaseModel):
    hour: int  # hour of day, Europe/London
    mae: MW
    bias: MW


class HistogramBin(BaseModel):
    bin_start: MW
    bin_end: MW
    count: int


class HorizonError(BaseModel):
    horizon: float
    mae: MW
    rmse: MW


class AccuracyResponse(BaseModel):
    start: dt.date
    end: dt.date
    horizon: Horizon
    metrics: Metrics
    by_hour: list[HourError]
    histogram: list[HistogramBin]
    by_horizon: list[HorizonError]


class TimeseriesResponse(BaseModel):
    start: dt.date
    end: dt.date
    horizon: Horizon
    points: list[Point]


class RowCounts(BaseModel):
    actuals: int
    forecasts: int


class MetaResponse(BaseModel):
    data_start: dt.date
    data_end: dt.date
    default_cutoff_rule: str
    horizons: list[float]
    ingested_at: AwareDatetime
    row_counts: RowCounts
