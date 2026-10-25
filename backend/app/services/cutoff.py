"""Decision cutoff rules and latest-forecast-before-cutoff selection."""

from datetime import date, datetime, time, timedelta, timezone

import pandas as pd

from app import config


def default_cutoff(delivery_date: date) -> datetime:
    """D-1 09:00 Europe/London for delivery day D, returned in UTC (DST-safe)."""
    decision_day = delivery_date - timedelta(days=config.DEFAULT_CUTOFF_DAYS_BEFORE)
    local = datetime.combine(decision_day, time(config.DEFAULT_CUTOFF_HOUR), tzinfo=config.LONDON)
    return local.astimezone(timezone.utc)


def delivery_day_bounds(delivery_date: date) -> tuple[datetime, datetime]:
    """UTC [start, end) of the Europe/London delivery day (23 or 25 hours on DST days)."""
    start = datetime.combine(delivery_date, time(0), tzinfo=config.LONDON)
    end = datetime.combine(delivery_date + timedelta(days=1), time(0), tzinfo=config.LONDON)
    return start.astimezone(timezone.utc), end.astimezone(timezone.utc)


def latest_per_target(forecasts: pd.DataFrame) -> pd.DataFrame:
    """Keep the most recently published row for each start_time, sorted by start_time."""
    if forecasts.empty:
        return forecasts.iloc[0:0].reset_index(drop=True)
    idx = forecasts.groupby("start_time")["publish_time"].idxmax()
    return forecasts.loc[idx].sort_values("start_time").reset_index(drop=True)


def latest_before_cutoff(
    forecasts: pd.DataFrame, start: datetime, end: datetime, cutoff: datetime
) -> pd.DataFrame:
    """For each start_time in [start, end), the forecast with the max publish_time <= cutoff.

    Target times with no forecast published by the cutoff are absent, never filled.
    """
    eligible = forecasts[
        (forecasts["start_time"] >= start)
        & (forecasts["start_time"] < end)
        & (forecasts["publish_time"] <= cutoff)
    ]
    return latest_per_target(eligible)
