"""Some changes on attributes constraints

Revision ID: 58da69c0e50a
Revises: 79c15b91e460
Create Date: 2025-09-27 11:44:47.014777

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel



# revision identifiers, used by Alembic.
revision: str = '58da69c0e50a'
down_revision: Union[str, Sequence[str], None] = '79c15b91e460'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create new table with ON DELETE SET NULL constraint
    op.create_table(
        "chercheur_new",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("nom", sa.String(length=255), nullable=False),
        sa.Column("prenom", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("telephone", sa.String(length=50), nullable=True),
        sa.Column("grade", sa.String(length=50), nullable=False),  # GradeEnum stored as string
        sa.Column("google_scholar_url", sa.String(length=500), nullable=True),
        sa.Column("dblp_url", sa.String(length=500), nullable=True),
        sa.Column("h_index", sa.Integer, nullable=False, server_default="0"),
        sa.Column("i_10_index", sa.Integer, nullable=False, server_default="0"),
        sa.Column("labo_id", sa.Integer, sa.ForeignKey("labo.id", ondelete="SET NULL")),
    )

    # 2. Copy data from old table
    op.execute("""
        INSERT INTO chercheur_new (
            id, nom, prenom, email, telephone, grade,
            google_scholar_url, dblp_url, h_index, i_10_index, labo_id
        )
        SELECT
            id, nom, prenom, email, telephone, grade,
            google_scholar_url, dblp_url, h_index, i_10_index, labo_id
        FROM chercheur;
    """)

    # 3. Drop old table
    op.drop_table("chercheur")

    # 4. Rename new table to old name
    op.rename_table("chercheur_new", "chercheur")


def downgrade() -> None:
    # Reverse migration (recreate table without ON DELETE SET NULL)
    op.create_table(
        "chercheur_old",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("nom", sa.String(length=255), nullable=False),
        sa.Column("prenom", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("telephone", sa.String(length=50), nullable=True),
        sa.Column("grade", sa.String(length=50), nullable=False),
        sa.Column("google_scholar_url", sa.String(length=500), nullable=True),
        sa.Column("dblp_url", sa.String(length=500), nullable=True),
        sa.Column("h_index", sa.Integer, nullable=False, server_default="0"),
        sa.Column("i_10_index", sa.Integer, nullable=False, server_default="0"),
        sa.Column("labo_id", sa.Integer, sa.ForeignKey("labo.id")),  # no ON DELETE
    )

    op.execute("""
        INSERT INTO chercheur_old (
            id, nom, prenom, email, telephone, grade,
            google_scholar_url, dblp_url, h_index, i_10_index, labo_id
        )
        SELECT
            id, nom, prenom, email, telephone, grade,
            google_scholar_url, dblp_url, h_index, i_10_index, labo_id
        FROM chercheur;
    """)

    op.drop_table("chercheur")
    op.rename_table("chercheur_old", "chercheur")
