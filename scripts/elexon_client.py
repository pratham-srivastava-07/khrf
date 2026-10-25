"""HTTP access to the Elexon BMRS stream endpoints, chunked with retry."""

import time
from collections.abc import Iterator
from datetime import date, datetime, timedelta

import httpx

import config
from models import (
    FuelGenerationBatch,
    FuelGenerationRecord,
    WindForecastBatch,
    WindForecastRecord,
)


def _iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def _get_json(client: httpx.Client, path: str, params: dict[str, str]) -> bytes:
    """GET with exponential backoff; returns the raw JSON body."""
    for attempt in range(1, config.MAX_RETRIES + 1):
        try:
            resp = client.get(f"{config.BASE_URL}{path}", params=params)
            resp.raise_for_status()
            return resp.content
        except httpx.HTTPError as exc:
            if attempt == config.MAX_RETRIES:
                raise
            wait = config.BACKOFF_SECONDS * 2 ** (attempt - 1)
            print(f"  retry {attempt}/{config.MAX_RETRIES - 1} {path} {params} in {wait:.0f}s: {exc}")
            time.sleep(wait)
    raise RuntimeError("unreachable")


def _datetime_chunks(start: datetime, end: datetime) -> Iterator[tuple[datetime, datetime]]:
    step = timedelta(days=config.CHUNK_DAYS)
    while start < end:
        chunk_end = min(start + step, end)
        yield start, chunk_end
        start = chunk_end


def _date_chunks(start: date, end: date) -> Iterator[tuple[date, date]]:
    """Inclusive date chunks of CHUNK_DAYS days."""
    while start <= end:
        chunk_end = min(start + timedelta(days=config.CHUNK_DAYS - 1), end)
        yield start, chunk_end
        start = chunk_end + timedelta(days=1)


def fetch_wind_forecasts(
    client: httpx.Client, publish_from: datetime, publish_to: datetime
) -> list[WindForecastRecord]:
    records: list[WindForecastRecord] = []
    for chunk_start, chunk_end in _datetime_chunks(publish_from, publish_to):
        params = {"publishDateTimeFrom": _iso(chunk_start), "publishDateTimeTo": _iso(chunk_end)}
        batch = WindForecastBatch.validate_json(_get_json(client, config.WINDFOR_PATH, params))
        print(f"  WINDFOR publish {_iso(chunk_start)} -> {_iso(chunk_end)}: {len(batch)} rows")
        records.extend(batch)
    return records


def fetch_wind_actuals(
    client: httpx.Client, settlement_from: date, settlement_to: date
) -> list[FuelGenerationRecord]:
    records: list[FuelGenerationRecord] = []
    for chunk_start, chunk_end in _date_chunks(settlement_from, settlement_to):
        params = {
            "settlementDateFrom": chunk_start.isoformat(),
            "settlementDateTo": chunk_end.isoformat(),
            "fuelType": "WIND",
        }
        batch = FuelGenerationBatch.validate_json(_get_json(client, config.FUELHH_PATH, params))
        print(f"  FUELHH settlement {chunk_start} -> {chunk_end}: {len(batch)} rows")
        records.extend(batch)
    return records
