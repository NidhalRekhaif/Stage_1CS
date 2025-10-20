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
from .statistics_schemas import GlobalStatistics,PublicationStats,RankingStats,ResearcherStats,LabStatistics,PublicationDetailsRevue,PublicationDetailsConference,Author,safe_division,safe_value,normalize_distribution
from sqlalchemy import func, join
from Chercheurs.schemas import Chercheur,Labo
publications_router = APIRouter() 
revue_router = APIRouter()
conference_router = APIRouter()
statistics_router = APIRouter()

@revue_router.get("/{revue_id}", response_model=Revue)
def get_revue_by_id(
    revue_id: int = Path(..., description="ID de la revue"),
    session: SessionDep = None,
):
    revue = session.get(Revue, revue_id)
    if not revue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Revue avec ID {revue_id} introuvable"
        )
    return revue




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
    session.commit()
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
    session.commit()
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
    session.commit()
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
    session.commit()
    session.refresh(result)
    return result


@revue_router.delete('/ranking/{revue_id}/{annee}',status_code=status.HTTP_204_NO_CONTENT)
def delete_revue_ranking(session : SessionDep,revue_id : int = Path(...),annee : int = Path(...)):
    result = session.get(RevueRanking,(revue_id,annee))
    if not result:
        raise HTTPException(detail="Revue ranking pour cette année n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    session.delete(result)
    session.commit()


@conference_router.get("/{conference_id}", response_model=Conference)
def get_conference_by_id(
    conference_id: int = Path(..., description="ID de la conférence"),
    session: SessionDep = None,
):
    conference = session.get(Conference, conference_id)
    if not conference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conférence avec ID {conference_id} introuvable"
        )
    return conference

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
    session.commit()
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
    session.commit()
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
    session.commit()
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
    session.commit()
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
    session.commit()
    session.refresh(publication)
    link = LienChercheurRevue(chercheur_id=chercheur_id,chercheur_ordre=publication_revue.chercheur_ordre,publication_id=publication.id)
    session.add(link)
    session.commit()
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
    session.commit()
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


@publications_router.get(
    "/revue/{publication_id}",
    response_model=PublicationDetailsRevue,
    status_code=status.HTTP_200_OK
)
def get_revue_publication_details(publication_id: int, session: SessionDep):
    """
    Fetch publication details for a Revue:
    - Associated revue info
    - Ranking of the revue for the publication's year
    - Authors with their order
    """
    # 1️⃣ Get the publication itself
    publication = session.get(PublicationRevue, publication_id)
    if not publication:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")

    # 2️⃣ Fetch revue info
    revue = session.get(Revue, publication.revue_id)

    # 3️⃣ Fetch ranking (for the same year)
    ranking = session.exec(
        select(RevueRanking)
        .where(
            (RevueRanking.revue_id == publication.revue_id)
            & (RevueRanking.annee == publication.annee_publication)
        )
    ).first()

    # 4️⃣ Fetch authors and their order from LienChercheurRevue
    author_links = session.exec(
        select(
            Chercheur.nom,
            Chercheur.prenom,
            LienChercheurRevue.chercheur_ordre
        ).select_from(join(Chercheur,LienChercheurRevue, LienChercheurRevue.chercheur_id == Chercheur.id))
        .where(LienChercheurRevue.publication_id == publication_id)
    ).all()

    # Convert authors to Author schema
    authors = [
        Author(nom=nom, prenom=prenom, chercheur_ordre=ordre)
        for nom, prenom, ordre in author_links
    ]

    # 5️⃣ Build response
    return PublicationDetailsRevue(
        revue=revue,
        ranking=ranking,
        chercheurs=authors
    )



