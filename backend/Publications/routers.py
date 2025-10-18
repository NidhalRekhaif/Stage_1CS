from fastapi import APIRouter
from database import SessionDep
from sqlmodel import select,text
from sqlalchemy.orm import selectinload
from fastapi.responses import JSONResponse
from fastapi import HTTPException,Query,Response,Path
from starlette import status
from .conference_schemas import Conference,ConferenceRanking,PublicationConference,ConferenceBase,ConferenceUpdate,ConferenceRankingCreate,ConferenceRankingUpdate,PublicationConferenceCreate,PublicationConferenceUpdate
from .revue_schemas import PublicationRevue,RevueRanking,Revue,RevueBase,RevueUpdate,RevueRankingCreate,RevueRankingUpdate,PublicationRevueCreate,PublicationRevueUpdate
from .liens_chercheur_pub import LienChercheurConference,LienChercheurRevue,LienCreate,LienUpdate
from sqlalchemy import func
from Chercheurs.schemas import Chercheur
publications_router = APIRouter() 
revue_router = APIRouter()
conference_router = APIRouter()

@revue_router.post('/',response_model = Revue,status_code=status.HTTP_201_CREATED)
def add_revue(revue : RevueBase,session:SessionDep):
    result = None
    if revue.issn:
        result = session.exec(
            select(Revue)
            .where(Revue.issn == revue.issn)
        ).first()
    if not result:
        if revue.nom.endswith('.'):
            normalized_name = revue.nom.strip().rstrip('.')
        else:
            normalized_name = revue.nom.strip() + '.'
        result = session.exec(
            select(Revue)
            .where((func.trim(func.upper(Revue.nom)) == revue.nom.strip().upper()) | (func.trim(Revue.nom).ilike(normalized_name)))
        ).first()
    if result:
        raise HTTPException(detail='Revue existe déja dans le systeme',status_code=status.HTTP_400_BAD_REQUEST)
    result = Revue(**revue.model_dump())
    session.add(result)
    session.flush()
    session.refresh(result)
    print(result)
    return result




