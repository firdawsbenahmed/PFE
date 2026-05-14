"""adding the payment feilds 

Revision ID: eab4ebe70b18
Revises: f0e9eed6ed24
Create Date: 2026-05-14 15:32:29.525309

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eab4ebe70b18'
down_revision: Union[str, Sequence[str], None] = 'f0e9eed6ed24'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column("bookings", sa.Column("payment_status", sa.String(), nullable=False, server_default="unpaid"))
    op.add_column("bookings", sa.Column("payment_link", sa.String(), nullable=True))


def downgrade():
    op.drop_column("bookings", "payment_link")
    op.drop_column("bookings", "payment_status")