@publications_router.get(
    "/conference/{publication_id}",
    response_model=PublicationDetailsConference,
    status_code=status.HTTP_200_OK
)
def get_conference_publication_details(publication_id: int, session: SessionDep):

 # 1️⃣ Get the publication itself
    publication = session.get(PublicationConference, publication_id)
    if not publication:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")

    conference = session.get(Conference, publication.conference_id)
    ranking = session.exec(
        select(ConferenceRanking)
        .where(
            (ConferenceRanking.conference_id == publication.conference_id)
            & (ConferenceRanking.annee == publication.annee_publication)
        )
    ).first()

    author_links = session.exec(
        select(
            Chercheur.nom,
            Chercheur.prenom,
            LienChercheurConference.chercheur_ordre
        ).select_from(join(Chercheur,LienChercheurConference, LienChercheurConference.chercheur_id == Chercheur.id))
        .where(LienChercheurConference.publication_id == publication_id)
    ).all()

    authors = [
        Author(nom=nom, prenom=prenom, chercheur_ordre=ordre)
        for nom, prenom, ordre in author_links
    ]

    return PublicationDetailsConference(
        conference=conference,
        ranking=ranking,
        chercheurs=authors
    )





@publications_router.get("/revue",status_code=status.HTTP_200_OK)
def get_revue_publications(
    session: SessionDep,
    titre: str | None = Query(None, description="Recherche par titre partiel"),
    doi: str | None = Query(None, description="Recherche par DOI exact"),
    annee_publication: int | None = Query(None, description="Filtrer par année"),
    is_open_access: bool | None = Query(None, description="Filtrer par accès ouvert"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=10)
):
   
    
    offset = (page - 1) * limit

    # --------------------------
    # Publications de revue
    # --------------------------
    
    query = select(PublicationRevue)
    if titre:
            query = query.where(PublicationRevue.titre.ilike(f"%{titre}%"))
    if doi:
            query = query.where(PublicationRevue.doi == doi)
    if annee_publication:
            query = query.where(PublicationRevue.annee_publication == annee_publication)
    if is_open_access is not None:
            query = query.where(PublicationRevue.is_open_access == is_open_access)


    count = session.exec(select(func.count()).select_from(query.subquery())).one()
    revue_results = session.exec(query.offset(offset).limit(limit)).all()
    return{
        'total':count,
        'page':page,
        'limit':limit,
        'data':revue_results
    } 


@publications_router.get("/conference",status_code=status.HTTP_200_OK)
def get_conference_publications(
    session: SessionDep,
    titre: str | None = Query(None, description="Recherche par titre partiel"),
    doi: str | None = Query(None, description="Recherche par DOI exact"),
    annee_publication: int | None = Query(None, description="Filtrer par année"),
    is_open_access: bool | None = Query(None, description="Filtrer par accès ouvert"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=10)
):
   
    
    offset = (page - 1) * limit

    # --------------------------
    # Publications de revue
    # --------------------------
    
    query = select(PublicationConference)
    
    if titre:
            query = query.where(PublicationConference.titre.ilike(f"%{titre}%"))
    if doi:
            query = query.where(PublicationConference.doi == doi)
    if annee_publication:
            query = query.where(PublicationConference.annee_publication == annee_publication)
    if is_open_access is not None:
            query = query.where(PublicationConference.is_open_access == is_open_access)


    count = session.exec(select(func.count()).select_from(query.subquery())).one()
    conference_results = session.exec(query.offset(offset).limit(limit)).all()
    return {
        'total':count,
        'page':page,
        'limit':limit,
        'data':conference_results}




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
    session.commit()
    session.refresh(publication)
    link = LienChercheurConference(chercheur_id=chercheur_id,chercheur_ordre=publication_conference.chercheur_ordre,publication_id=publication.id)
    session.add(link)
    session.commit()
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
    session.commit()
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
    session.commit()
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
    session.commit()
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
    session.commit()
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
    session.commit()
    session.refresh(result)
    return result

