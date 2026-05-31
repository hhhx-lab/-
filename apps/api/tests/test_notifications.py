from collections.abc import AsyncIterator
from pathlib import Path

import httpx
import pytest
from sqlalchemy import text

from app import database
from app.core.config import get_settings
from app.database import configure_database, init_database
from app.main import app


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


async def login(client: httpx.AsyncClient, email: str, password: str) -> str:
    response = await client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.json()["token"]


def notification_events(order_number: str) -> list[dict[str, object]]:
    with database.SessionLocal() as db:
        rows = db.execute(
            text(
                """
                select id, event_type, order_number, channel, recipient, subject, body, status, retry_count, last_error
                from notification_events
                where order_number = :order_number
                order by created_at asc
                """
            ),
            {"order_number": order_number},
        ).mappings()
        return [dict(row) for row in rows]


def user_referral_code(email: str) -> str:
    with database.SessionLocal() as db:
        row = db.execute(text("select referral_code from users where email = :email"), {"email": email}).mappings().first()
        assert row
        return str(row["referral_code"])


@pytest.mark.anyio
async def test_admin_public_reply_creates_email_event_and_in_app_notification(client: httpx.AsyncClient) -> None:
    admin_token = await login(client, "admin@kuli.local", "KuliAdmin123!")
    demo_token = await login(client, "demo@kuli.local", "KuliUser123!")
    other_token = await login(client, "other@kuli.local", "KuliOther123!")

    reply = await client.post(
        "/api/admin/orders/KULI-DEMO-001/messages",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"body": "请补充一下最终希望交付的页面数量。", "visibility": "public"},
    )
    assert reply.status_code == 201

    events = notification_events("KULI-DEMO-001")
    assert len(events) == 1
    assert events[0]["channel"] == "email"
    assert events[0]["recipient"] == "demo@kuli.local"
    assert events[0]["status"] == "pending"
    assert "管理员回复" in str(events[0]["subject"])

    unread = await client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {demo_token}"})
    assert unread.status_code == 200
    assert unread.json()["unreadCount"] == 1

    listing = await client.get("/api/notifications", headers={"Authorization": f"Bearer {demo_token}"})
    assert listing.status_code == 200
    notifications = listing.json()["notifications"]
    assert len(notifications) == 1
    assert notifications[0]["type"] == "order_message"
    assert notifications[0]["status"] == "unread"
    assert notifications[0]["orderNumber"] == "KULI-DEMO-001"
    assert notifications[0]["targetUrl"] == "/orders/KULI-DEMO-001"
    assert "页面数量" in notifications[0]["body"]

    other_listing = await client.get("/api/notifications", headers={"Authorization": f"Bearer {other_token}"})
    assert other_listing.status_code == 200
    assert other_listing.json()["notifications"] == []

    notification_id = notifications[0]["id"]
    read = await client.patch(f"/api/notifications/{notification_id}/read", headers={"Authorization": f"Bearer {demo_token}"})
    assert read.status_code == 200
    assert read.json()["notification"]["status"] == "read"

    unread_after_read = await client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {demo_token}"})
    assert unread_after_read.status_code == 200
    assert unread_after_read.json()["unreadCount"] == 0

    forbidden = await client.patch(f"/api/notifications/{notification_id}/read", headers={"Authorization": f"Bearer {other_token}"})
    assert forbidden.status_code == 404


@pytest.mark.anyio
async def test_internal_admin_reply_does_not_notify_customer_and_read_all_marks_visible_items(client: httpx.AsyncClient) -> None:
    admin_token = await login(client, "admin@kuli.local", "KuliAdmin123!")
    demo_token = await login(client, "demo@kuli.local", "KuliUser123!")

    internal = await client.post(
        "/api/admin/orders/KULI-DEMO-001/messages",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"body": "内部备注：先估算成本，不要发给客户。", "visibility": "internal"},
    )
    assert internal.status_code == 201
    assert notification_events("KULI-DEMO-001") == []

    for body in ["第一条公开提醒", "第二条公开提醒"]:
        response = await client.post(
            "/api/admin/orders/KULI-DEMO-001/messages",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"body": body, "visibility": "public"},
        )
        assert response.status_code == 201

    unread = await client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {demo_token}"})
    assert unread.status_code == 200
    assert unread.json()["unreadCount"] == 2

    read_all = await client.patch("/api/notifications/read-all", headers={"Authorization": f"Bearer {demo_token}"})
    assert read_all.status_code == 200
    assert read_all.json()["updated"] == 2

    unread_after = await client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {demo_token}"})
    assert unread_after.status_code == 200
    assert unread_after.json()["unreadCount"] == 0


