import json
from urllib.parse import quote

from sqlalchemy.orm import Session

from app.models.entities import Notification, NotificationEvent, Order, OrderMessage, User
from app.notifications.email import render_template


def create_user_notification_event(
    db: Session,
    *,
    user: User,
    event_type: str,
    title: str,
    body: str,
    target_url: str = "",
    order_number: str | None = None,
    metadata: dict[str, object] | None = None,
    idempotency_key: str = "",
) -> tuple[Notification, NotificationEvent]:
    if idempotency_key:
        existing_event = db.query(NotificationEvent).filter(NotificationEvent.idempotency_key == idempotency_key).first()
        if existing_event and existing_event.notification_id:
            existing_notification = db.get(Notification, existing_event.notification_id)
            if existing_notification:
                return existing_notification, existing_event

    notification = Notification(
        user_id=user.id,
        type=event_type,
        order_number=order_number,
        title=title,
        body=body,
        status="unread",
        target_url=target_url,
        metadata_json=json.dumps(metadata or {}, ensure_ascii=False),
    )
    db.add(notification)
    db.flush()

    subject = f"{title} {order_number}" if order_number else title
    event = NotificationEvent(
        event_type=event_type,
        user_id=user.id,
        notification_id=notification.id,
        order_number=order_number,
        channel="email",
        recipient=user.email,
        subject=subject,
        body=body,
        status="pending",
        idempotency_key=idempotency_key,
    )
    db.add(event)
    db.flush()
    return notification, event


def create_order_customer_notification(
    db: Session,
    *,
    order: Order,
    event_type: str,
    title: str,
    body: str,
    metadata: dict[str, object] | None = None,
    idempotency_key: str = "",
) -> tuple[Notification, NotificationEvent] | None:
    if not order.owner_user_id:
        return None
    recipient = db.get(User, order.owner_user_id)
    if not recipient:
        return None
    return create_user_notification_event(
        db,
        user=recipient,
        event_type=event_type,
        title=title,
        body=body,
        target_url=f"/orders/{order.order_number}",
        order_number=order.order_number,
        metadata=metadata,
        idempotency_key=idempotency_key,
    )


def create_admin_notification_events(
    db: Session,
    *,
    event_type: str,
    title: str,
    body: str,
    order_number: str | None = None,
    metadata: dict[str, object] | None = None,
    idempotency_key_prefix: str = "",
) -> list[NotificationEvent]:
    events: list[NotificationEvent] = []
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        idempotency_key = f"{idempotency_key_prefix}:{admin.id}" if idempotency_key_prefix else ""
        _, event = create_user_notification_event(
            db,
            user=admin,
            event_type=event_type,
            title=title,
            body=body,
            target_url=f"/admin/orders/{order_number}" if order_number else "/admin",
            order_number=order_number,
            metadata=metadata,
            idempotency_key=idempotency_key,
        )
        events.append(event)
    return events


def create_referral_reward_notification(
    db: Session,
    *,
    referrer: User,
    referred_user: User,
    points: int,
) -> tuple[Notification, NotificationEvent]:
    return create_user_notification_event(
        db,
        user=referrer,
        event_type="referral_rewarded",
        title="邀请积分到账",
        body=f"{referred_user.display_name} 通过你的邀请注册，积分 +{points}。",
        target_url="/referrals",
        metadata={"referredUserId": referred_user.id, "points": points},
        idempotency_key=f"referral_rewarded:{referrer.id}:{referred_user.id}",
    )


def create_order_message_notification(
    db: Session,
    *,
    order: Order,
    message: OrderMessage,
    actor: User,
) -> tuple[Notification, NotificationEvent] | None:
    if message.visibility != "public" or not order.owner_user_id:
        return None

    recipient = db.get(User, order.owner_user_id)
    if not recipient:
        return None

    idempotency_key = f"order_message:{message.id}:email"
    existing_event = db.query(NotificationEvent).filter(NotificationEvent.idempotency_key == idempotency_key).first()
    if existing_event and existing_event.notification_id:
        existing_notification = db.get(Notification, existing_event.notification_id)
        if existing_notification:
            return existing_notification, existing_event

    title = "管理员回复了你的订单"
    target_url = f"/orders/{order.order_number}"
    notification = Notification(
        user_id=recipient.id,
        type="order_message",
        order_number=order.order_number,
        title=title,
        body=message.body,
        status="unread",
        target_url=target_url,
        metadata_json=json.dumps({"messageId": message.id, "actorUserId": actor.id}, ensure_ascii=False),
    )
    db.add(notification)
    db.flush()

    event = NotificationEvent(
        event_type="order_message",
        user_id=recipient.id,
        notification_id=notification.id,
        order_number=order.order_number,
        channel="email",
        recipient=recipient.email,
        subject=f"{title} {order.order_number}",
        body=message.body,
        status="pending",
        idempotency_key=idempotency_key,
    )
    db.add(event)
    db.flush()
    return notification, event


def create_email_verification_event(db: Session, *, user: User, token: str, base_url: str) -> NotificationEvent:
    verify_url = f"{base_url.rstrip('/')}/login?verifyToken={quote(token)}"
    event = NotificationEvent(
        event_type="email_verification",
        user_id=user.id,
        channel="email",
        recipient=user.email,
        subject="验证你的酷里邮箱",
        body=render_template("email_verify.html", {"verify_url": verify_url}),
        status="pending",
        idempotency_key=f"email_verification:{user.id}:{token[:12]}",
    )
    db.add(event)
    db.flush()
    return event


def create_password_reset_event(db: Session, *, user: User, token: str, base_url: str) -> NotificationEvent:
    reset_url = f"{base_url.rstrip('/')}/login?resetToken={quote(token)}"
    event = NotificationEvent(
        event_type="password_reset",
        user_id=user.id,
        channel="email",
        recipient=user.email,
        subject="重置你的酷里密码",
        body=render_template("password_reset.html", {"reset_url": reset_url}),
        status="pending",
        idempotency_key=f"password_reset:{user.id}:{token[:12]}",
    )
    db.add(event)
    db.flush()
    return event
