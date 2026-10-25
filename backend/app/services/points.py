"""Builds chart points from a forecast selection and actuals."""

import pandas as pd

from app.models import Point


def _value(v: object) -> float | None:
    return None if pd.isna(v) else float(v)


def to_points(selected: pd.DataFrame, actuals: pd.DataFrame) -> list[Point]:
    """Outer join on start_time: a time missing on either side becomes null, never zero."""
    merged = pd.merge(
        selected[["start_time", "publish_time", "generation_mw"]].rename(
            columns={"generation_mw": "forecast_mw"}
        ),
        actuals[["start_time", "generation_mw"]].rename(columns={"generation_mw": "actual_mw"}),
        on="start_time",
        how="outer",
    ).sort_values("start_time")
    return [
        Point(
            time=row.start_time.to_pydatetime(),
            forecast_mw=_value(row.forecast_mw),
            actual_mw=_value(row.actual_mw),
            publish_time=None if pd.isna(row.publish_time) else row.publish_time.to_pydatetime(),
        )
        for row in merged.itertuples(index=False)
    ]