@statistics_router.get(
    "/global",
    response_model=GlobalStatistics,
    status_code=status.HTTP_200_OK
)
def get_global_statistics(session:SessionDep):
    """
    Get global statistics overview:
    - Publications (total, by type, open access, rankings)
    - Researchers (total, with/without lab)
    """

    # -----------------------
    #   Publications Counts
    # -----------------------
    total_revue = safe_value(session.exec(select(func.count()).select_from(PublicationRevue)).one())
    total_conf = safe_value(session.exec(select(func.count()).select_from(PublicationConference)).one())
    total_publications = total_revue + total_conf

    # -----------------------
    #   Open Access Ratio
    # -----------------------
    open_revue = safe_value(session.exec(
        select(func.count()).select_from(PublicationRevue).where(PublicationRevue.is_open_access == True)
    ).one())
    open_conf = safe_value(session.exec(
        select(func.count()).select_from(PublicationConference).where(PublicationConference.is_open_access == True)
    ).one())
    open_access_count = open_revue + open_conf

    unknown_revue = safe_value(session.exec(
        select(func.count()).select_from(PublicationRevue).where(PublicationRevue.is_open_access == None)
    ).one())
    unknown_conf = safe_value(session.exec(
        select(func.count()).select_from(PublicationConference).where(PublicationConference.is_open_access == None)
    ).one())
    unknown_open_access_count = unknown_revue + unknown_conf

    known_open_status = total_publications - unknown_open_access_count
    open_access_ratio = safe_division(open_access_count, known_open_status)


    # -----------------------
    #   Rankings Distributions
    # -----------------------

    # Scimago (for journals)
    scimago_pub_rows = session.exec(
    select(
        RevueRanking.scimago_rank,
        func.count(PublicationRevue.id)
    )
    .join(
        RevueRanking,
        (PublicationRevue.revue_id == RevueRanking.revue_id)
        & (PublicationRevue.annee_publication == RevueRanking.annee),
        isouter=True
    )
    .group_by(RevueRanking.scimago_rank)
    ).all()
    scimago_distribution = normalize_distribution(scimago_pub_rows)

    # DGRSDT (for journals)
    dgrsdt_pub_rows = session.exec(
    select(
        RevueRanking.dgrsdt_rank, 
        func.count(PublicationRevue.id)
    )
    .join(
        RevueRanking,
        (PublicationRevue.revue_id == RevueRanking.revue_id)
        & (PublicationRevue.annee_publication == RevueRanking.annee),
        isouter=True
    )
    .group_by(RevueRanking.dgrsdt_rank)
        ).all()
    dgrsdt_distribution = normalize_distribution(dgrsdt_pub_rows)

    # CORE (for conferences)
    core_pub_rows = session.exec(
    select(
        ConferenceRanking.core_ranking,
        func.count(PublicationConference.id)
    )
    .join(
        ConferenceRanking,
        (PublicationConference.conference_id == ConferenceRanking.conference_id)
        & (PublicationConference.annee_publication == ConferenceRanking.annee),
        isouter=True
    )
    .group_by(ConferenceRanking.core_ranking)
        ).all()
    core_distribution = normalize_distribution(core_pub_rows)


    # -----------------------
    #   Researchers
    # -----------------------
    total_researchers = safe_value(session.exec(select(func.count()).select_from(Chercheur)).one())
    researchers_with_lab = safe_value(session.exec(
        select(func.count()).select_from(Chercheur).where(Chercheur.labo_id != None)
    ).one())
    researchers_without_lab = total_researchers - researchers_with_lab

    # -----------------------
    #   Response
    # -----------------------
    return GlobalStatistics(
        overview=PublicationStats(
            total_publications=total_publications,
            publications_by_type={
                "revue": total_revue,
                "conference": total_conf
            },
            open_access={
                "open_access_count": open_access_count,
                "unknown_open_access_count": unknown_open_access_count,
                "ratio": open_access_ratio
            },
            
            rankings=RankingStats(
                scimago_distribution=scimago_distribution,
                dgrsdt_distribution=dgrsdt_distribution,
                core_distribution=core_distribution
            )
        ),
        researchers=ResearcherStats(
            total=total_researchers,
            with_lab=researchers_with_lab,
            without_lab=researchers_without_lab,
        )
    )










