"""Vercel entrypoint: exposes the FastAPI app from backend/ as a Python function.

vercel.json rewrites every /api/* request here; FastAPI routes them by path.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app  # noqa: E402

__all__ = ["app"]
