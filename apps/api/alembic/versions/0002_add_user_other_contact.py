"""add user other_contact column

Revision ID: 0002_add_user_other_contact
Revises: 0001_kuli_v2_schema
Create Date: 2026-06-02 01:30:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_add_user_other_contact"
down_revision = "0001_kuli_v2_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("users")}
    if "other_contact" not in columns:
        op.add_column("users", sa.Column("other_contact", sa.String(length=255), nullable=False, server_default=""))
        op.alter_column("users", "other_contact", server_default=None)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("users")}
    if "other_contact" in columns:
        op.drop_column("users", "other_contact")
