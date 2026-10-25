"""Turn validated Elexon records into the clean tables in docs/schema.md."""

import math

import pandas as pd

from models import FuelGenerationRecord, WindForecastRecord


def actuals_frame(records: list[FuelGenerationRecord], log: dict[str, int]) -> pd.DataFrame:
    """One row per settlement-period start_time, WIND only."""
    df = pd.DataFrame(
        [
            {"start_time": r.start_time, "generation_mw": r.generation_mw}
            for r in records
            # Defensive: the request already filters fuelType=WIND.
            if r.fuel_type == "WIND"
        ],
        columns=["start_time", "generation_mw"],
    )
    df["start_time"] = pd.to_datetime(df["start_time"], utc=True)
    df["generation_mw"] = df["generation_mw"].astype("float64")
    log["actuals_raw"] = len(records)

    log["actuals_null_dropped"] = int(df["generation_mw"].isna().sum())
    df = df.dropna(subset=["generation_mw"])

    before = len(df)
    # Chunks may overlap; keep the last value seen for each settlement period.
    df = df.drop_duplicates(subset=["start_time"], keep="last")
    log["actuals_duplicates_removed"] = before - len(df)

    return df.sort_values("start_time").reset_index(drop=True)


def forecasts_frame(
    records: list[WindForecastRecord], max_horizon_hours: float, log: dict[str, int]
) -> pd.DataFrame:
    """One row per (start_time, publish_time) with horizon in [0, max_horizon_hours]."""
    df = pd.DataFrame(
        [
            {"start_time": r.start_time, "publish_time": r.publish_time, "generation_mw": r.generation_mw}
            for r in records
        ],
        columns=["start_time", "publish_time", "generation_mw"],
    )
    df["start_time"] = pd.to_datetime(df["start_time"], utc=True)
    df["publish_time"] = pd.to_datetime(df["publish_time"], utc=True)
    df["generation_mw"] = df["generation_mw"].astype("float64")
    log["forecasts_raw"] = len(records)

    log["forecasts_null_dropped"] = int(df["generation_mw"].isna().sum())
    df = df.dropna(subset=["generation_mw"])

    before = len(df)
    df = df.drop_duplicates(subset=["start_time", "publish_time"], keep="last")
    log["forecasts_duplicates_removed"] = before - len(df)

    horizon = (df["start_time"] - df["publish_time"]).dt.total_seconds() / 3600.0
    log["forecasts_negative_horizon_dropped"] = int((horizon < 0).sum())
    log["forecasts_over_max_horizon_dropped"] = int((horizon > max_horizon_hours).sum())
    keep = (horizon >= 0) & (horizon <= max_horizon_hours)
    df = df[keep].assign(horizon_hours=horizon[keep].astype("float32"))

    return df.sort_values(["start_time", "publish_time"]).reset_index(drop=True)


def max_horizon_hours(forecasts: pd.DataFrame, actuals: pd.DataFrame) -> int:
    """Largest whole-hour horizon with a forecast whose target time has an actual."""
    paired = forecasts[forecasts["start_time"].isin(actuals["start_time"])]
    if paired.empty:
        raise ValueError("No forecasts pair with actuals")
    return math.floor(paired["horizon_hours"].max())
