from sqlmodel import SQLModel,Field,Relationship
from pydantic import EmailStr,field_validator,HttpUrl
from typing import Annotated,Literal,Optional
import re
from enum import Enum
from Publications.liens_chercheur_pub import LienChercheurConference,LienChercheurRevue

from enum import Enum

class GradeEnum(str, Enum):
    DOCTORANT = "Doctorant"
    MAITRE_ASSISTANT_B = "Maitre Assistant B"
    MAITRE_ASSISTANT_A = "Maitre Assistant A"
    MAITRE_CONFERENCE_B = "Maitre Conference B"
    MAITRE_CONFERENCE_A = "Maitre Conference A"
    PROFESSEUR = "Professeur"
    Unknown = "Inconnu"

class LaboBase(SQLModel):
    nom : str = Field(...,unique=True)
    description : str | None = Field(default=None)
    siteweb : str | None = Field(default=None)


    def model_post_init(self, __context):
        if self.nom:
            self.nom = self.nom.upper()

    @field_validator('siteweb')
    @classmethod
    def validate_urls(cls, value):
        if value is None:
            return value
        HttpUrl(value)  
        return value

class Labo(LaboBase,table=True):
    id: int | None = Field(default=None,primary_key=True,ge=0)
    chercheurs:list["Chercheur"] = Relationship(back_populates="labo")






class LaboUpdate(LaboBase):
    nom : str | None = None
    description : str | None = None
    siteweb : str | None = None




class ChercheurBase(SQLModel):
    nom : str
    prenom : str
    email : Annotated[EmailStr,Field(unique=True)]
    telephone : str | None = Field(default=None)
    grade : GradeEnum = Field(...,description="Grade du chercheur")
    google_scholar_url : str | None = Field(default=None,description="lien vers le profile de google scholar")
    dblp_url : str | None = Field(default=None,description="lien vers le profile de DBLP")
    h_index : int = Field(default=0,description="h-index du chercheur")
    i_10_index : int = Field(default=0,description="i-10 index du chercheur")
    @property
    def full_name(self):
        return f"{self.prenom} {self.nom}"


    @field_validator("telephone")
    @classmethod
    def telephone_validator(cls,value:str):
        if value is None :
            return value
        cleaned_phone:str = re.sub(r'[^\d]', '', value)
        if len(cleaned_phone) != 10:
            raise ValueError("Telephone doit avoir 10 nombres.")
        if not cleaned_phone.startswith(('05','06','07')):
            raise ValueError("Numero de telephone est invalide.")
        return cleaned_phone

    @field_validator("google_scholar_url", "dblp_url")
    @classmethod
    def validate_urls(cls, value):
        if value is None:
            return value
        HttpUrl(value)  
        return value
    

    @field_validator('nom')
    @classmethod
    def upper_nom(cls, value: str) -> str:
        return value.upper() if value else value
    


    @field_validator('prenom')
    @classmethod
    def upper_prenom(cls, value: str) -> str:
        return value.upper() if value else value
    

    def model_post_init(self, __context):
        if self.nom:
           self.nom = self.nom.upper()
        if self.prenom:
           self.prenom = self.prenom.upper()


class Chercheur(ChercheurBase,table=True):
    id : int | None = Field(default=None,primary_key=True,ge=0)
    labo_id : int | None = Field(default=None,foreign_key="labo.id",ondelete='SET NULL')
    labo:Labo = Relationship(back_populates="chercheurs")
    conference_links : list[LienChercheurConference] = Relationship(back_populates="chercheur")
    revue_links : list[LienChercheurRevue] = Relationship(back_populates="chercheur")




class ChercheurUpdate(ChercheurBase):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    grade: Optional[GradeEnum] = None
    google_scholar_url: Optional[str] = None
    dblp_url: Optional[str] = None
    h_index: Optional[int] = None
    i_10_index: Optional[int] = None
    labo_id: Optional[int] = None




class ChercheurCreate(ChercheurBase):
    labo_id : int | None = Field(default=None)


class ChercheurRead(ChercheurBase):
    id : int | None
    labo_id : int | None = None
# class DummyBase(SQLModel):
#     name : str | None = None
# class Dummy(DummyBase,table=True):
#     id : int | None = Field(primary_key=True,default=None)

# class DummyInherit(DummyBase): dummy code for showcase 
    # extra : int = 0
