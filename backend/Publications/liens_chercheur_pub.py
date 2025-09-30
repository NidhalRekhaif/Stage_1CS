from sqlmodel import SQLModel,Field,Relationship



class LienChercheurConference(SQLModel,table = True):
    chercheur_id: int = Field(foreign_key="chercheur.id", primary_key=True,ondelete='CASCADE')
    publication_id: int = Field(foreign_key="publicationconference.id", primary_key=True,ondelete='CASCADE')
    
    chercheur_ordre: int | None = Field(default=None, description="Position du chercheur dans la publication.")

    chercheur: "Chercheur" = Relationship(back_populates="conference_links")
    publication_conference: "PublicationConference" = Relationship(back_populates="chercheur_links")



class LienChercheurRevue(SQLModel,table = True):
    chercheur_id: int = Field(foreign_key="chercheur.id", primary_key=True,ondelete='CASCADE')
    publication_id: int = Field(foreign_key="publicationrevue.id", primary_key=True,ondelete='CASCADE')
    
    chercheur_ordre: int | None = Field(default=None, description="Position du chercheur dans la publication.")

    chercheur: "Chercheur" = Relationship(back_populates="revue_links")
    publication_revue: "PublicationRevue" = Relationship(back_populates="chercheur_links")
