"""Table-level checks and the ingest validation report.

Row-level rules (types, UTC-aware timestamps, generation >= 0) are enforced
by the Pydantic models when records are parsed. This module covers rules
that span rows: uniqueness, sort order, horizon range and coverage.
"""

from datetime import date, timedelta

import pandas as pd

UTC_DTYPE = "datetime64[ns, UTC]"


def check_actuals(df: pd.DataFrame) -> list[str]:
    errors: list[str] = []
    if str(df["start_time"].dtype) != UTC_DTYPE:
        errors.append(f"actuals.start_time dtype is {df['start_time'].dtype}")
    if not df["start_time"].is_unique:
        errors.append("actuals.start_time is not unique")
    if not df["start_time"].is_monotonic_increasing:
        errors.append("actuals are not sorted by start_time")
    return errors


def check_forecasts(df: pd.DataFrame, max_horizon_hours: float) -> list[str]:
    errors: list[str] = []
    for col in ("start_time", "publish_time"):
        if str(df[col].dtype) != UTC_DTYPE:
            errors.append(f"forecasts.{col} dtype is {df[col].dtype}")
    if df.duplicated(["start_time", "publish_time"]).any():
        errors.append("forecasts (start_time, publish_time) is not unique")
    if not df.equals(df.sort_values(["start_time", "publish_time"])):
        errors.append("forecasts are not sorted by (start_time, publish_time)")
    h = df["horizon_hours"]
    if h.min() < 0 or h.max() > max_horizon_hours:
        errors.append(f"forecasts.horizon_hours outside [0, {max_horizon_hours}]: [{h.min()}, {h.max()}]")
    return errors


def _slots(start: date, end: date, freq: str) -> pd.DatetimeIndex:
    return pd.date_range(
        pd.Timestamp(start, tz="UTC"),
        pd.Timestamp(end + timedelta(days=1), tz="UTC"),
        freq=freq,
        inclusive="left",
    )


def _row(label: str, value: object) -> None:
    print(f"{label:42s} {value}")


def print_report(
    actuals: pd.DataFrame,
    forecasts: pd.DataFrame,
    log: dict[str, int],
    errors: list[str],
    data_start: date,
    data_end: date,
) -> None:
    print("\n=== Validation report ===")
    for key, value in log.items():
        _row(key, value)

    half_hours = _slots(data_start, data_end, "30min")
    in_range = actuals[actuals["start_time"].isin(half_hours)]
    gaps = half_hours.difference(in_range["start_time"])
    gen = actuals["generation_mw"]
    print("\n-- actuals.parquet")
    _row("rows (incl. margin days)", len(actuals))
    _row("start_time range", f"{actuals['start_time'].min()} -> {actuals['start_time'].max()}")
    _row("half-hours present in data range", f"{len(in_range)} / {len(half_hours)}")
    _row("half-hour gaps in data range", len(gaps))
    for ts in gaps[:10]:
        print(f"  gap: {ts}")
    _row("generation_mw min / mean / max", f"{gen.min():.0f} / {gen.mean():.0f} / {gen.max():.0f}")

    hours = _slots(data_start, data_end, "1h")
    targets = forecasts["start_time"].drop_duplicates()
    missing = hours.difference(targets)
    per_target = forecasts[forecasts["start_time"].isin(hours)].groupby("start_time").size()
    print("\n-- forecasts.parquet")
    _row("rows", len(forecasts))
    _row("publish_time range", f"{forecasts['publish_time'].min()} -> {forecasts['publish_time'].max()}")
    _row("start_time range", f"{forecasts['start_time'].min()} -> {forecasts['start_time'].max()}")
    _row("distinct publish times", forecasts["publish_time"].nunique())
    _row("start_time minute values (resolution)", sorted(targets.dt.minute.unique().tolist()))
    _row("horizon_hours min / max", f"{forecasts['horizon_hours'].min():.1f} / {forecasts['horizon_hours'].max():.1f}")
    _row("target hours covered in data range", f"{len(hours) - len(missing)} / {len(hours)}")
    for ts in missing[:10]:
        print(f"  gap: {ts}")
    _row(
        "forecasts per target hour",
        f"min {per_target.min()} / median {per_target.median():.0f} / max {per_target.max()}",
    )

    print("\n-- schema constraints")
    print("OK" if not errors else "\n".join(f"FAIL: {e}" for e in errors))
