"""FastAPI dependencies: repository access and data-range checks on queries."""

from datetime import date
from typing import Annotated

from fastapi import Depends, HTTPException, Query, Request

from app.models import MetaResponse
from app.queries import ForecastQuery, RangeQuery
from app.services.data_store import WindDataRepository, load_repository


def get_repo(request: Request) -> WindDataRepository:
    """The repository loaded at startup (see main.lifespan).

    Loads it on first use if startup didn't run, as can happen on serverless
    platforms such as Vercel.
    """
    repo: WindDataRepository | None = getattr(request.app.state, "repo", None)
    if repo is None:
        repo = load_repository()
        request.app.state.repo = repo
    return repo


Repo = Annotated[WindDataRepository, Depends(get_repo)]


def _check_in_range(start: date, end: date, meta: MetaResponse) -> None:
    if start < meta.data_start or end > meta.data_end:
        raise HTTPException(
            status_code=404,
            detail=f"Dates must be between {meta.data_start} and {meta.data_end}",
        )


def forecast_query(query: Annotated[ForecastQuery, Query()], repo: Repo) -> ForecastQuery:
    _check_in_range(query.date, query.date, repo.meta())
    return query


def range_query(query: Annotated[RangeQuery, Query()], repo: Repo) -> RangeQuery:
    _check_in_range(query.start, query.end, repo.meta())
    return query
