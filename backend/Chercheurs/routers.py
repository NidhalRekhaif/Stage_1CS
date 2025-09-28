from fastapi import APIRouter
from database import SessionDep
from .schemas import Chercheur,LaboBase,Labo,ChercheurUpdate,ChercheurBase,ChercheurCreate,ChercheurRead,LaboUpdate
from sqlmodel import select
from sqlalchemy.orm import selectinload
from fastapi.responses import JSONResponse
from fastapi import HTTPException,Query,Response,Path
from starlette import status
chercheurs_router = APIRouter()



@chercheurs_router.get("/labos",response_model=Labo | list[Labo])
def get_labo(session:SessionDep,labo_name : str | None = Query(default=None,description="Le nom de laboratoire à chercher",example="LCSI")):
    if labo_name:
        result = session.exec(select(Labo).where(Labo.nom == labo_name)).first()
        if result:
            return result
        else:
            raise HTTPException(detail=f"Labo avec le nom {labo_name} n'existe pas",status_code=status.HTTP_404_NOT_FOUND)
    else:
        results = session.exec(select(Labo)).all()
        return results
    


@chercheurs_router.post("/labos")
def add_labo(labo:LaboBase,session:SessionDep):
    try:
        db_labo = Labo(**labo.model_dump(exclude_unset=True))
        session.add(db_labo)
        session.commit()
        session.refresh(db_labo)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=e)
    return JSONResponse(content={'message':'sucess'},status_code=status.HTTP_201_CREATED)


@chercheurs_router.patch("/labos{labo_id}",response_model=Labo)
def patch_labo(session : SessionDep,labo : LaboUpdate,labo_id: int = Path(...,description="Le id de labo à modifier",example=1)):
    labo_db = session.get(Labo,labo_id)
    if not labo_db:
        raise HTTPException(detail="Labo introuvable",status_code=status.HTTP_404_NOT_FOUND)
    labo_data = labo.model_dump(exclude_unset=True)
    labo_db.sqlmodel_update(labo_data)
    session.add(labo_db)
    session.commit()
    session.refresh(labo_db)
    return labo_db


@chercheurs_router.delete("/labos{labo_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_labo(session:SessionDep,labo_id : int = Path(...)):
    labo_db = session.get(Labo,labo_id)
    if not labo_db:
        raise HTTPException(detail="Laboratoire introuvable.",status_code=status.HTTP_404_NOT_FOUND)
    session.delete(labo_db)
    session.commit()


@chercheurs_router.get("/",response_model=list[ChercheurRead] )
def get_chercheurs(session:SessionDep):
    result = session.exec(select(Chercheur))
    if not result:
        raise HTTPException(detail="Il n'y a pas de chercheurs à ce moment",status_code=status.HTTP_400_BAD_REQUEST)
    return result



@chercheurs_router.post("/", response_model=Chercheur)
def create_chercheur(chercheur: ChercheurCreate, session: SessionDep):
    db_chercheur = Chercheur.model_validate(chercheur)
    session.add(db_chercheur)
    session.commit()
    session.refresh(db_chercheur)
    return db_chercheur



@chercheurs_router.patch("/{chercheur_id}",response_model=ChercheurBase)
def update_chercheur(session:SessionDep,chercheur:ChercheurUpdate,chercheur_id : int = Path(...,ge=0)):
    result = session.get(Chercheur,chercheur_id)
    if result:
        chercheur_data = chercheur.model_dump(exclude_unset=True)
        result.sqlmodel_update(chercheur_data)
        session.add(result)
        session.commit()
        session.refresh(result)
        return result
    else:
        raise HTTPException(detail="Chercheur introuvable.",status_code=status.HTTP_404_NOT_FOUND)
    

@chercheurs_router.delete("/{chercheur_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_chercheur(session : SessionDep,chercheur_id : int = Path(...)):
    result = session.get(Chercheur,chercheur_id)
    if not result:
        raise HTTPException(detail="Chercheur introuvable.",status_code=status.HTTP_404_NOT_FOUND)
    session.delete(result)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)