from collections.abc import AsyncIterator
from pathlib import Path

import httpx
import pytest
from sqlalchemy import text

from app import database
from app.core.config import get_settings
from app.database import configure_database, init_database
from app.main import app
from app.models.entities import User
from tests.auth_helpers import (
    code_from_event_body,
    latest_email_event,
    register_user,
    request_email_verification_code,
    request_password_reset_code,
)


@pytest.fixture
async def client(tmp_path: Path) -> AsyncIterator[httpx.AsyncClient]:
    configure_database(f"sqlite:///{tmp_path / 'test.db'}")
    init_database()
    transport = httpx.ASGITransport(app=app, client=("203.0.113.10", 443))
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as test_client:
        yield test_client


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture(autouse=True)
def reset_mail_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("MAIL_PROVIDER", "")
    monkeypatch.setenv("MAIL_FROM", "")
    monkeypatch.setenv("MAIL_REPLY_TO", "")
    monkeypatch.setenv("SMTP_HOST", "")
    monkeypatch.setenv("SMTP_PORT", "587")
    monkeypatch.setenv("SMTP_USERNAME", "")
    monkeypatch.setenv("SMTP_PASSWORD", "")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def security_actions() -> list[str]:
    with database.SessionLocal() as db:
        rows = db.execute(text("select action from security_audit_logs order by created_at asc")).all()
        return [row[0] for row in rows]


@pytest.mark.anyio
async def test_registration_rejects_weak_passwords_and_records_security_audit(client: httpx.AsyncClient) -> None:
    for target_email in ("weak@example.com", "same@example.com"):
        send = await client.post("/api/auth/register/send-code", json={"email": target_email})
        assert send.status_code == 202

    weak = await client.post(
        "/api/auth/register",
        json={"email": "weak@example.com", "password": "password", "displayName": "弱密码", "verificationCode": "000000"},
    )
    assert weak.status_code == 422
    assert "密码" in weak.json()["detail"]

    email_as_password = await client.post(
        "/api/auth/register",
        json={"email": "same@example.com", "password": "same@example.com", "displayName": "邮箱当密码", "verificationCode": "000000"},
    )
    assert email_as_password.status_code == 422

    with database.SessionLocal() as db:
        assert db.query(User).filter(User.email == "weak@example.com").first() is None

    assert "auth.register.weak_password" in security_actions()


@pytest.mark.anyio
async def test_failed_login_locks_account_without_revealing_email_existence(client: httpx.AsyncClient) -> None:
    for _ in range(5):
        failure = await client.post("/api/auth/login", json={"email": "demo@kuli.local", "password": "wrong-password"})
        assert failure.status_code == 401
        assert failure.json()["detail"] == "邮箱或密码不正确"

    locked = await client.post("/api/auth/login", json={"email": "demo@kuli.local", "password": "KuliUser123!"})
    assert locked.status_code == 423
    assert locked.json()["detail"] == "登录尝试过多，请稍后再试"

    unknown = await client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "whatever"})
    assert unknown.status_code == 401
    assert unknown.json()["detail"] == "邮箱或密码不正确"

    actions = security_actions()
    assert actions.count("auth.login.failed") >= 5
    assert "auth.login.locked" in actions


@pytest.mark.anyio
async def test_login_rejects_unverified_accounts(client: httpx.AsyncClient) -> None:
    with database.SessionLocal() as db:
        user = db.query(User).filter(User.email == "demo@kuli.local").first()
        assert user is not None
        user.email_verified_at = None
        db.commit()

    response = await client.post("/api/auth/login", json={"email": "demo@kuli.local", "password": "KuliUser123!"})
    assert response.status_code == 403
    assert "邮箱尚未验证" in response.json()["detail"]

    actions = security_actions()
    assert "auth.login.unverified" in actions


