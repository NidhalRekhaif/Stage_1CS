"""Modifying in schema to match output

Revision ID: 195350944546
Revises: 9bae7766e97b
Create Date: 2025-10-06 22:54:20.743521

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '195350944546'
down_revision: Union[str, Sequence[str], None] = '9bae7766e97b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # change type of chercheur_ordre in lienchercheurconference
    with op.batch_alter_table('lienchercheurconference', schema=None) as batch_op:
        batch_op.alter_column(
            'chercheur_ordre',
            existing_type=sa.INTEGER(),
            type_=sqlmodel.sql.sqltypes.AutoString(),
            existing_nullable=True
        )

    # change type of chercheur_ordre in lienchercheurrevue
    with op.batch_alter_table('lienchercheurrevue', schema=None) as batch_op:
        batch_op.alter_column(
            'chercheur_ordre',
            existing_type=sa.INTEGER(),
            type_=sqlmodel.sql.sqltypes.AutoString(),
            existing_nullable=True
        )

    # add new column to publicationconference
    with op.batch_alter_table('publicationconference', schema=None) as batch_op:
        batch_op.add_column(sa.Column('citations', sa.Integer(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('publicationconference', schema=None) as batch_op:
        batch_op.drop_column('citations')

    with op.batch_alter_table('lienchercheurrevue', schema=None) as batch_op:
        batch_op.alter_column(
            'chercheur_ordre',
            existing_type=sqlmodel.sql.sqltypes.AutoString(),
            type_=sa.INTEGER(),
            existing_nullable=True
        )

    with op.batch_alter_table('lienchercheurconference', schema=None) as batch_op:
        batch_op.alter_column(
            'chercheur_ordre',
            existing_type=sqlmodel.sql.sqltypes.AutoString(),
            type_=sa.INTEGER(),
            existing_nullable=True
        )