@revue_router.patch('/{revue_id}',response_model=Revue,status_code=status.HTTP_200_OK)
def patch_revue(revue_update : RevueUpdate,session: SessionDep,revue_id: int = Path(...)):
    revue = session.get(Revue,revue_id)
    if not revue:
        raise HTTPException(detail="Revue n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    validated_data = revue_update.model_dump(exclude_unset=True)
    revue.sqlmodel_update(validated_data)
    session.add(revue)
    session.flush()
    session.refresh(revue)
    print(revue)
    return revue

@revue_router.delete('/{revue_id}',status_code=status.HTTP_204_NO_CONTENT)
def delete_revue(session : SessionDep,revue_id :int = Path(...)):
    result = session.get(Revue,revue_id)
    if not result:
        raise HTTPException(detail="Revue n'existe pas",status_code=status.HTTP_404_NOT_FOUND)
    rankings = session.exec(
        select(RevueRanking)
        .where(RevueRanking.revue_id == revue_id)
    ).all()
    for ranking in rankings:
        session.delete(ranking)
    session.delete(result)
    session.commit()


@revue_router.post('/ranking',response_model=RevueRanking,status_code=status.HTTP_201_CREATED)
def add_revue_ranking(ranking:RevueRankingCreate,session:SessionDep):
    result = session.get(Revue,ranking.revue_id)
    if not result:
        raise HTTPException(detail="Impossible d'insérer le ranking car la revue n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    result = session.exec(
        select(RevueRanking)
        .where((RevueRanking.revue_id == ranking.revue_id) & (RevueRanking.annee == ranking.annee))
    ).first()
    if result:
        raise HTTPException(detail="Le ranking existe déja.",status_code=status.HTTP_400_BAD_REQUEST)
    result = RevueRanking(**ranking.model_dump())
    session.add(result)
    session.flush()
    session.refresh(result)
    return result
    

@revue_router.patch('/ranking/{revue_id}/{annee}',response_model=RevueRanking,status_code=status.HTTP_200_OK)
def patch_ranking(revue:RevueRankingUpdate,session:SessionDep,revue_id : int = Path(...),annee : int = Path(...)):
    
    result = session.get(RevueRanking,(revue_id,annee))
    if not result:
        raise HTTPException(detail="Le ranking de cette revue dans cette année n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    validated_data = revue.model_dump(exclude_unset=True)
    result.sqlmodel_update(validated_data)
    session.add(result)
    session.flush()
    session.refresh(result)
    return result


@revue_router.delete('/ranking/{revue_id}/{annee}',status_code=status.HTTP_204_NO_CONTENT)
def delete_revue_ranking(session : SessionDep,revue_id : int = Path(...),annee : int = Path(...)):
    result = session.get(RevueRanking,(revue_id,annee))
    if not result:
        raise HTTPException(detail="Revue ranking pour cette année n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    session.delete(result)
    session.commit()




@conference_router.post('/',response_model=Conference,status_code=status.HTTP_201_CREATED)
def add_conference(conference : ConferenceBase,session:SessionDep):
    if conference.nom.endswith('.'):
        normalized_name = conference.nom.strip().rstrip('.')
    else:
        normalized_name = conference.nom.strip() + '.'
    result = session.exec(
        select(Conference)
        .where((func.trim(Conference.nom).ilike(normalized_name)) | (func.trim(Conference.nom).ilike(conference.nom.strip()))
    )).first()

    if result:
        raise HTTPException(detail = "Conference existe déja.",status_code=status.HTTP_400_BAD_REQUEST)
    result = Conference(**conference.model_dump())
    session.add(result)
    session.flush()
    session.refresh(result)
    print(result)
    return result
    
@conference_router.patch('/{conference_id}')
def patch_conference(conference : ConferenceUpdate,session : SessionDep,conference_id : int = Path(...)):
    result = session.get(Conference,conference_id)
    if not result:
        raise HTTPException(detail="Conference n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    validated_data = conference.model_dump(exclude_unset=True)
    result.sqlmodel_update(validated_data)
    session.add(result)
    session.flush()
    session.refresh(result)
    print(result)
    return result


@conference_router.delete('/{conference_id}',status_code=status.HTTP_204_NO_CONTENT)
def delete_conference(session : SessionDep,conference_id :int = Path(...)):
    result = session.get(Conference,conference_id)
    if not result:
        raise HTTPException(detail="Conference n'existe pas",status_code=status.HTTP_404_NOT_FOUND)
    rankings = session.exec(
        select(ConferenceRanking)
        .where(ConferenceRanking.conference_id == conference_id)
    ).all()
    for ranking in rankings:
        session.delete(ranking)
    session.delete(result)
    session.commit()




@conference_router.post('/ranking',response_model=ConferenceRanking,status_code=status.HTTP_201_CREATED)
def add_conference_ranking(ranking:ConferenceRankingCreate,session:SessionDep):
    result = session.get(Conference,ranking.conference_id)
    if not result:
        raise HTTPException(detail="Impossible d'insérer le ranking car la conférence n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    result = session.exec(
        select(ConferenceRanking)
        .where((ConferenceRanking.conference_id == ranking.conference_id) & (ConferenceRanking.annee == ranking.annee))
    ).first()
    if result:
        raise HTTPException(detail="Le ranking existe déja.",status_code=status.HTTP_400_BAD_REQUEST)
    result = ConferenceRanking(**ranking.model_dump())
    session.add(result)
    session.flush()
    session.refresh(result)
    return result


@conference_router.patch('/ranking/{conference_id}/{annee}',response_model=ConferenceRanking,status_code=status.HTTP_200_OK)
def patch_conference_ranking(ranking:ConferenceRankingUpdate,session:SessionDep,conference_id : int = Path(...),annee : int = Path(...)):
    result = session.get(ConferenceRanking,(conference_id,annee))
    if not result:
        raise HTTPException(detail="Le ranking de cette conference dans cette année n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    validated_data = ranking.model_dump(exclude_unset=True)
    result.sqlmodel_update(validated_data)
    session.add(result)
    session.flush()
    session.refresh(result)
    return result


@conference_router.delete('/ranking/{conference_id}/{annee}',status_code=status.HTTP_204_NO_CONTENT)
def delete_conference_ranking(session : SessionDep, conference_id : int = Path(...),annee : int = Path(...)):
    result = session.get(ConferenceRanking,(conference_id,annee))
    if not result:
        raise HTTPException(detail="Revue ranking pour cette année n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    session.delete(result)
    session.commit()







@publications_router.post('/revue',status_code=status.HTTP_201_CREATED)
def add_publication_revue(session:SessionDep,publication_revue : PublicationRevueCreate,chercheur_id : int = Query(...,description='ID du chercheur')):
    result = None
    normalized_name = None


    chercheur = session.get(Chercheur, chercheur_id)
    if not chercheur:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chercheur n'existe pas.")

    revue = session.get(Revue, publication_revue.revue_id)
    if not revue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revue n'existe pas.")
    

    if publication_revue.doi:
        result = session.exec(
            select(PublicationRevue)
            .where(PublicationRevue.doi == publication_revue.doi)
        ).first()
    if not result:
        if publication_revue.titre.endswith('.'):
            normalized_name = publication_revue.titre.strip().rstrip('.')
        else:
            normalized_name = publication_revue.titre.strip() + '.'
        result = session.exec(
            select(PublicationRevue)
            .where((func.trim(PublicationRevue.titre).ilike(normalized_name)) | (func.trim(PublicationRevue.titre).ilike(publication_revue.titre.strip()))
        )).first()
    if result:
       raise HTTPException(detail="La publication existe déja.",status_code=status.HTTP_400_BAD_REQUEST)
    publication = PublicationRevue(**publication_revue.model_dump())
    session.add(publication)
    session.flush()
    session.refresh(publication)
    link = LienChercheurRevue(chercheur_id=chercheur_id,chercheur_ordre=publication_revue.chercheur_ordre,publication_id=publication.id)
    session.add(link)
    session.flush()
    session.refresh(link)
    return publication    






@publications_router.patch('/revue/{publication_id}',response_model=PublicationRevue,status_code=status.HTTP_200_OK)
def patch_publication_revue(publication:PublicationRevueUpdate,session:SessionDep,publication_id : int = Path(...)):
    result = session.get(PublicationRevue,publication_id)
    if not result:
        raise HTTPException(detail="La publication n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    validated_data = publication.model_dump(exclude_unset=True)
    result.sqlmodel_update(validated_data)
    session.add(result)
    session.flush()
    session.refresh(result)
    return result



@publications_router.delete("/revue/{publication_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_publication(session: SessionDep, publication_id: int = Path(...)):

    result = session.get(PublicationRevue, publication_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")

    links = session.exec(
        select(LienChercheurRevue).where(LienChercheurRevue.publication_id == publication_id)
    ).all()
    # You can't pass a generator to session.delete() — delete each link individually
    for link in links:
        session.delete(link)

    session.delete(result)
    session.commit()





@publications_router.post('/conference',status_code=status.HTTP_201_CREATED)
def add_publication_conference(session:SessionDep,publication_conference : PublicationConferenceCreate,chercheur_id : int = Query(...,description='ID du chercheur')):
    result = None
    normalized_name = None


    chercheur = session.get(Chercheur, chercheur_id)
    if not chercheur:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chercheur n'existe pas.")

    revue = session.get(Conference, publication_conference.conference_id)
    if not revue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conference n'existe pas.")
    

    if publication_conference.doi:
        result = session.exec(
            select(PublicationConference)
            .where(PublicationConference.doi == publication_conference.doi)
        ).first()
    if not result:
        if publication_conference.titre.endswith('.'):
            normalized_name = publication_conference.titre.strip().rstrip('.')
        else:
            normalized_name = publication_conference.titre.strip() + '.'
        result = session.exec(
            select(PublicationConference)
            .where((func.trim(PublicationConference.titre).ilike(normalized_name)) | (func.trim(PublicationConference.titre).ilike(publication_conference.titre.strip()))
        )).first()
    if result:
       raise HTTPException(detail="La publication existe déja.",status_code=status.HTTP_400_BAD_REQUEST)
    publication = PublicationConference(**publication_conference.model_dump())
    session.add(publication)
    session.flush()
    session.refresh(publication)
    link = LienChercheurConference(chercheur_id=chercheur_id,chercheur_ordre=publication_conference.chercheur_ordre,publication_id=publication.id)
    session.add(link)
    session.flush()
    session.refresh(link)
    return publication  




@publications_router.patch('/conference/{publication_id}',response_model=PublicationConference,status_code=status.HTTP_200_OK)
def patch_publication_revue(publication:PublicationConferenceUpdate,session:SessionDep,publication_id : int = Path(...)):
    result = session.get(PublicationConference,publication_id)
    if not result:
        raise HTTPException(detail="La publication n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    validated_data = publication.model_dump(exclude_unset=True)
    result.sqlmodel_update(validated_data)
    session.add(result)
    session.flush()
    session.refresh(result)
    return result



@publications_router.delete("/conference/{publication_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_publication(session: SessionDep, publication_id: int = Path(...)):

    result = session.get(PublicationConference, publication_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")

    links = session.exec(
        select(LienChercheurConference).where(LienChercheurConference.publication_id == publication_id)
    ).all()
    # You can't pass a generator to session.delete() — delete each link individually
    for link in links:
        session.delete(link)

    session.delete(result)
    session.commit()


@publications_router.post('/revue/link',response_model=LienChercheurRevue,status_code=status.HTTP_201_CREATED)
def add_link_revue(link:LienCreate,session:SessionDep):
    chercheur = session.get(Chercheur,link.chercheur_id)
    if not chercheur:
        raise HTTPException(detail="Chercheur n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    publication = session.get(PublicationRevue,link.publication_id)
    if not publication:
        raise HTTPException(detail="Publication n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    result = LienChercheurRevue(**link.model_dump())
    session.add(result)
    session.flush()
    session.refresh(result)
    return link



@publications_router.patch('/revue/link/{chercheur_id}/{publication_id}',response_model=LienChercheurRevue,status_code=status.HTTP_200_OK)
def patch_link_revue(link:LienUpdate,session:SessionDep,chercheur_id : int = Path(...),publication_id: int = Path(...)):
    chercheur = session.get(Chercheur,chercheur_id)
    if not chercheur:
        raise HTTPException(detail="Chercheur n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    publication = session.get(PublicationRevue,publication_id)
    if not publication:
        raise HTTPException(detail="Publication n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)

    result = session.get(LienChercheurRevue,(chercheur_id,publication_id))
    if not result:
        raise HTTPException(detail="Le chercheur n'a pas contribué dans la publication.",status_code=status.HTTP_404_NOT_FOUND)
    validated_data = link.model_dump(exclude_unset=True)
    result.sqlmodel_update(validated_data)
    session.add(result)
    session.flush()
    session.refresh(result)
    return result




@publications_router.post('/conference/link',response_model=LienChercheurConference,status_code=status.HTTP_201_CREATED)
def add_link_revue(link:LienCreate,session:SessionDep):
    chercheur = session.get(Chercheur,link.chercheur_id)
    if not chercheur:
        raise HTTPException(detail="Chercheur n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    publication = session.get(PublicationConference,link.publication_id)
    if not publication:
        raise HTTPException(detail="Publication n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    result = LienChercheurConference(**link.model_dump())
    session.add(result)
    session.flush()
    session.refresh(result)
    return link


@publications_router.patch('/conference/link/{chercheur_id}/{publication_id}',response_model=LienChercheurConference,status_code=status.HTTP_200_OK)
def patch_link_revue(link:LienUpdate,session:SessionDep,chercheur_id : int = Path(...),publication_id: int = Path(...)):
    chercheur = session.get(Chercheur,chercheur_id)
    if not chercheur:
        raise HTTPException(detail="Chercheur n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    publication = session.get(PublicationConference,publication_id)
    if not publication:
        raise HTTPException(detail="Publication n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)

    result = session.get(LienChercheurConference,(chercheur_id,publication_id))
    if not result:
        raise HTTPException(detail="Le chercheur n'a pas contribué dans la publication.",status_code=status.HTTP_404_NOT_FOUND)
    validated_data = link.model_dump(exclude_unset=True)
    result.sqlmodel_update(validated_data)
    session.add(result)
    session.flush()
    session.refresh(result)
    return result