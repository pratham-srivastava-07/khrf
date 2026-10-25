from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies import Repo, forecast_query
from app.models import ForecastResponse
from app.queries import ForecastQuery
from app.services import cached

router = APIRouter(tags=["forecast"])


@router.get("/forecast", response_model=ForecastResponse)
def forecast(query: Annotated[ForecastQuery, Depends(forecast_query)], repo: Repo) -> ForecastResponse:
    return cached.forecast_for(repo, query.date, query.cutoff)
