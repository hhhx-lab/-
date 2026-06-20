"""add auth email codes and user registered_ip

Revision ID: 0004_auth_email_codes
Revises: 0003_backfill_runtime
Create Date: 2026-06-20 12:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0004_auth_email_codes"
down_revision = "0003_backfill_runtime"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "registered_ip" not in user_columns:
        op.add_column("users", sa.Column("registered_ip", sa.String(length=80), nullable=True))
        op.create_index("ix_users_registered_ip", "users", ["registered_ip"], unique=False)

    if not inspector.has_table("auth_email_codes"):
        op.create_table(
            "auth_email_codes",
            sa.Column("id", sa.String(length=64), primary_key=True),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("purpose", sa.String(length=40), nullable=False),
            sa.Column("code_hash", sa.String(length=128), nullable=False),
            sa.Column("expires_at", sa.String(length=64), nullable=False),
            sa.Column("used_at", sa.String(length=64), nullable=True),
            sa.Column("created_ip", sa.String(length=80), nullable=False, server_default=""),
            sa.Column("created_at", sa.String(length=64), nullable=False),
        )
        op.create_index("ix_auth_email_codes_email", "auth_email_codes", ["email"], unique=False)
        op.create_index("ix_auth_email_codes_purpose", "auth_email_codes", ["purpose"], unique=False)
        op.create_index("ix_auth_email_codes_code_hash", "auth_email_codes", ["code_hash"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("auth_email_codes"):
        op.drop_table("auth_email_codes")
    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "registered_ip" in user_columns:
        op.drop_index("ix_users_registered_ip", table_name="users")
        op.drop_column("users", "registered_ip")