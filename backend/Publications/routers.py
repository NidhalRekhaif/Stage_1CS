from fastapi import APIRouter
from database import SessionDep
from sqlmodel import select,text
from sqlalchemy.orm import selectinload
from fastapi.responses import JSONResponse
from fastapi import HTTPException,Query,Response,Path
from starlette import status
from .conference_schemas import Conference,ConferenceRanking,PublicationConference
from .revue_schemas import PublicationRevue,RevueRanking,Revue
from .liens_chercheur_pub import LienChercheurConference,LienChercheurRevue
publications_router = APIRouter() 




@publications_router.get("/",response_model=list[PublicationRevue])
def get_publications(session : SessionDep):
    results = session.exec(select(PublicationRevue)).all()
    if not results:
        raise HTTPException(detail='no existing journal publications.',status_code=status.HTTP_400_BAD_REQUEST)
    return results


@publications_router.delete("/{publication_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_publication(session: SessionDep, publication_id: int = Path(...)):
    links = session.exec(
        select(LienChercheurRevue).where(LienChercheurRevue.publication_id == publication_id)
    ).all()

    result = session.get(PublicationRevue, publication_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Publication not found")

    # You can't pass a generator to session.delete() — delete each link individually
    for link in links:
        session.delete(link)

    session.delete(result)
    session.commit()



@publications_router.delete('/conference/{conference_id}',status_code=status.HTTP_204_NO_CONTENT)
def delete_conference(session:SessionDep,conference_id : int = Path(...)):
    result = session.exec(select(Conference).where(Conference.id == conference_id)).first()
    if not result:
        raise HTTPException(detail= 'inexistant',status_code=status.HTTP_400_BAD_REQUEST)
    session.delete(result)
    session.commit()


@publications_router.delete('/ranking/{conference_id}',status_code=status.HTTP_204_NO_CONTENT)
def delete_conference(session:SessionDep,conference_id : int = Path(...)):
    session.exec(text('delete from revue'))
    session.commit()