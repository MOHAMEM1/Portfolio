"""merge heads

Revision ID: 579ed43bda58
Revises: b7c7517b0cd9, c6b5c263b454
Create Date: 2026-07-16 03:54:33.719224

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '579ed43bda58'
down_revision: Union[str, Sequence[str], None] = ('b7c7517b0cd9', 'c6b5c263b454')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
