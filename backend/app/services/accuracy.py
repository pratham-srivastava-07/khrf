"""Forecast selection by horizon, forecast/actual alignment and accuracy metrics."""

from datetime import date, datetime, timedelta

import numpy as np
import pandas as pd

from app import config
from app.models import (
    AccuracyResponse,
    ExtremeError,
    HistogramBin,
    Horizon,
    HorizonError,
    HourError,
    Metrics,
    TimeseriesResponse,
)
from app.services.cutoff import (
    default_cutoff,
    delivery_day_bounds,
    latest_before_cutoff,
    latest_per_target,
)
from app.services.errors import NoDataError
from app.services.points import to_points

ALIGNED_COLUMNS = [
    "start_time",
    "publish_time",
    "horizon_hours",
    "forecast_mw",
    "actual_mw",
    "error_mw",
    "abs_error_mw",
]


def range_bounds(start_date: date, end_date: date) -> tuple[datetime, datetime]:
    """UTC [start, end) covering London delivery days start_date..end_date inclusive."""
    return delivery_day_bounds(start_date)[0], delivery_day_bounds(end_date)[1]


def select_at_horizon(
    forecasts: pd.DataFrame, start: datetime, end: datetime, horizon_hours: float
) -> pd.DataFrame:
    """For each start_time in [start, end), the latest forecast published >= horizon_hours before it."""
    eligible = forecasts[
        (forecasts["start_time"] >= start)
        & (forecasts["start_time"] < end)
        & (forecasts["horizon_hours"] >= horizon_hours)
    ]
    return latest_per_target(eligible)


def select_at_daily_cutoff(forecasts: pd.DataFrame, start_date: date, end_date: date) -> pd.DataFrame:
    """For each delivery day, the forecast available at that day's default cutoff."""
    days = []
    day = start_date
    while day <= end_date:
        start, end = delivery_day_bounds(day)
        days.append(latest_before_cutoff(forecasts, start, end, default_cutoff(day)))
        day += timedelta(days=1)
    return pd.concat(days, ignore_index=True)


def select(forecasts: pd.DataFrame, start_date: date, end_date: date, horizon: Horizon) -> pd.DataFrame:
    if horizon == "cutoff":
        return select_at_daily_cutoff(forecasts, start_date, end_date)
    start, end = range_bounds(start_date, end_date)
    return select_at_horizon(forecasts, start, end, horizon)


def _require_forecasts(selected: pd.DataFrame, start_date: date, end_date: date, horizon: Horizon) -> None:
    if not selected.empty:
        return
    if horizon == "cutoff":
        raise NoDataError(f"No forecasts published before the decision cutoff for {start_date} to {end_date}")
    raise NoDataError(f"No forecasts published at least {horizon:g} hours ahead for {start_date} to {end_date}")


def align(selected: pd.DataFrame, actuals: pd.DataFrame) -> pd.DataFrame:
    """Pair forecasts with actuals at the same start_time; unmatched times are dropped."""
    merged = selected.rename(columns={"generation_mw": "forecast_mw"}).merge(
        actuals[["start_time", "generation_mw"]].rename(columns={"generation_mw": "actual_mw"}),
        on="start_time",
        how="inner",
    )
    merged["error_mw"] = merged["forecast_mw"] - merged["actual_mw"]
    merged["abs_error_mw"] = merged["error_mw"].abs()
    return merged[ALIGNED_COLUMNS].sort_values("start_time").reset_index(drop=True)


def _rmse(error: pd.Series) -> float:
    return float(np.sqrt((error**2).mean()))