@statistics_router.get(
    "/chercheur/{chercheur_id}",
    response_model=PublicationStats,
    status_code=status.HTTP_200_OK
)
def get_researcher_statistics(chercheur_id: int, session: SessionDep):
    """
    Get statistics for a specific researcher:
    - Publications (total, by type, open access)
    - Indexed and ranked publications
    """
    chercheur = session.get(Chercheur,chercheur_id)
    if not chercheur:
        raise HTTPException(detail="Chercheur n'existe pas.",status_code=status.HTTP_404_NOT_FOUND)
    # -----------------------
    #   Publications Counts
    # -----------------------
    total_revue = safe_value(session.exec(
        select(func.count())
        .select_from(PublicationRevue)
        .join(LienChercheurRevue, LienChercheurRevue.publication_id == PublicationRevue.id)
        .where(LienChercheurRevue.chercheur_id == chercheur_id)
    ).one())

    total_conf = safe_value(session.exec(
        select(func.count())
        .select_from(PublicationConference)
        .join(LienChercheurConference, LienChercheurConference.publication_id == PublicationConference.id)
        .where(LienChercheurConference.chercheur_id == chercheur_id)
    ).one())

    total_publications = total_revue + total_conf


    # -----------------------
    #   Open Access Ratio
    # -----------------------
    open_revue = safe_value(session.exec(
        select(func.count())
        .select_from(PublicationRevue)
        .join(LienChercheurRevue, LienChercheurRevue.publication_id == PublicationRevue.id)
        .where((LienChercheurRevue.chercheur_id == chercheur_id) &
               (PublicationRevue.is_open_access == True))
    ).one())

    open_conf = safe_value(session.exec(
        select(func.count())
        .select_from(PublicationConference)
        .join(LienChercheurConference, LienChercheurConference.publication_id == PublicationConference.id)
        .where((LienChercheurConference.chercheur_id == chercheur_id) &
               (PublicationConference.is_open_access == True))
    ).one())

    open_access_count = open_revue + open_conf

    unknown_revue = safe_value(session.exec(
        select(func.count())
        .select_from(PublicationRevue)
        .join(LienChercheurRevue, LienChercheurRevue.publication_id == PublicationRevue.id)
        .where((LienChercheurRevue.chercheur_id == chercheur_id) &
               (PublicationRevue.is_open_access == None))
    ).one())

    unknown_conf = safe_value(session.exec(
        select(func.count())
        .select_from(PublicationConference)
        .join(LienChercheurConference, LienChercheurConference.publication_id == PublicationConference.id)
        .where((LienChercheurConference.chercheur_id == chercheur_id) &
               (PublicationConference.is_open_access == None))
    ).one())

    unknown_open_access_count = unknown_revue + unknown_conf
    known_open_status = total_publications - unknown_open_access_count
    open_access_ratio = safe_division(open_access_count, known_open_status)


    # -----------------------
    #   Rankings Distributions
    # -----------------------

    # Scimago (for journals)
    scimago_pub_rows = session.exec(
        select(
            RevueRanking.scimago_rank,
            func.count(PublicationRevue.id)
        )
        .join(LienChercheurRevue, LienChercheurRevue.publication_id == PublicationRevue.id)
        .join(
            RevueRanking,
            (PublicationRevue.revue_id == RevueRanking.revue_id)
            & (PublicationRevue.annee_publication == RevueRanking.annee),
            isouter=True
        )
        .where(LienChercheurRevue.chercheur_id == chercheur_id)
        .group_by(RevueRanking.scimago_rank)
    ).all()
    scimago_distribution = normalize_distribution(scimago_pub_rows)


    # DGRSDT (for journals)
    dgrsdt_pub_rows = session.exec(
        select(
            RevueRanking.dgrsdt_rank,
            func.count(PublicationRevue.id)
        )
        .join(LienChercheurRevue, LienChercheurRevue.publication_id == PublicationRevue.id)
        .join(
            RevueRanking,
            (PublicationRevue.revue_id == RevueRanking.revue_id)
            & (PublicationRevue.annee_publication == RevueRanking.annee),
            isouter=True
        )
        .where(LienChercheurRevue.chercheur_id == chercheur_id)
        .group_by(RevueRanking.dgrsdt_rank)
    ).all()
    dgrsdt_distribution = normalize_distribution(dgrsdt_pub_rows)


    # CORE (for conferences)
    core_pub_rows = session.exec(
        select(
            ConferenceRanking.core_ranking,
            func.count(PublicationConference.id)
        )
        .join(LienChercheurConference, LienChercheurConference.publication_id == PublicationConference.id)
        .join(
            ConferenceRanking,
            (PublicationConference.conference_id == ConferenceRanking.conference_id)
            & (PublicationConference.annee_publication == ConferenceRanking.annee),
            isouter=True
        )
        .where(LienChercheurConference.chercheur_id == chercheur_id)
        .group_by(ConferenceRanking.core_ranking)
    ).all()
    core_distribution = normalize_distribution(core_pub_rows)


    # -----------------------
    #   Response
    # -----------------------
    return PublicationStats(
        total_publications=total_publications,
        publications_by_type={
            "revue": total_revue,
            "conference": total_conf
        },
        open_access={
            "open_access_count": open_access_count,
            "unknown_open_access_count": unknown_open_access_count,
            "ratio": open_access_ratio
        },
        rankings=RankingStats(
            scimago_distribution=scimago_distribution,
            dgrsdt_distribution=dgrsdt_distribution,
            core_distribution=core_distribution
        )
    )




