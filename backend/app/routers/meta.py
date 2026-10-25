from fastapi import APIRouter

from app.dependencies import Repo
from app.models import MetaResponse

router = APIRouter(tags=["meta"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/meta", response_model=MetaResponse)
def meta(repo: Repo) -> MetaResponse:
    return repo.meta()
