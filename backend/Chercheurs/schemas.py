from sqlmodel import SQLModel,Field


class Chercheur(SQLModel,table=True):
    id : int | None = Field(default=None,primary_key=True,ge=0)
    nom: str | None = None
