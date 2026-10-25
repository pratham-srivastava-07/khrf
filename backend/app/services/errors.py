"""Service-level exceptions, mapped to HTTP errors by the routers."""


class NoDataError(ValueError):
    """Raised when a query matches no forecast or actual data."""