def compute_metrics(aligned: pd.DataFrame) -> Metrics:
    """error = forecast - actual. MAPE only where actual >= MAPE_MIN_ACTUAL_MW."""
    if aligned.empty:
        raise NoDataError("No aligned forecast/actual points")
    err = aligned["error_mw"]
    abs_err = aligned["abs_error_mw"]

    mape_rows = aligned[aligned["actual_mw"] >= config.MAPE_MIN_ACTUAL_MW]
    mape = (
        float((mape_rows["abs_error_mw"] / mape_rows["actual_mw"]).mean() * 100)
        if not mape_rows.empty
        else None
    )

    over = aligned.loc[err.idxmax()]
    under = aligned.loc[err.idxmin()]
    return Metrics(
        mae=float(abs_err.mean()),
        rmse=_rmse(err),
        bias=float(err.mean()),
        mape=mape,
        p90_abs_error=float(np.percentile(abs_err, 90)),
        worst_over=(
            ExtremeError(time=over["start_time"].to_pydatetime(), error_mw=float(over["error_mw"]))
            if over["error_mw"] > 0
            else None
        ),
        worst_under=(
            ExtremeError(time=under["start_time"].to_pydatetime(), error_mw=float(under["error_mw"]))
            if under["error_mw"] < 0
            else None
        ),
        n_points=len(aligned),
    )


def error_by_hour(aligned: pd.DataFrame) -> list[HourError]:
    """MAE and bias by hour of day in Europe/London."""
    hours = aligned["start_time"].dt.tz_convert(config.LONDON).dt.hour
    return [
        HourError(hour=int(h), mae=float(g["abs_error_mw"].mean()), bias=float(g["error_mw"].mean()))
        for h, g in aligned.groupby(hours)
    ]


def error_histogram(
    aligned: pd.DataFrame, bin_width: float = config.HISTOGRAM_BIN_WIDTH_MW
) -> list[HistogramBin]:
    """Counts of error_mw in fixed-width bins aligned to multiples of bin_width."""
    if aligned.empty:
        return []
    err = aligned["error_mw"].to_numpy()
    lo = np.floor(err.min() / bin_width) * bin_width
    hi = np.floor(err.max() / bin_width) * bin_width + bin_width
    edges = np.arange(lo, hi + bin_width / 2, bin_width)
    counts, _ = np.histogram(err, bins=edges)
    return [
        HistogramBin(bin_start=float(edges[i]), bin_end=float(edges[i + 1]), count=int(c))
        for i, c in enumerate(counts)
    ]


def error_by_horizon(
    forecasts: pd.DataFrame,
    actuals: pd.DataFrame,
    start_date: date,
    end_date: date,
    horizons: list[float],
) -> list[HorizonError]:
    """MAE and RMSE per horizon; horizons with no aligned points are omitted."""
    start, end = range_bounds(start_date, end_date)
    result = []
    for h in horizons:
        aligned = align(select_at_horizon(forecasts, start, end, h), actuals)
        if not aligned.empty:
            result.append(
                HorizonError(horizon=h, mae=float(aligned["abs_error_mw"].mean()), rmse=_rmse(aligned["error_mw"]))
            )
    return result


def accuracy_report(
    forecasts: pd.DataFrame,
    actuals: pd.DataFrame,
    start_date: date,
    end_date: date,
    horizon: Horizon,
    horizons: list[float],
) -> AccuracyResponse:
    selected = select(forecasts, start_date, end_date, horizon)
    _require_forecasts(selected, start_date, end_date, horizon)
    aligned = align(selected, actuals)
    if aligned.empty:
        raise NoDataError(f"No actuals to compare against for {start_date} to {end_date}")
    return AccuracyResponse(
        start=start_date,
        end=end_date,
        horizon=horizon,
        metrics=compute_metrics(aligned),
        by_hour=error_by_hour(aligned),
        histogram=error_histogram(aligned),
        by_horizon=error_by_horizon(forecasts, actuals, start_date, end_date, horizons),
    )


def timeseries(
    forecasts: pd.DataFrame,
    actuals: pd.DataFrame,
    start_date: date,
    end_date: date,
    horizon: Horizon,
) -> TimeseriesResponse:
    """Forecast at the given horizon and actuals over the range; gaps stay null."""
    start, end = range_bounds(start_date, end_date)
    selected = select(forecasts, start_date, end_date, horizon)
    _require_forecasts(selected, start_date, end_date, horizon)
    range_actuals = actuals[(actuals["start_time"] >= start) & (actuals["start_time"] < end)]
    return TimeseriesResponse(
        start=start_date,
        end=end_date,
        horizon=horizon,
        points=to_points(selected, range_actuals),
    )