@pytest.mark.anyio
async def test_mail_worker_failure_keeps_in_app_notification_visible(client: httpx.AsyncClient) -> None:
    from app.tasks.notification_tasks import send_notification_event_sync

    admin_token = await login(client, "admin@kuli.local", "KuliAdmin123!")
    demo_token = await login(client, "demo@kuli.local", "KuliUser123!")

    reply = await client.post(
        "/api/admin/orders/KULI-DEMO-001/messages",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"body": "邮件失败也应该能在站内看到。", "visibility": "public"},
    )
    assert reply.status_code == 201
    event_id = str(notification_events("KULI-DEMO-001")[0]["id"])

    status = send_notification_event_sync(event_id)
    assert status == "failed"

    events = notification_events("KULI-DEMO-001")
    assert events[0]["status"] == "failed"
    assert events[0]["retry_count"] == 1
    assert "MAIL_PROVIDER" in str(events[0]["last_error"])

    listing = await client.get("/api/notifications", headers={"Authorization": f"Bearer {demo_token}"})
    assert listing.status_code == 200
    assert listing.json()["notifications"][0]["status"] == "unread"
    assert "邮件失败" in listing.json()["notifications"][0]["body"]


@pytest.mark.anyio
async def test_smtp_mail_provider_sends_email_message(client: httpx.AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    from app.tasks.notification_tasks import send_notification_event_sync

    sent_clients: list[object] = []

    class FakeSMTP:
        def __init__(self, host: str, port: int, timeout: int) -> None:
            self.host = host
            self.port = port
            self.timeout = timeout
            self.started_tls = False
            self.login_args: tuple[str, str] | None = None
            self.message = None
            sent_clients.append(self)

        def __enter__(self) -> "FakeSMTP":
            return self

        def __exit__(self, exc_type, exc, traceback) -> None:  # noqa: ANN001
            return None

        def starttls(self) -> None:
            self.started_tls = True

        def login(self, username: str, password: str) -> None:
            self.login_args = (username, password)

        def send_message(self, message) -> None:  # noqa: ANN001
            self.message = message

    monkeypatch.setenv("MAIL_PROVIDER", "smtp")
    monkeypatch.setenv("MAIL_FROM", "no-reply@kuli.test")
    monkeypatch.setenv("MAIL_REPLY_TO", "support@kuli.test")
    monkeypatch.setenv("SMTP_HOST", "smtp.kuli.test")
    monkeypatch.setenv("SMTP_PORT", "587")
    monkeypatch.setenv("SMTP_USERNAME", "smtp-user")
    monkeypatch.setenv("SMTP_PASSWORD", "smtp-password")
    get_settings.cache_clear()
    monkeypatch.setattr("smtplib.SMTP", FakeSMTP)

    admin_token = await login(client, "admin@kuli.local", "KuliAdmin123!")
    reply = await client.post(
        "/api/admin/orders/KULI-DEMO-001/messages",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"body": "SMTP 应该真正发送这条邮件。", "visibility": "public"},
    )
    assert reply.status_code == 201
    event_id = str(notification_events("KULI-DEMO-001")[0]["id"])

    try:
        status = send_notification_event_sync(event_id)
    finally:
        get_settings.cache_clear()

    assert status == "sent"
    assert len(sent_clients) == 1
    client_instance = sent_clients[0]
    assert client_instance.host == "smtp.kuli.test"
    assert client_instance.port == 587
    assert client_instance.timeout == 20
    assert client_instance.started_tls is True
    assert client_instance.login_args == ("smtp-user", "smtp-password")
    assert client_instance.message["From"] == "no-reply@kuli.test"
    assert client_instance.message["To"] == "demo@kuli.local"
    assert client_instance.message["Reply-To"] == "support@kuli.test"
    assert "管理员回复" in client_instance.message["Subject"]
    assert "SMTP 应该真正发送这条邮件" in client_instance.message.get_content()


