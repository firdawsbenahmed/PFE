"""add is_verified and email verification tokens
Revision ID: cf807b1b9783
Revises: 4d47af1d189c
Create Date: 2026-06-10 13:21:50.079340
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'cf807b1b9783'
down_revision: Union[str, Sequence[str], None] = '4d47af1d189c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('users', 'is_verified',
        existing_type=sa.BOOLEAN(),
        nullable=False,
        existing_server_default=sa.text('false'))


def downgrade() -> None:
    op.alter_column('users', 'is_verified',
        existing_type=sa.BOOLEAN(),
        nullable=True,
        existing_server_default=sa.text('false'))