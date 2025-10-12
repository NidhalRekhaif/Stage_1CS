from sqlmodel import SQLModel,Field,Relationship
from pydantic import field_validator,HttpUrl
from enum import Enum
from Publications.liens_chercheur_pub import LienChercheurRevue
class DgrstRanking(str,Enum):
    AA = "A+"
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    E = "E"
    PEDIATRICE = "PEDIATRICE"



class ScimagoRanking(str,Enum):
    Q1 = "Q1"
    Q2 = "Q2"
    Q3 = "Q3"
    Q4 = "Q4"
    


class PublicationRevueBase(SQLModel):
    titre : str 
    abstract : str | None = Field(default=None)
    doi : str | None  = Field(default=None,unique=True,index=True)
    annee_publication : int = Field(...,gt=1950)
    url : str | None = Field(default=None,description="Lien vers la publication s'il existe")
    is_open_access : bool = False



    @field_validator("annee_publication")
    @classmethod
    def anee_validate(cls,value : int):
        if len(str(value)) != 4:
            raise ValueError("Année doit avoir 4 chiffres.")
        return value



    @field_validator("url")
    @classmethod
    def url_validator(cls,value):
        if value is None:
            return None
        HttpUrl(value)
        return value



class PublicationRevue(PublicationRevueBase,table=True):
    id : int = Field(...,primary_key=True)
    revue_id : int | None = Field(default=None,foreign_key="revue.id",ondelete="SET NULL")
    revue : "Revue" = Relationship(back_populates="publications")
    chercheur_links : list [LienChercheurRevue] = Relationship(back_populates="publication_revue")


class RevueBase(SQLModel):
    nom : str
    issn : str | None = Field(default=None,unique=True,index=True)
    e_issn : str | None = Field(default=None,unique=True,index=True)
    url : str | None = None

    @field_validator("issn","e_issn")
    @classmethod
    def transform_issn(cls,value : str | None):
        if not value:
            return None
        return value.replace('-','')

class Revue(RevueBase,table=True):
    id : int = Field(...,primary_key=True)
    publications : list[PublicationRevue] = Relationship(back_populates="revue")
    rankings : list["RevueRanking"] = Relationship(back_populates="revue")



class RevueRankingBase(SQLModel):
    annee : int 
    scimago_rank : ScimagoRanking | None = None
    dgrsdt_rank : DgrstRanking | None = None
    is_scopus_indexed : bool | None = False

    @field_validator("annee")
    @classmethod
    def anee_validate(cls,value : int):
        if len(str(value)) != 4:
            raise ValueError("Année doit avoir 4 chiffres.")
        return value


class RevueRanking(RevueRankingBase,table = True):
    annee : int = Field(...,primary_key=True)
    revue_id : int = Field(...,foreign_key="revue.id",primary_key=True,ondelete='CASCADE')
    revue : Revue = Relationship(back_populates="rankings")