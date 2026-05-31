from collections.abc import AsyncIterator
from pathlib import Path

import httpx
import pytest

from app import database
from app.database import Base, configure_database, init_database
from app.main import app
from app.models.entities import Order, ServiceCategory, User, seed_database


@pytest.fixture
async def client(tmp_path: Path) -> AsyncIterator[httpx.AsyncClient]:
    configure_database(f"sqlite:///{tmp_path / 'test.db'}")
    init_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as test_client:
        yield test_client


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


def test_seed_database_can_skip_demo_users_and_orders_for_production(tmp_path: Path) -> None:
    configure_database(f"sqlite:///{tmp_path / 'prod-like.db'}")
    Base.metadata.create_all(bind=database.engine)

    with database.SessionLocal() as db:
        seed_database(db, include_demo_data=False)

        assert db.query(ServiceCategory).count() >= 1
        assert db.query(User).count() == 0
        assert db.query(Order).count() == 0


@pytest.mark.anyio
async def test_api_responses_include_baseline_security_headers(client: httpx.AsyncClient) -> None:
    response = await client.get("/api/health")

    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "camera=()" in response.headers["permissions-policy"]


@pytest.mark.anyio
async def test_request_size_limit_keeps_local_upload_endpoint_available(
    client: httpx.AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from app.core.config import get_settings

    monkeypatch.setenv("MAX_REQUEST_BODY_BYTES", "4")
    get_settings.cache_clear()

    too_large_json = await client.post("/api/ai/polish-demand", content=b"12345", headers={"content-type": "application/json"})
    assert too_large_json.status_code == 413
    assert too_large_json.headers["x-content-type-options"] == "nosniff"

    unauthenticated_upload = await client.post("/api/uploads/local/orders/test/file.txt", content=b"12345")
    assert unauthenticated_upload.status_code == 401

    get_settings.cache_clear()
