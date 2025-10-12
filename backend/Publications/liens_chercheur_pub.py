from sqlmodel import SQLModel,Field,Relationship
from pydantic import field_validator


class LienChercheurConference(SQLModel,table = True):
    chercheur_id: int = Field(foreign_key="chercheur.id", primary_key=True,ondelete='CASCADE')
    publication_id: int = Field(foreign_key="publicationconference.id", primary_key=True,ondelete='CASCADE')
    
    chercheur_ordre: str | None = Field(default=None, description="Position du chercheur dans la publication.")

    chercheur: "Chercheur" = Relationship(back_populates="conference_links")
    publication_conference: "PublicationConference" = Relationship(back_populates="chercheur_links")

    @field_validator("chercheur_ordre")
    @classmethod
    def validate_chercheur_ordre(cls,value:str):
        if value is None:
            return None
        if value.strip().lower() not in ['first','middle','last']:
            raise ValueError("Cet ordre n'est pas accepté choisissez:first,middle ou last")
        return value.strip().lower()

class LienChercheurRevue(SQLModel,table = True):
    chercheur_id: int = Field(foreign_key="chercheur.id", primary_key=True,ondelete='CASCADE')
    publication_id: int = Field(foreign_key="publicationrevue.id", primary_key=True,ondelete='CASCADE')
    
    chercheur_ordre: str | None = Field(default=None, description="Position du chercheur dans la publication.")

    chercheur: "Chercheur" = Relationship(back_populates="revue_links")
    publication_revue: "PublicationRevue" = Relationship(back_populates="chercheur_links")



    @field_validator("chercheur_ordre")
    @classmethod
    def validate_chercheur_ordre(cls,value:str):
        if value is None:
            return None
        if value.strip().lower() not in ['first','middle','last']:
            raise ValueError("Cet ordre n'est pas accepté choisissez:first,middle ou last")
        return value.strip().lower()
