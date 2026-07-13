"""add manager_id to stores

Revision ID: a1b2c3d4e5f6
Revises: 87f302ea408f
Create Date: 2026-07-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '87f302ea408f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('stores', sa.Column('manager_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_stores_manager_id_users',
        'stores', 'users',
        ['manager_id'], ['id'],
        ondelete='SET NULL',
    )


def downgrade() -> None:
    op.drop_constraint('fk_stores_manager_id_users', 'stores', type_='foreignkey')
    op.drop_column('stores', 'manager_id')
