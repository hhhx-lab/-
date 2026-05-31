from pathlib import Path
from email.message import EmailMessage
import re
import smtplib
import ssl

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.config import get_settings
from app.models.entities import NotificationEvent, now_iso

TEMPLATE_DIR = Path(__file__).parent / "templates"


def render_template(name: str, context: dict[str, str]) -> str:
    template = (TEMPLATE_DIR / name).read_text(encoding="utf-8")
    rendered = template
    for key, value in context.items():
        rendered = rendered.replace("{{ " + key + " }}", value)
    return rendered


def send_email_event(db: Session, event_id: str) -> NotificationEvent | None:
    event = db.get(NotificationEvent, event_id)
    if not event or event.channel != "email":
        return event
    if event.status == "sent":
        return event

    settings = get_settings()
    if not settings.mail_provider:
        return _mark_failed(db, event, "MAIL_PROVIDER 未配置")

    if settings.mail_provider != "smtp":
        return _mark_failed(db, event, f"不支持的 MAIL_PROVIDER：{settings.mail_provider}")

    missing = _missing_smtp_settings(settings)
    if missing:
        return _mark_failed(db, event, f"SMTP 配置不完整：{', '.join(missing)}")

    try:
        _send_smtp(settings, event)
    except Exception as error:  # noqa: BLE001 - surfaced in notification event for retry/debug
        return _mark_failed(db, event, str(error))

    event.status = "sent"
    event.last_error = ""
    event.updated_at = now_iso()
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def _missing_smtp_settings(settings: Settings) -> list[str]:
    required = {
        "MAIL_FROM": settings.mail_from,
        "SMTP_HOST": settings.smtp_host,
        "SMTP_USERNAME": settings.smtp_username,
        "SMTP_PASSWORD": settings.smtp_password,
    }
    return [name for name, value in required.items() if not value]


def _send_smtp(settings: Settings, event: NotificationEvent) -> None:
    message = _build_message(settings, event)
    timeout = settings.smtp_timeout_seconds

    if settings.smtp_port == 465:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=timeout, context=context) as server:
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
        return

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=timeout) as server:
        server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(message)


def _build_message(settings: Settings, event: NotificationEvent) -> EmailMessage:
    message = EmailMessage()
    message["From"] = settings.mail_from
    message["To"] = event.recipient
    message["Subject"] = event.subject
    if settings.mail_reply_to:
        message["Reply-To"] = settings.mail_reply_to

    body = event.body or ""
    if _looks_like_html(body):
        message.set_content(_html_to_text(body))
        message.add_alternative(body, subtype="html")
    else:
        message.set_content(body)
    return message


def _looks_like_html(value: str) -> bool:
    return bool(re.search(r"</?[a-z][\s\S]*>", value, re.IGNORECASE))


def _html_to_text(value: str) -> str:
    without_tags = re.sub(r"<br\s*/?>", "\n", value, flags=re.IGNORECASE)
    without_tags = re.sub(r"</p\s*>", "\n\n", without_tags, flags=re.IGNORECASE)
    without_tags = re.sub(r"<[^>]+>", "", without_tags)
    return re.sub(r"\n{3,}", "\n\n", without_tags).strip()


def _mark_failed(db: Session, event: NotificationEvent, error: str) -> NotificationEvent:
    event.status = "failed"
    event.retry_count += 1
    event.last_error = error
    event.updated_at = now_iso()
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
