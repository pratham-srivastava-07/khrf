"""Decision-time forecast for one delivery day."""

from datetime import date, datetime

import pandas as pd

from app import config
from app.models import ForecastResponse, ForecastSummary
from app.services.cutoff import default_cutoff, delivery_day_bounds, latest_before_cutoff
from app.services.errors import NoDataError
from app.services.points import to_points


def summarize(selected: pd.DataFrame) -> ForecastSummary:
    gen = selected["generation_mw"]
    return ForecastSummary(
        peak_mw=float(gen.max()),
        min_mw=float(gen.min()),
        avg_mw=float(gen.mean()),
        total_mwh=float(gen.sum() * config.FORECAST_RESOLUTION_HOURS),
    )


def decision_forecast(
    forecasts: pd.DataFrame,
    actuals: pd.DataFrame,
    delivery_date: date,
    cutoff: datetime | None = None,
) -> ForecastResponse:
    """Latest forecast available at the cutoff for each target time of the delivery day.

    cutoff defaults to D-1 09:00 Europe/London.
    """
    cutoff_utc = cutoff if cutoff is not None else default_cutoff(delivery_date)
    start, end = delivery_day_bounds(delivery_date)

    selected = latest_before_cutoff(forecasts, start, end, cutoff_utc)
    if selected.empty:
        raise NoDataError(f"No forecast published by {cutoff_utc.isoformat()} for {delivery_date}")

    day_actuals = actuals[(actuals["start_time"] >= start) & (actuals["start_time"] < end)]
    return ForecastResponse(
        date=delivery_date,
        cutoff_utc=cutoff_utc,
        forecast_as_of_min=selected["publish_time"].min().to_pydatetime(),
        forecast_as_of_max=selected["publish_time"].max().to_pydatetime(),
        points=to_points(selected, day_actuals),
        summary=summarize(selected),
    )
