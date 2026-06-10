"""add email verification tokens and is_verified to users
Revision ID: 4d47af1d189c
Revises: 45a3dbaaf587
Create Date: 2026-06-10 12:49:53.447265
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '4d47af1d189c'
down_revision: Union[str, Sequence[str], None] = '45a3dbaaf587'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_verified to users
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'))

    # Create email_verification_tokens table
    op.create_table(
        'email_verification_tokens',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('token', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )


def downgrade() -> None:
    op.drop_table('email_verification_tokens')
    op.drop_column('users', 'is_verified')