@statistics_router.get(
    "/labo/{labo_id}",
    response_model=LabStatistics,  # define this similar to GlobalStatistics
    status_code=status.HTTP_200_OK
)
def get_lab_statistics(labo_id: int, session: SessionDep):
    """
    Get statistics for a specific lab:
    - Total researchers
    - Publications (total, by type, open access)
    - Indexed and ranked publications
    """
    labo = session.get(Labo, labo_id)
    if not labo:
        raise HTTPException(detail="Laboratoire n'existe pas.", status_code=status.HTTP_404_NOT_FOUND)

    # -----------------------
    #   Researchers
    # -----------------------
    total_researchers = safe_value(session.exec(
        select(func.count()).select_from(Chercheur).where(Chercheur.labo_id == labo_id)
    ).one())

    # -----------------------
    #   Publications Counts
    # -----------------------
    total_revue = safe_value(session.exec(
        select(func.count(func.distinct(PublicationRevue.id)))
        .select_from(PublicationRevue)
        .join(LienChercheurRevue, LienChercheurRevue.publication_id == PublicationRevue.id)
        .join(Chercheur, Chercheur.id == LienChercheurRevue.chercheur_id)
        .where(Chercheur.labo_id == labo_id)
    ).one())

    total_conf = safe_value(session.exec(
        select(func.count(func.distinct(PublicationConference.id)))
        .select_from(PublicationConference)
        .join(LienChercheurConference, LienChercheurConference.publication_id == PublicationConference.id)
        .join(Chercheur, Chercheur.id == LienChercheurConference.chercheur_id)
        .where(Chercheur.labo_id == labo_id)
    ).one())

    total_publications = total_revue + total_conf


    # -----------------------
    #   Open Access Ratio
    # -----------------------
    open_revue = safe_value(session.exec(
        select(func.count(func.distinct(PublicationRevue.id)))
        .select_from(PublicationRevue)
        .join(LienChercheurRevue, LienChercheurRevue.publication_id == PublicationRevue.id)
        .join(Chercheur, Chercheur.id == LienChercheurRevue.chercheur_id)
        .where((Chercheur.labo_id == labo_id) & (PublicationRevue.is_open_access == True))
    ).one())

    open_conf = safe_value(session.exec(
        select(func.count(func.distinct(PublicationConference.id)))
        .select_from(PublicationConference)
        .join(LienChercheurConference, LienChercheurConference.publication_id == PublicationConference.id)
        .join(Chercheur, Chercheur.id == LienChercheurConference.chercheur_id)
        .where((Chercheur.labo_id == labo_id) & (PublicationConference.is_open_access == True))
    ).one())

    open_access_count = open_revue + open_conf

    unknown_revue = safe_value(session.exec(
        select(func.count(func.distinct(PublicationRevue.id)))
        .select_from(PublicationRevue)
        .join(LienChercheurRevue, LienChercheurRevue.publication_id == PublicationRevue.id)
        .join(Chercheur, Chercheur.id == LienChercheurRevue.chercheur_id)
        .where((Chercheur.labo_id == labo_id) & (PublicationRevue.is_open_access == None))
    ).one())

    unknown_conf = safe_value(session.exec(
        select(func.count(func.distinct(PublicationConference.id)))
        .select_from(PublicationConference)
        .join(LienChercheurConference, LienChercheurConference.publication_id == PublicationConference.id)
        .join(Chercheur, Chercheur.id == LienChercheurConference.chercheur_id)
        .where((Chercheur.labo_id == labo_id) & (PublicationConference.is_open_access == None))
    ).one())

    unknown_open_access_count = unknown_revue + unknown_conf
    known_open_status = total_publications - unknown_open_access_count
    open_access_ratio = safe_division(open_access_count, known_open_status)


    # -----------------------
    #   Rankings Distributions
    # -----------------------

    # Scimago (for journals)
    scimago_pub_rows = session.exec(
        select(
            RevueRanking.scimago_rank,
            func.count(func.distinct(PublicationRevue.id))
        )
        .join(LienChercheurRevue, LienChercheurRevue.publication_id == PublicationRevue.id)
        .join(Chercheur, Chercheur.id == LienChercheurRevue.chercheur_id)
        .join(
            RevueRanking,
            (PublicationRevue.revue_id == RevueRanking.revue_id)
            & (PublicationRevue.annee_publication == RevueRanking.annee),
            isouter=True
        )
        .where(Chercheur.labo_id == labo_id)
        .group_by(RevueRanking.scimago_rank)
    ).all()
    scimago_distribution = normalize_distribution(scimago_pub_rows)


    # DGRSDT (for journals)
    dgrsdt_pub_rows = session.exec(
        select(
            RevueRanking.dgrsdt_rank,
            func.count(func.distinct(PublicationRevue.id))
        )
        .join(LienChercheurRevue, LienChercheurRevue.publication_id == PublicationRevue.id)
        .join(Chercheur, Chercheur.id == LienChercheurRevue.chercheur_id)
        .join(
            RevueRanking,
            (PublicationRevue.revue_id == RevueRanking.revue_id)
            & (PublicationRevue.annee_publication == RevueRanking.annee),
            isouter=True
        )
        .where(Chercheur.labo_id == labo_id)
        .group_by(RevueRanking.dgrsdt_rank)
    ).all()
    dgrsdt_distribution = normalize_distribution(dgrsdt_pub_rows)


    # CORE (for conferences)
    core_pub_rows = session.exec(
        select(
            ConferenceRanking.core_ranking,
            func.count(func.distinct(PublicationConference.id))
        )
        .join(LienChercheurConference, LienChercheurConference.publication_id == PublicationConference.id)
        .join(Chercheur, Chercheur.id == LienChercheurConference.chercheur_id)
        .join(
            ConferenceRanking,
            (PublicationConference.conference_id == ConferenceRanking.conference_id)
            & (PublicationConference.annee_publication == ConferenceRanking.annee),
            isouter=True
        )
        .where(Chercheur.labo_id == labo_id)
        .group_by(ConferenceRanking.core_ranking)
    ).all()
    core_distribution = normalize_distribution(core_pub_rows)


    # -----------------------
    #   Response
    # -----------------------
    return LabStatistics(
        overview=PublicationStats(
            total_publications=total_publications,
            publications_by_type={
                "revue": total_revue,
                "conference": total_conf
            },
            open_access={
                "open_access_count": open_access_count,
                "unknown_open_access_count": unknown_open_access_count,
                "ratio": open_access_ratio
            },
            rankings=RankingStats(
                scimago_distribution=scimago_distribution,
                dgrsdt_distribution=dgrsdt_distribution,
                core_distribution=core_distribution
            )
        ),
        
        total=total_researchers
        
    )


