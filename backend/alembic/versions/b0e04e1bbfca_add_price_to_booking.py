"""add price to booking

Revision ID: b0e04e1bbfca
Revises: c3d4e5f6a7b8
Create Date: 2026-07-19 03:58:01.526137

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b0e04e1bbfca'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('bookings', sa.Column('price', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('bookings', 'price')