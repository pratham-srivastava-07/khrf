from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies import Repo, range_query
from app.models import AccuracyResponse, TimeseriesResponse
from app.queries import RangeQuery
from app.services import cached

router = APIRouter(tags=["accuracy"])

Range = Annotated[RangeQuery, Depends(range_query)]


@router.get("/accuracy", response_model=AccuracyResponse)
def accuracy(query: Range, repo: Repo) -> AccuracyResponse:
    return cached.accuracy_for(repo, query.start, query.end, query.horizon)


@router.get("/timeseries", response_model=TimeseriesResponse)
def timeseries(query: Range, repo: Repo) -> TimeseriesResponse:
    return cached.timeseries_for(repo, query.start, query.end, query.horizon)
