from sqlmodel import SQLModel,Field,Relationship,CheckConstraint
from pydantic import field_validator,HttpUrl
from enum import Enum
from .liens_chercheur_pub import LienChercheurRevue
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
    UNKNOWN = '-'
    


class PublicationRevueBase(SQLModel):
    titre : str 
    abstract : str | None = Field(default=None)
    doi : str | None  = Field(default=None,unique=True,index=True)
    annee_publication : int = Field(...,gt=1950)
    citations : int | None = Field(default=None)
    url : str | None = Field(default=None,description="Lien vers la publication s'il existe")
    is_open_access : bool | None = None



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
    id : int | None = Field(default=None,primary_key=True)
    revue_id : int | None = Field(default=None,foreign_key="revue.id",ondelete="SET NULL")
    revue : "Revue" = Relationship(back_populates="publications")
    chercheur_links : list [LienChercheurRevue] = Relationship(back_populates="publication_revue")


class PublicationRevueCreate(SQLModel):
    titre: str
    annee_publication: int
    abstract : str | None = None
    doi: str | None = None
    is_open_access: bool | None = None
    citations : int | None = Field(...,ge=0)
    url : str | None = None
    revue_id: int | None = None
    chercheur_ordre: str | None = None


    @field_validator("url")
    @classmethod
    def validate_url(cls,value : str | None):
        if value is None:
            return None
        HttpUrl(value)
        return value

class PublicationRevueUpdate(PublicationRevueBase):
    titre : str | None = None

class RevueBase(SQLModel):
    nom : str
    issn : str | None = Field(default=None,unique=True,index=True)
    e_issn : str | None = Field(default=None,unique=True,index=True)
    url : str | None = None

    @field_validator("url")
    @classmethod
    def url_validator(cls,value):
        if value is None:
            return None
        HttpUrl(value)
        return value
    
    

class Revue(RevueBase,table=True):
    id : int | None = Field(default=None,primary_key=True)
    publications : list[PublicationRevue] = Relationship(back_populates="revue")
    rankings : list["RevueRanking"] = Relationship(back_populates="revue")


class RevueUpdate(RevueBase):
    nom : str | None = None
    issn : str | None = None
    e_issn : str | None = None
    url :str | None = None

class RevueRankingBase(SQLModel):
    scimago_rank : ScimagoRanking | None = None
    dgrsdt_rank : str | None = None
    is_scopus_indexed : bool | None = None






class RevueRanking(RevueRankingBase,table = True):
    annee : int | None = Field(default=None,primary_key=True)
    revue_id : int | None = Field(default=None,foreign_key="revue.id",primary_key=True,ondelete='CASCADE')
    revue : Revue = Relationship(back_populates="rankings")


    __table_args__ = (
        CheckConstraint(
            "scimago_rank IN ('Q1', 'Q2', 'Q3', 'Q4') OR scimago_rank IS NULL",
            name="valid_scimago_rank",
        ),
        CheckConstraint(
        "dgrsdt_rank IN ('A+','A','B','C','D','E') OR dgrsdt_rank IS NULL",
        name='validate_dgrsdt_rank',
        ),
    )

    @field_validator("annee")
    @classmethod
    def anee_validate(cls,value : int):
        if len(str(value)) != 4:
            raise ValueError("Année doit avoir 4 chiffres.")
        return value

class RevueRankingCreate(RevueRankingBase):
    annee : int = Field(...,ge=1950)
    revue_id : int = Field(...)



class RevueRankingUpdate(RevueRankingBase):
    pass