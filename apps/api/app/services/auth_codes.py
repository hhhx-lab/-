import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.entities import AuthEmailCode, now_iso
from app.services.auth_tokens import hash_auth_token


AUTH_CODE_PURPOSE_REGISTER = "register"
AUTH_CODE_PURPOSE_PASSWORD_RESET = "password_reset"
AUTH_CODE_PURPOSE_EMAIL_VERIFICATION = "email_verification"


def issue_auth_email_code(db: Session, *, email: str, purpose: str, ip_address: str) -> str:
    normalized_email = email.lower().strip()
    _invalidate_active_codes(db, email=normalized_email, purpose=purpose)
    code = f"{secrets.randbelow(900_000) + 100_000:06d}"
    row = AuthEmailCode(
        email=normalized_email,
        purpose=purpose,
        code_hash=hash_auth_token(code),
        expires_at=_expires_at(get_settings().auth_code_expire_seconds),
        created_ip=ip_address,
    )
    db.add(row)
    db.flush()
    return code


def find_active_auth_email_code(db: Session, *, email: str, purpose: str, code: str) -> AuthEmailCode | None:
    normalized_email = email.lower().strip()
    normalized_code = code.strip()
    if len(normalized_code) != 6 or not normalized_code.isdigit():
        return None
    row = (
        db.query(AuthEmailCode)
        .filter(
            AuthEmailCode.email == normalized_email,
            AuthEmailCode.purpose == purpose,
            AuthEmailCode.code_hash == hash_auth_token(normalized_code),
        )
        .order_by(AuthEmailCode.created_at.desc())
        .first()
    )
    if not row or not _is_active(row.expires_at, row.used_at):
        return None
    return row


def mark_auth_email_code_used(row: AuthEmailCode) -> None:
    row.used_at = now_iso()


def verify_auth_email_code(db: Session, *, email: str, purpose: str, code: str) -> AuthEmailCode | None:
    row = find_active_auth_email_code(db, email=email, purpose=purpose, code=code)
    if not row:
        return None
    mark_auth_email_code_used(row)
    db.add(row)
    return row


def _invalidate_active_codes(db: Session, *, email: str, purpose: str) -> None:
    rows = (
        db.query(AuthEmailCode)
        .filter(AuthEmailCode.email == email, AuthEmailCode.purpose == purpose, AuthEmailCode.used_at.is_(None))
        .all()
    )
    for row in rows:
        if _is_active(row.expires_at, row.used_at):
            row.used_at = now_iso()
            db.add(row)


def _expires_at(seconds: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(seconds=seconds)).isoformat()


def _is_active(expires_at: str, used_at: str | None) -> bool:
    if used_at:
        return False
    try:
        expires = datetime.fromisoformat(expires_at)
    except ValueError:
        return False
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    return expires > datetime.now(timezone.utc)