@pytest.mark.anyio
async def test_registration_and_agent_chat_are_rate_limited_per_ip_or_visitor(client: httpx.AsyncClient) -> None:
    for index in range(2):
        created = await register_user(
            client,
            email=f"burst-{index}@example.com",
            password=f"BurstPass{index}9",
            display_name=f"Burst {index}",
        )
        assert created.status_code == 201

    limited_register = await client.post("/api/auth/register/send-code", json={"email": "burst-locked@example.com"})
    assert limited_register.status_code == 403
    assert "注册账号过多" in limited_register.json()["detail"]

    session = await client.post("/api/agent/sessions", json={"pagePath": "/", "visitorId": "visitor-rate-limit"})
    assert session.status_code == 201
    for _ in range(5):
        ok = await client.post(
            "/api/agent/chat",
            json={"sessionId": session.json()["session"]["id"], "message": "你们能帮我做什么？"},
        )
        assert ok.status_code == 200

    limited_chat = await client.post(
        "/api/agent/chat",
        json={"sessionId": session.json()["session"]["id"], "message": "还能继续问吗？"},
    )
    assert limited_chat.status_code == 429
    assert limited_chat.json()["detail"] == "小酷今天被问得有点多，请稍后再试"

    actions = security_actions()
    assert "auth.register.ip_account_limited" in actions
    assert "agent.chat.rate_limited" in actions


@pytest.mark.anyio
async def test_email_verification_request_and_confirm_works_without_current_session(client: httpx.AsyncClient) -> None:
    with database.SessionLocal() as db:
        user = db.query(User).filter(User.email == "demo@kuli.local").first()
        assert user is not None
        user.email_verified_at = None
        db.commit()

    blocked_login = await client.post("/api/auth/login", json={"email": "demo@kuli.local", "password": "KuliUser123!"})
    assert blocked_login.status_code == 403
    assert "邮箱尚未验证" in blocked_login.json()["detail"]

    request = await request_email_verification_code(client, "demo@kuli.local")
    assert request.status_code == 202
    assert request.json()["ok"] is True

    event = latest_email_event("email_verification", "demo@kuli.local")
    assert event["status"] == "pending"
    assert "验证" in str(event["subject"])

    confirm = await client.post(
        "/api/auth/email-verification/confirm",
        json={"email": "demo@kuli.local", "verificationCode": code_from_event_body(str(event["body"]))},
    )
    assert confirm.status_code == 200
    assert confirm.json()["ok"] is True

    login = await client.post("/api/auth/login", json={"email": "demo@kuli.local", "password": "KuliUser123!"})
    assert login.status_code == 200

    with database.SessionLocal() as db:
        refreshed = db.query(User).filter(User.email == "demo@kuli.local").first()
        assert refreshed is not None
        assert refreshed.email_verified_at

    actions = security_actions()
    assert "auth.login.unverified" in actions
    assert "auth.email_verification.requested" in actions
    assert "auth.email_verification.confirmed" in actions


@pytest.mark.anyio
async def test_password_reset_does_not_reveal_email_and_rotates_password(client: httpx.AsyncClient) -> None:
    request = await request_password_reset_code(client, "demo@kuli.local")
    assert request.status_code == 202
    assert request.json()["ok"] is True

    unknown = await request_password_reset_code(client, "missing@example.com")
    assert unknown.status_code == 202
    assert unknown.json()["message"] == request.json()["message"]

    event = latest_email_event("password_reset_code", "demo@kuli.local")
    assert event["status"] == "pending"
    assert "验证码" in str(event["subject"])

    reset_code = code_from_event_body(str(event["body"]))
    weak = await client.post(
        "/api/auth/password-reset/confirm",
        json={"email": "demo@kuli.local", "verificationCode": reset_code, "password": "password"},
    )
    assert weak.status_code == 422

    confirm = await client.post(
        "/api/auth/password-reset/confirm",
        json={"email": "demo@kuli.local", "verificationCode": reset_code, "password": "KuliUser456!"},
    )
    assert confirm.status_code == 200
    assert confirm.json()["ok"] is True

    old_login = await client.post("/api/auth/login", json={"email": "demo@kuli.local", "password": "KuliUser123!"})
    assert old_login.status_code == 401

    new_login = await client.post("/api/auth/login", json={"email": "demo@kuli.local", "password": "KuliUser456!"})
    assert new_login.status_code == 200

    reused = await client.post(
        "/api/auth/password-reset/confirm",
        json={"email": "demo@kuli.local", "verificationCode": reset_code, "password": "KuliUser789!"},
    )
    assert reused.status_code == 400

    actions = security_actions()
    assert "auth.password_reset.code_sent" in actions
    assert "auth.password_reset.confirmed" in actions
