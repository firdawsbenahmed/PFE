"""add api_key to companies

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-13 00:00:00.000000

"""
from typing import Sequence, Union
import secrets

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('companies', sa.Column('api_key', sa.String(), nullable=True))
    op.create_index('ix_companies_api_key', 'companies', ['api_key'], unique=True)

    # Backfill a key for every existing company so seeded/older brands work too.
    conn = op.get_bind()
    rows = conn.execute(sa.text("SELECT id FROM companies WHERE api_key IS NULL")).fetchall()
    for (cid,) in rows:
        conn.execute(
            sa.text("UPDATE companies SET api_key = :k WHERE id = :id"),
            {"k": "uf_" + secrets.token_urlsafe(24), "id": cid},
        )


def downgrade() -> None:
    op.drop_index('ix_companies_api_key', table_name='companies')
    op.drop_column('companies', 'api_key')
