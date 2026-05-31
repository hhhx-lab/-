from __future__ import annotations

from sqlalchemy import text

from app.database import SessionLocal


DEMO_ORDER_NUMBERS = ("KULI-DEMO-001", "KULI-OTHER-001")
DEMO_USER_IDS = ("user_demo", "user_other")
DEMO_EMAILS = ("demo@kuli.local", "other@kuli.local", "demo-disabled@kuly.local", "other-disabled@kuly.local")
SMOKE_EMAIL_PATTERN = "%@kuly.test"
ORDER_CHILD_TABLES = (
    "agent_tool_calls",
    "order_reply_drafts",
    "order_ai_summaries",
    "order_todos",
    "order_automation_suggestions",
    "admin_audit_logs",
    "deliverables",
    "payment_records",
    "quotes",
    "order_attachments",
    "order_messages",
    "order_events",
    "notification_events",
    "notifications",
)


def placeholders(values: tuple[str, ...], prefix: str) -> tuple[str, dict[str, str]]:
    params = {f"{prefix}_{index}": value for index, value in enumerate(values)}
    return ", ".join(f":{name}" for name in params), params


def delete_orders(db, order_numbers: tuple[str, ...]) -> int:
    if not order_numbers:
        return 0
    order_placeholders, order_params = placeholders(order_numbers, "order_number")
    for table in ORDER_CHILD_TABLES:
        db.execute(text(f"delete from {table} where order_number in ({order_placeholders})"), order_params)
    result = db.execute(text(f"delete from orders where order_number in ({order_placeholders})"), order_params)
    return result.rowcount or 0


def delete_demo_data(db) -> tuple[int, int]:
    user_placeholders, user_params = placeholders(DEMO_USER_IDS, "user_id")
    email_placeholders, email_params = placeholders(DEMO_EMAILS, "email")
    params = {**user_params, **email_params}

    removed_orders = delete_orders(db, DEMO_ORDER_NUMBERS)
    db.execute(
        text(
            f"""
            delete from notification_events
            where user_id in ({user_placeholders}) or recipient in ({email_placeholders})
            """
        ),
        params,
    )
    db.execute(text(f"delete from notifications where user_id in ({user_placeholders})"), params)
    db.execute(text(f"delete from referral_rewards where referrer_user_id in ({user_placeholders}) or referred_user_id in ({user_placeholders})"), params)
    db.execute(text(f"delete from password_reset_tokens where user_id in ({user_placeholders})"), params)
    db.execute(text(f"delete from email_verification_tokens where user_id in ({user_placeholders})"), params)
    db.execute(text(f"delete from security_audit_logs where user_id in ({user_placeholders}) or email in ({email_placeholders})"), params)
    db.execute(
        text(
            f"""
            delete from agent_messages
            where session_id in (select id from agent_sessions where user_id in ({user_placeholders}))
            """
        ),
        params,
    )
    db.execute(
        text(
            f"""
            delete from agent_tool_calls
            where session_id in (select id from agent_sessions where user_id in ({user_placeholders}))
            """
        ),
        params,
    )
    db.execute(text(f"delete from agent_sessions where user_id in ({user_placeholders})"), params)
    result = db.execute(text(f"delete from users where id in ({user_placeholders}) or email in ({email_placeholders})"), params)
    return result.rowcount or 0, removed_orders


def delete_smoke_data(db) -> tuple[int, int]:
    smoke_orders = tuple(
        db.execute(
            text(
                """
                select order_number from orders
                where contact like :pattern
                   or owner_user_id in (select id from users where email like :pattern)
                """
            ),
            {"pattern": SMOKE_EMAIL_PATTERN},
        )
        .scalars()
        .all()
    )
    removed_orders = delete_orders(db, smoke_orders)

    smoke_users = tuple(
        db.execute(text("select id from users where email like :pattern"), {"pattern": SMOKE_EMAIL_PATTERN})
        .scalars()
        .all()
    )
    if not smoke_users:
        return 0, removed_orders

    user_placeholders, user_params = placeholders(smoke_users, "smoke_user_id")
    params = {**user_params, "pattern": SMOKE_EMAIL_PATTERN}
    db.execute(
        text(
            f"""
            delete from notification_events
            where user_id in ({user_placeholders}) or recipient like :pattern
            """
        ),
        params,
    )
    db.execute(text(f"delete from notifications where user_id in ({user_placeholders})"), params)
    db.execute(text(f"delete from referral_rewards where referrer_user_id in ({user_placeholders}) or referred_user_id in ({user_placeholders})"), params)
    db.execute(text(f"delete from password_reset_tokens where user_id in ({user_placeholders})"), params)
    db.execute(text(f"delete from email_verification_tokens where user_id in ({user_placeholders})"), params)
    db.execute(text(f"delete from security_audit_logs where user_id in ({user_placeholders}) or email like :pattern"), params)
    db.execute(
        text(
            f"""
            delete from agent_messages
            where session_id in (select id from agent_sessions where user_id in ({user_placeholders}))
            """
        ),
        params,
    )
    db.execute(
        text(
            f"""
            delete from agent_tool_calls
            where session_id in (select id from agent_sessions where user_id in ({user_placeholders}))
            """
        ),
        params,
    )
    db.execute(text(f"delete from agent_sessions where user_id in ({user_placeholders})"), params)
    result = db.execute(text("delete from users where email like :pattern"), {"pattern": SMOKE_EMAIL_PATTERN})
    return result.rowcount or 0, removed_orders


def main() -> None:
    with SessionLocal() as db:
        removed_demo_users, removed_demo_orders = delete_demo_data(db)
        removed_smoke_users, removed_smoke_orders = delete_smoke_data(db)
        db.commit()
        print(f"Removed demo users: {removed_demo_users}")
        print(f"Removed demo orders: {removed_demo_orders}")
        print(f"Removed smoke users: {removed_smoke_users}")
        print(f"Removed smoke orders: {removed_smoke_orders}")


if __name__ == "__main__":
    main()
