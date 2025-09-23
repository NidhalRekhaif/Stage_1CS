from fastapi import APIRouter
from database import SessionDep
from .schemas import Chercheur,LaboMake,Labo,ChercheurUpdate
from sqlmodel import select
from fastapi.responses import JSONResponse
from fastapi import HTTPException,Query,Response,Path
from starlette import status
chercheurs_router = APIRouter()


@chercheurs_router.get("/",response_model=list[Chercheur])
def get_chercheurs(session:SessionDep):
    result = session.exec(select(Chercheur))
    return result

@chercheurs_router.get("/labos",response_model=LaboMake | list[LaboMake])
def get_labo(session:SessionDep,labo_name : str | None = Query(default=None,description="Le nom de laboratoire à chercher",example="LCSI")):
    if labo_name:
        result = session.exec(select(Labo).where(Labo.nom == labo_name)).first()
        if result:
            return JSONResponse(content=LaboMake(**result.model_dump()).model_dump(),status_code=status.HTTP_200_OK)
        else:
            raise HTTPException(detail=f"Labo avec le nom {labo_name} n'existe pas",status_code=status.HTTP_404_NOT_FOUND)
    else:
        results = session.exec(select(Labo)).all()
        return results
@chercheurs_router.post("/labos")
def add_labo(labo:LaboMake,session:SessionDep):
    try:
        db_labo = Labo(**labo.model_dump(exclude_unset=True))
        session.add(db_labo)
        session.commit()
        session.refresh(db_labo)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=e)
    return JSONResponse(content={'message':'sucess'},status_code=status.HTTP_201_CREATED)

@chercheurs_router.patch("/{chercheur_id}",response_model=Chercheur)
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