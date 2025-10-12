from sqlmodel import SQLModel,Field,Relationship
from pydantic import field_validator,HttpUrl
from enum import Enum

from .revue_schemas import ScimagoRanking
from .liens_chercheur_pub import LienChercheurConference
class CoreRanking(str,Enum):
    AA = "A*"
    A = "A"
    B = "B"
    C = "C"

class PublicationConferenceBase(SQLModel):
    titre : str
    abstract : str | None = Field(default=None)
    doi : str | None  = Field(default=None,unique=True,index=True)
    annee_publication : int = Field(...,gt=1950)
    url : str | None = Field(default=None,description="Lien vers la publication s'il existe")
    citations : int | None = Field(default=None)
    is_open_access : bool = False
    
    @field_validator("url")
    @classmethod
    def url_validator(cls,value):
        if value is None:
            return None
        HttpUrl(value)
        return value
    
    @field_validator("annee_publication")
    @classmethod
    def anee_validate(cls,value : int):
        if len(str(value)) != 4:
            raise ValueError("Année doit avoir 4 chiffres.")
        return value

class PublicationConference(PublicationConferenceBase,table = True):
    id : int = Field(...,primary_key=True)
    conference_id : int | None = Field(default=None,foreign_key="conference.id",ondelete='SET NULL')
    conference : "Conference" = Relationship(back_populates="publications")
    chercheur_links : list[LienChercheurConference] = Relationship(back_populates="publication_conference")


class ConferenceBase(SQLModel):
    nom : str 
    acronyme : str | None = None
    url : str | None = None

    @field_validator("acronyme","nom")
    @classmethod
    def upper_name_acronyme(cls,value):
        if value is None:
            return None
        return value.upper()
    

    @field_validator("url")
    @classmethod
    def url_validator(cls,value):
        if value is None:
            return None
        HttpUrl(value)
        return value


class Conference(ConferenceBase,table = True):
    id : int = Field(...,primary_key=True)
    publications : list[PublicationConference] = Relationship(back_populates="conference")
    rankings : list["ConferenceRanking"] = Relationship(back_populates="conference")



class ConferenceRankingBase(SQLModel):
    annee : int 
    core_ranking : CoreRanking | None = None
    scimago_rank: ScimagoRanking | None = None
    is_scopus_indexed : bool | None = False

    @field_validator("annee")
    @classmethod
    def anee_validate(cls,value : int):
        if len(str(value)) != 4:
            raise ValueError("Année doit avoir 4 chiffres.")
        return value

class ConferenceRanking(ConferenceRankingBase,table = True):
    conference_id : int = Field(...,primary_key=True,foreign_key="conference.id",ondelete='CASCADE')
    annee : int = Field(...,primary_key=True)
    conference : Conference = Relationship(back_populates="rankings")


