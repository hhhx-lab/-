import re

import httpx
from sqlalchemy import text

from app import database


def latest_email_event(event_type: str, recipient: str) -> dict[str, object]:
    with database.SessionLocal() as db:
        row = db.execute(
            text(
                """
                select event_type, recipient, subject, body, status
                from notification_events
                where event_type = :event_type and recipient = :recipient
                order by created_at desc
                limit 1
                """
            ),
            {"event_type": event_type, "recipient": recipient},
        ).mappings().first()
        assert row
        return dict(row)


def code_from_event_body(body: str) -> str:
    match = re.search(r"\b(\d{6})\b", body)
    assert match, body
    return match.group(1)


def token_from_event_body(body: str) -> str:
    match = re.search(r"(?:verifyToken|resetToken|token)=([^\"'&<\s]+)", body)
    assert match, body
    return match.group(1)


def verify_email_code_from_event_body(body: str) -> tuple[str, str]:
    email_match = re.search(r"(?:verifyEmail|email)=([^\"'&<\s]+)", body)
    code_match = re.search(r"(?:verifyCode|verificationCode)=([^\"'&<\s]+)", body)
    assert email_match, body
    assert code_match, body
    return email_match.group(1), code_match.group(1)


async def send_register_code(client: httpx.AsyncClient, email: str) -> httpx.Response:
    return await client.post("/api/auth/register/send-code", json={"email": email})


async def register_user(
    client: httpx.AsyncClient,
    *,
    email: str,
    password: str,
    display_name: str,
    referral_code: str | None = None,
) -> httpx.Response:
    send = await send_register_code(client, email)
    assert send.status_code == 202, send.text
    event = latest_email_event("register_verification", email.lower())
    code = code_from_event_body(str(event["body"]))
    payload = {
        "email": email,
        "password": password,
        "displayName": display_name,
        "verificationCode": code,
    }
    if referral_code:
        payload["referralCode"] = referral_code
    return await client.post("/api/auth/register", json=payload)


async def request_password_reset_code(client: httpx.AsyncClient, email: str) -> httpx.Response:
    return await client.post("/api/auth/password-reset/request", json={"email": email})


async def confirm_password_reset_with_code(
    client: httpx.AsyncClient,
    *,
    email: str,
    password: str,
) -> httpx.Response:
    request = await request_password_reset_code(client, email)
    assert request.status_code == 202, request.text
    event = latest_email_event("password_reset_code", email.lower())
    code = code_from_event_body(str(event["body"]))
    return await client.post(
        "/api/auth/password-reset/confirm",
        json={"email": email, "verificationCode": code, "password": password},
    )


async def request_email_verification_code(client: httpx.AsyncClient, email: str) -> httpx.Response:
    return await client.post("/api/auth/email-verification/request", json={"email": email})


async def confirm_email_verification_with_code(
    client: httpx.AsyncClient,
    *,
    email: str,
) -> httpx.Response:
    request = await request_email_verification_code(client, email)
    assert request.status_code == 202, request.text
    event = latest_email_event("email_verification", email.lower())
    code = code_from_event_body(str(event["body"]))
    return await client.post(
        "/api/auth/email-verification/confirm",
        json={"email": email, "verificationCode": code},
    )
