"""Adding check constraints on scimago,dgrsdt and core ranking

Revision ID: 9a0310f5fced
Revises: fd0bcaa02148
Create Date: 2025-10-16 12:10:07.484121

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '9a0310f5fced'
down_revision: Union[str, Sequence[str], None] = 'fd0bcaa02148'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- ConferenceRanking constraints ---
    with op.batch_alter_table('conferenceranking') as batch_op:

        batch_op.create_check_constraint(
            constraint_name="valid_scimago_rank_conference",
            condition="scimago_rank IN ('Q1', 'Q2', 'Q3', 'Q4') OR scimago_rank IS NULL",
    )

        batch_op.create_check_constraint(
            constraint_name="validate_core_ranking_conference",
            condition="core_ranking IN ('A*','A','B','C') OR core_ranking IS NULL",
    )

    # --- RevueRanking constraints ---
    with op.batch_alter_table('revueranking') as batch_op:
        batch_op.create_check_constraint(
            constraint_name="valid_scimago_rank_revue",
            condition="scimago_rank IN ('Q1', 'Q2', 'Q3', 'Q4') OR scimago_rank IS NULL",
            )

        batch_op.create_check_constraint(
            constraint_name="validate_dgrsdt_rank_revue",
            condition="dgrsdt_rank IN ('A+','A','B','C','D','E') OR dgrsdt_rank IS NULL",
            )


def downgrade() -> None:
    # --- Drop constraints for ConferenceRanking ---
    with op.batch_alter_table('conferenceranking') as batch_op:
        batch_op.drop_constraint("valid_scimago_rank_conference", type_="check")
        batch_op.drop_constraint("validate_core_ranking_conference",  type_="check")

    # --- Drop constraints for RevueRanking ---
    with op.batch_alter_table('revueranking') as batch_op:
        batch_op.drop_constraint("valid_scimago_rank_revue", "revueranking", type_="check")
        batch_op.drop_constraint("validate_dgrsdt_rank_revue", "revueranking", type_="check")