@pytest.mark.anyio
async def test_configured_mail_provider_enqueues_public_reply_email_event(client: httpx.AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    from app import main as app_main

    queued_event_ids: list[str] = []

    class FakeNotificationTask:
        def delay(self, event_id: str) -> None:
            queued_event_ids.append(event_id)

    monkeypatch.setenv("MAIL_PROVIDER", "smtp")
    get_settings.cache_clear()
    monkeypatch.setattr(app_main, "send_notification_event", FakeNotificationTask(), raising=False)

    admin_token = await login(client, "admin@kuli.local", "KuliAdmin123!")
    try:
        reply = await client.post(
            "/api/admin/orders/KULI-DEMO-001/messages",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"body": "配置邮件后，公开回复要入队发送。", "visibility": "public"},
        )
    finally:
        get_settings.cache_clear()

    assert reply.status_code == 201
    events = notification_events("KULI-DEMO-001")
    assert len(events) == 1
    assert queued_event_ids == [events[0]["id"]]


@pytest.mark.anyio
async def test_order_lifecycle_and_referral_actions_create_notifications(client: httpx.AsyncClient) -> None:
    admin_token = await login(client, "admin@kuli.local", "KuliAdmin123!")
    demo_token = await login(client, "demo@kuli.local", "KuliUser123!")

    patch = await client.patch(
        "/api/admin/orders/KULI-DEMO-001",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "clarifying", "publicNotes": "请补充一张参考截图。"},
    )
    assert patch.status_code == 200

    quote = await client.post(
        "/api/admin/orders/KULI-DEMO-001/quotes",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"amount": 120, "kind": "deposit", "note": "先收定金，确认材料后开工。"},
    )
    assert quote.status_code == 201

    payment = await client.post(
        "/api/admin/orders/KULI-DEMO-001/payments",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"amount": 60, "kind": "deposit", "method": "微信收款码", "status": "received", "note": "已确认到账"},
    )
    assert payment.status_code == 201

    deliverable = await client.post(
        "/api/admin/orders/KULI-DEMO-001/deliverables",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "第一版交付", "description": "请先验收第一版。", "storageKey": "deliverables/KULI-DEMO-001/v1.zip"},
    )
    assert deliverable.status_code == 201

    accepted = await client.post("/api/orders/KULI-DEMO-001/accept", headers={"Authorization": f"Bearer {demo_token}"})
    assert accepted.status_code == 200

    customer_notifications = await client.get("/api/notifications", headers={"Authorization": f"Bearer {demo_token}"})
    assert customer_notifications.status_code == 200
    customer_types = {item["type"] for item in customer_notifications.json()["notifications"]}
    assert {"order_status_changed", "quote_created", "payment_recorded", "deliverable_uploaded"}.issubset(customer_types)

    admin_notifications = await client.get("/api/notifications", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_notifications.status_code == 200
    admin_types = {item["type"] for item in admin_notifications.json()["notifications"]}
    assert "order_accepted" in admin_types

    referral_code = user_referral_code("demo@kuli.local")
    register = await client.post(
        "/api/auth/register",
        json={
            "email": "referred-user@example.com",
            "password": "ReferredUser123!",
            "displayName": "被邀请用户",
            "referralCode": referral_code,
        },
    )
    assert register.status_code == 201

    referral_notifications = await client.get("/api/notifications", headers={"Authorization": f"Bearer {demo_token}"})
    assert referral_notifications.status_code == 200
    referral_types = {item["type"] for item in referral_notifications.json()["notifications"]}
    assert "referral_rewarded" in referral_types

    event_types = {event["event_type"] for event in notification_events("KULI-DEMO-001")}
    assert {"order_status_changed", "quote_created", "payment_recorded", "deliverable_uploaded", "order_accepted"}.issubset(event_types)
