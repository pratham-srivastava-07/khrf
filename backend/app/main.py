"""FastAPI app: loads data at startup, mounts routers under /api, maps errors."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.routers import accuracy, forecast, meta
from app.services.data_store import load_repository
from app.services.errors import NoDataError


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.repo = load_repository()
    yield


app = FastAPI(title="Wind Forecast Decision Dashboard API", lifespan=lifespan)

for module in (meta, forecast, accuracy):
    app.include_router(module.router, prefix="/api")


@app.exception_handler(RequestValidationError)
async def invalid_params(_: Request, exc: RequestValidationError) -> JSONResponse:
    """Invalid query params -> 400 with a single readable message."""
    messages = []
    for err in exc.errors():
        field = ".".join(str(p) for p in err["loc"] if p not in ("query", "body"))
        # Pydantic prefixes messages from custom validators with "Value error, ".
        msg = err["msg"].removeprefix("Value error, ")
        messages.append(f"{field}: {msg}" if field else msg)
    return JSONResponse(status_code=400, content={"detail": "; ".join(messages)})


@app.exception_handler(NoDataError)
async def no_data(_: Request, exc: NoDataError) -> JSONResponse:
    """Valid params that select nothing -> 400 (404 is kept for out-of-range dates)."""
    return JSONResponse(status_code=400, content={"detail": str(exc)})
