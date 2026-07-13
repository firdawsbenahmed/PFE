"""add email status to bookings

Revision ID: 3140c37c5a4a
Revises: eab4ebe70b18
Create Date: 2026-05-16 16:36:50.040950

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3140c37c5a4a'
down_revision: Union[str, Sequence[str], None] = 'eab4ebe70b18'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column("bookings", sa.Column("email_status", sa.String(), nullable=False, server_default="not_sent"))
    op.add_column("bookings", sa.Column("email_error", sa.String(), nullable=True))


def downgrade():
    op.drop_column("bookings", "email_error")
    op.drop_column("bookings", "email_status")