"""Query-parameter models. Validation errors become HTTP 400 (see main.py).

Checks that need the loaded data (dates inside the available range) live
in dependencies.py, because these models know nothing about the data.
"""

import datetime as dt
from typing import Self

from pydantic import AwareDatetime, BaseModel, ConfigDict, field_validator, model_validator

from app import config
from app.models import Horizon


class _Query(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class ForecastQuery(_Query):
    date: dt.date
    # ISO 8601 with offset, e.g. 2026-01-14T09:00:00Z. Omitted -> D-1 09:00 London.
    cutoff: AwareDatetime | None = None

    @field_validator("cutoff")
    @classmethod
    def to_utc(cls, value: dt.datetime | None) -> dt.datetime | None:
        return value.astimezone(dt.timezone.utc) if value is not None else None


class RangeQuery(_Query):
    start: dt.date
    end: dt.date
    # Hours ahead (0-48) or "cutoff" for the daily decision cutoff.
    horizon: Horizon = "cutoff"

    @field_validator("horizon")
    @classmethod
    def horizon_in_range(cls, value: Horizon) -> Horizon:
        if value != "cutoff" and not 0 <= value <= config.MAX_HORIZON_HOURS:
            raise ValueError(f"must be 'cutoff' or between 0 and {config.MAX_HORIZON_HOURS:g} hours")
        return value

    @model_validator(mode="after")
    def end_not_before_start(self) -> Self:
        if self.end < self.start:
            raise ValueError("end must not be before start")
        return self
