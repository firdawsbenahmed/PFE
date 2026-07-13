"""merge heads

Revision ID: ecacf57b0681
Revises: cf807b1b9783, f97bc7ae6559
Create Date: 2026-06-10 13:50:55.510358

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ecacf57b0681'
down_revision: Union[str, Sequence[str], None] = ('cf807b1b9783', 'f97bc7ae6559')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
