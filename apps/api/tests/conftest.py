import pytest

from app.core.config import get_settings


@pytest.fixture(autouse=True)
def force_test_environment(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("APP_ENV", "local")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
