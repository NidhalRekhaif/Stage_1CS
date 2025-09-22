from sqlmodel import SQLModel,Field,Relationship
from pydantic import EmailStr,field_validator,HttpUrl
from typing import Annotated,Literal
import re
from enum import Enum


from enum import Enum

class GradeEnum(str, Enum):
    DOCTORANT = "Doctorant"
    MAITRE_ASSISTANT_B = "Maitre Assistant B"
    MAITRE_ASSISTANT_A = "Maitre Assistant A"
    MAITRE_CONFERENCE_B = "Maitre Conference B"
    MAITRE_CONFERENCE_A = "Maitre Conference A"
    PROFESSEUR = "Professeur"


class Labo(SQLModel,table=True):
    id: int = Field(primary_key=True,ge=0)
    nom : str
    description : str | None = Field(default=None)
    siteweb : str | None = Field(default=None)
    chercheurs:list["Chercheur"] = Relationship(back_populates="labo")
class Chercheur(SQLModel,table=True):
    id : int | None = Field(default=None,primary_key=True,ge=0)
    nom : str
    prenom : str
    email : Annotated[EmailStr,Field(unique=True)]
    telephone : str | None = Field(default=None)
    grade : GradeEnum = Field(...,description="Grade du chercheur")
    google_scholar_url : str | None = Field(default=None,description="lien vers le profile de google scholar")
    dblp_url : str | None = Field(default=None,description="lien vers le profile de DBLP")
    h_index : int = Field(default=0,description="h-index du chercheur")
    i_10_index : int = Field(default=0,description="i-10 index du chercheur")
    labo_id : int | None = Field(default=None,foreign_key="labo.id")
    labo:Labo = Relationship(back_populates="chercheurs")

    @property
    def full_name(self):
        return f"{self.nom} {self.prenom}"


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
    def validate_urls(cls, v):
        if v is None:
            return v
        HttpUrl(v)  
        return v