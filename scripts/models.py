"""Pydantic models for raw Elexon records and the ingest metadata file."""

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, TypeAdapter


class _ElexonRecord(BaseModel):
    model_config = ConfigDict(frozen=True, extra="ignore", populate_by_name=True)


class WindForecastRecord(_ElexonRecord):
    """One row of WINDFOR: forecast generation for one target time."""

    dataset: str = Field(pattern="^WINDFOR$")
    publish_time: AwareDatetime = Field(alias="publishTime")
    start_time: AwareDatetime = Field(alias="startTime")
    # Nullable so missing values can be counted and dropped, not rejected.
    generation_mw: float | None = Field(alias="generation", ge=0)


class FuelGenerationRecord(_ElexonRecord):
    """One row of FUELHH: half-hourly outturn for one fuel type."""

    dataset: str = Field(pattern="^FUELHH$")
    publish_time: AwareDatetime = Field(alias="publishTime")
    start_time: AwareDatetime = Field(alias="startTime")
    fuel_type: str = Field(alias="fuelType")
    generation_mw: float | None = Field(alias="generation", ge=0)


class RowCounts(BaseModel):
    actuals: int = Field(ge=0)
    forecasts: int = Field(ge=0)


class IngestMeta(BaseModel):
    """Contents of backend/data/meta.json (see docs/schema.md)."""

    data_start: str
    data_end: str
    default_cutoff_rule: str
    horizons: list[int]
    ingested_at: str
    row_counts: RowCounts


WindForecastBatch = TypeAdapter(list[WindForecastRecord])
FuelGenerationBatch = TypeAdapter(list[FuelGenerationRecord])
