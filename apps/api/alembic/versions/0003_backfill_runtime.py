"""backfill missing runtime columns

Revision ID: 0003_backfill_runtime
Revises: 0002_add_user_other_contact
Create Date: 2026-06-02 01:40:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_backfill_runtime"
down_revision = "0002_add_user_other_contact"
branch_labels = None
depends_on = None


def _has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def _add_column_if_missing(
    inspector: sa.Inspector,
    table_name: str,
    column: sa.Column,
    *,
    drop_server_default: bool = False,
) -> None:
    if _has_column(inspector, table_name, column.name):
        return
    op.add_column(table_name, column)
    if drop_server_default:
        op.alter_column(table_name, column.name, server_default=None)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    _add_column_if_missing(
        inspector,
        "orders",
        sa.Column("communication_preference", sa.String(length=32), nullable=False, server_default="site"),
        drop_server_default=True,
    )

    _add_column_if_missing(
        inspector,
        "order_attachments",
        sa.Column("parsed_summary", sa.Text(), nullable=False, server_default=""),
        drop_server_default=True,
    )
    _add_column_if_missing(
        inspector,
        "order_attachments",
        sa.Column("scan_error", sa.Text(), nullable=False, server_default=""),
        drop_server_default=True,
    )
    _add_column_if_missing(
        inspector,
        "order_attachments",
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
        drop_server_default=True,
    )
    _add_column_if_missing(
        inspector,
        "order_attachments",
        sa.Column("last_scanned_at", sa.String(length=64), nullable=True),
    )

    _add_column_if_missing(
        inspector,
        "notification_events",
        sa.Column("event_type", sa.String(length=80), nullable=False, server_default="system"),
        drop_server_default=True,
    )
    _add_column_if_missing(
        inspector,
        "notification_events",
        sa.Column("user_id", sa.String(length=64), nullable=True),
    )
    _add_column_if_missing(
        inspector,
        "notification_events",
        sa.Column("notification_id", sa.String(length=64), nullable=True),
    )
    _add_column_if_missing(
        inspector,
        "notification_events",
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
        drop_server_default=True,
    )
    _add_column_if_missing(
        inspector,
        "notification_events",
        sa.Column("last_error", sa.Text(), nullable=False, server_default=""),
        drop_server_default=True,
    )
    _add_column_if_missing(
        inspector,
        "notification_events",
        sa.Column("idempotency_key", sa.String(length=220), nullable=False, server_default=""),
        drop_server_default=True,
    )
    _add_column_if_missing(
        inspector,
        "notification_events",
        sa.Column("updated_at", sa.String(length=64), nullable=False, server_default=""),
        drop_server_default=True,
    )

    _add_column_if_missing(
        inspector,
        "agent_sessions",
        sa.Column("doc_slug", sa.String(length=120), nullable=True),
    )
    _add_column_if_missing(
        inspector,
        "agent_sessions",
        sa.Column("service_slug", sa.String(length=120), nullable=True),
    )

    _add_column_if_missing(
        inspector,
        "knowledge_chunks",
        sa.Column("slug", sa.String(length=120), nullable=False, server_default=""),
        drop_server_default=True,
    )
    _add_column_if_missing(
        inspector,
        "knowledge_chunks",
        sa.Column("source_path", sa.Text(), nullable=False, server_default=""),
        drop_server_default=True,
    )
    _add_column_if_missing(
        inspector,
        "knowledge_chunks",
        sa.Column("section", sa.String(length=200), nullable=False, server_default=""),
        drop_server_default=True,
    )
    _add_column_if_missing(
        inspector,
        "knowledge_chunks",
        sa.Column("anchor", sa.String(length=160), nullable=False, server_default=""),
        drop_server_default=True,
    )
    _add_column_if_missing(
        inspector,
        "knowledge_chunks",
        sa.Column("priority", sa.Integer(), nullable=False, server_default="0"),
        drop_server_default=True,
    )

    _add_column_if_missing(
        inspector,
        "knowledge_embeddings",
        sa.Column("embedding_vector", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    for table_name, column_names in [
        ("knowledge_embeddings", ["embedding_vector"]),
        ("knowledge_chunks", ["priority", "anchor", "section", "source_path", "slug"]),
        ("agent_sessions", ["service_slug", "doc_slug"]),
        ("notification_events", ["updated_at", "idempotency_key", "last_error", "retry_count", "notification_id", "user_id", "event_type"]),
        ("order_attachments", ["last_scanned_at", "retry_count", "scan_error", "parsed_summary"]),
        ("orders", ["communication_preference"]),
    ]:
        existing = {column["name"] for column in inspector.get_columns(table_name)}
        for column_name in column_names:
            if column_name in existing:
                op.drop_column(table_name, column_name)
