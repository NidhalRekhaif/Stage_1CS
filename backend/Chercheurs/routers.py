from fastapi import APIRouter
from database import SessionDep
from .schemas import Chercheur,LaboBase,Labo,ChercheurUpdate,ChercheurBase,ChercheurCreate,ChercheurRead,LaboUpdate
from sqlmodel import select
from sqlalchemy.orm import selectinload
from fastapi.responses import JSONResponse
from fastapi import HTTPException,Query,Response,Path
from starlette import status
chercheurs_router = APIRouter()



@chercheurs_router.get("/labos",response_model=list[Labo])
def get_labo(session:SessionDep,page : int = Query(1),page_size : int = Query(10),labo_name : str | None = Query(default=None,description="Le nom de laboratoire à chercher",example="LCSI")):
    if labo_name:
        result = session.exec(select(Labo).where(Labo.nom == labo_name)).all()
        if result:
            return result
        else:
            raise HTTPException(detail=f"Labo avec le nom {labo_name} n'existe pas",status_code=status.HTTP_404_NOT_FOUND)
    else:
        results = session.exec(select(Labo).offset((page-1)*page_size).limit(page_size)).all()
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


@chercheurs_router.get("/", status_code=status.HTTP_200_OK)
def get_chercheurs(
    session: SessionDep,
    nom: str | None = Query(None, description="Filtrer par nom du chercheur"),
    prenom: str | None = Query(None, description="Filtrer par prénom du chercheur"),
    labo_id: int | None = Query(None, description="Filtrer par laboratoire ID"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=10),
):
    """
    Récupérer la liste des chercheurs avec filtres facultatifs :
    - nom
    - prénom
    - laboratoire
    """

    query = select(Chercheur)

    # Apply filters if provided
    if nom is not None:
        query = query.where((Chercheur.nom).ilike(f"{nom.lower()}%"))
    if prenom is not None:
        query = query.where((Chercheur.prenom).ilike(f"{prenom.lower()}%"))
    if labo_id is not None:
        if labo_id == 0:
            query = query.where(Chercheur.labo_id.is_(None))
        else:
            query = query.where(Chercheur.labo_id == labo_id)

    # Pagination
    offset = (page - 1) * limit
    chercheurs = session.exec(query.offset(offset).limit(limit)).all()

    if not chercheurs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucun chercheur trouvé.")

    return {'page':page,
            'limit':limit,
        'data':chercheurs
        }



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