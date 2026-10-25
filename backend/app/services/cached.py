"""Cached entry points for the routers.

Wraps the pure services with lru_cache keyed on the repository and the
parsed query values. The services themselves stay uncached.
"""

from datetime import date, datetime
from functools import lru_cache

from app import config
from app.models import AccuracyResponse, ForecastResponse, Horizon, TimeseriesResponse
from app.services import accuracy, forecast
from app.services.data_store import WindDataRepository


@lru_cache(maxsize=config.CACHE_SIZE)
def forecast_for(repo: WindDataRepository, delivery_date: date, cutoff: datetime | None) -> ForecastResponse:
    return forecast.decision_forecast(repo.forecasts(), repo.actuals(), delivery_date, cutoff)


@lru_cache(maxsize=config.CACHE_SIZE)
def accuracy_for(repo: WindDataRepository, start: date, end: date, horizon: Horizon) -> AccuracyResponse:
    return accuracy.accuracy_report(
        repo.forecasts(), repo.actuals(), start, end, horizon, repo.meta().horizons
    )


@lru_cache(maxsize=config.CACHE_SIZE)
def timeseries_for(repo: WindDataRepository, start: date, end: date, horizon: Horizon) -> TimeseriesResponse:
    return accuracy.timeseries(repo.forecasts(), repo.actuals(), start, end, horizon)
