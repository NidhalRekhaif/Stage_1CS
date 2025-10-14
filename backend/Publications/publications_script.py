import requests
import xml.etree.ElementTree as ET
from sqlmodel import Session,select
from Chercheurs.schemas import Chercheur
from .revue_schemas import PublicationRevue,Revue,RevueRanking
from .liens_chercheur_pub import LienChercheurRevue,LienChercheurConference
from .conference_schemas import ConferenceRanking,Conference,PublicationConference
from database import engine
import os
import json
import pandas as pd
import re

import urllib.parse

RANKINGS_DIR = "Rankings"
METADATA_FILE = os.path.join(RANKINGS_DIR, "metadata.json")


def get_issn_from_openalex(venue_name: str | None,full_name : str | None) -> tuple[str | None, str | None , bool | None]:
    """
    Try to fetch ISSN and eISSN for a journal or conference from OpenAlex by name.
    Returns (issn, eissn,is_indexed_in_scopus)
    """
    url = "https://api.openalex.org/sources"
    params = {"filter": f"display_name.search:{venue_name}", "per-page": 1}
    is_scopus_indexed = None
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        results = data.get("results", [])
        if not results:
            if full_name:
                return get_issn_from_openalex(venue_name=full_name,full_name=None)
            print(f"[INFO] No ISSN found on OpenAlex for '{venue_name}'")
            return None, None,False

        ids = results[0].get("issn_l") or results[0].get("issn", [])
        issn_list = results[0].get("issn", [])
        is_scopus_indexed = results[0].get("is_indexed_in_scopus") 
        if isinstance(issn_list, list):
            issn, eissn = (issn_list[0], issn_list[1]) if len(issn_list) > 1 else (issn_list[0], None)
        else:
            issn, eissn = (ids, None)

        return issn, eissn , is_scopus_indexed

    except Exception as e:
        print(f"[ERROR] Failed to fetch ISSN from OpenAlex for '{venue_name}': {e}")
        return None, None , is_scopus_indexed


def get_dblp_venue_full_name(venue_name: str) -> str | None:
    """
    Try to get the canonical (full) venue name from DBLP.
    Example: "EAI Endorsed Trans. Ind. Networks Intell. Syst." → "EAI Endorsed Transactions on Industrial Networks and Intelligent Systems"
    """
    url = "https://dblp.org/search/venue/api"
    params = {"q": venue_name, "format": "json"}

    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        hits = data.get("result", {}).get("hits", {})
        total = int(hits.get("@total", 0))
        if total == 0:
            print(f"[INFO] No venue found for '{venue_name}' on DBLP.")
            return None

        info = hits["hit"][0]["info"]
        return info.get("venue")
    except Exception as e:
        print(f"[ERROR] DBLP lookup failed for '{venue_name}': {e}")
        return None

def normalize_name(name: str) -> str:
    if not isinstance(name, str):
        return ""
    # lowercase
    name = name.lower()
    # remove punctuation
    name = re.sub(r"[^\w\s]", "", name)
    # collapse multiple spaces
    name = re.sub(r"\s+", " ", name).strip()
    return name


def load_metadata():
    if not os.path.exists(METADATA_FILE):
        raise FileNotFoundError(f"metadata.json not found in {RANKINGS_DIR}")
    with open(METADATA_FILE, "r",encoding="UTF-8") as f:
        return json.load(f)

import pandas as pd
import os



def get_dgrsdt(issn_request: str | None, journal_name: str | None, year: int) -> str | None:
    files = load_metadata()
    targeted_files = files.get('dgrsdt', {}).get(str(year), {})
    
    if not targeted_files:
        print(f"No files found for year {year}.")
        return None

    for rank, file_path in targeted_files.items():
        if not os.path.exists(file_path):
            print(f"[WARN] Metadata lists {file_path}, but file not found.")
            continue

        df = pd.read_excel(file_path)  # default header from first row
        # PEDIATRICE files use a different column name
        if rank.upper() == "PEDIATRICE":
            if journal_name and journal_name in df["Les Revues"].astype(str).values:
                print(f"Found journal in {file_path}")
                return rank
            continue

        # Regular DGRSDT ranking files
        if issn_request:
            normalized_issn = issn_request.strip().lower().replace("-", "").replace(" ", "")
    
            # Normalize ISSNs in the DataFrame safely
            df["normalized"] = (
            df["ISSN"]
        .astype(str)
        .str.strip()
        .str.lower()
        .str.replace("-", "", regex=False)
        .str.replace(" ", "", regex=False)
        )

            if normalized_issn in df["normalized"].values:
                print(f"Found ISSN match in {file_path}")
                return rank

        if journal_name and journal_name in df["Journal title"].astype(str).values:
            print(f"Found journal title match in {file_path}")
            return rank

    print(f"No match found for {issn_request or journal_name} in year {year}.")
    return None




def get_core_ranking(acronym:str | None,conference_name:str | None,year : int) -> str | None:
    files = load_metadata()
    years = [int(item) for item in list(files.get('core',{}.keys()))]
    years.sort()

    # Get all ranking years that are <= publication year
    valid_years = [y for y in years if y <= int(year)]

    # Choose the closest previous one, or the earliest available
    if valid_years:
        closest_core_year = max(valid_years)
    else:
        closest_core_year = years[0]
    file_path = files['core'][str(closest_core_year)]
    if not os.path.exists(file_path):
        print(f"[WARN] Metadata lists {file_path}, but file not found.")
        return None
    try:
        df = pd.read_csv(file_path,low_memory=False,delimiter=',',dtype=str)
        df['normalized'] = df["Acronym"].apply(lambda x : x.strip().upper())
        result = df[df['normalized'] == acronym.strip().upper()]

        if result.empty:
            print(f"[INFO] Conference '{acronym}' not found in {year}")

        if result.empty and conference_name:
            result = df[df['Title'].str.contains(conference_name, case=False, na=False)]
        if result.empty:
            print(f"[INFO] Conference '{conference_name}' not found in {year}") 
            return None
        row = result.iloc[0]
        ranking_result = row['Rank']

        return ranking_result
    
    except Exception as e:
        pass

def get_scimago_ranking(journal_name: str | None, issn_request: str | None, year: int) -> dict | None:
    """
    Get the Scimago ranking for a given journal and year.
    Uses metadata.json to find the correct file for that year.
    """
    files = load_metadata()
    if str(year) not in files.get("scimago", {}):
        print(f"[INFO] No Scimago ranking file listed for {year}")
        return None

    file_path = files["scimago"][str(year)]
    if not os.path.exists(file_path):
        print(f"[WARN] Metadata lists {file_path}, but file not found.")
        return None

    try:
        df = pd.read_csv(file_path, delimiter=";", low_memory=False)
        df["normalized"] = df["Title"].apply(normalize_name)

        # Try to match journal name first
        result = df[df["normalized"] == normalize_name(journal_name)]
        full_name = journal_name or ""
        index = full_name.find("(")
        if index != -1:
            full_name = full_name[:index].strip()

        print(journal_name)
        is_scopus_index = None
        issn, e_issn, is_scopus_index = get_issn_from_openalex(venue_name=journal_name, full_name=full_name)

        if result.empty:
            result = df[df["normalized"] == normalize_name(full_name)]
        if result.empty and issn:
            result = df[df["Issn"].astype(str).str.contains(issn, na=False)]
        if result.empty and issn_request:
            issn_request = issn_request.replace('-','')
            result = df[df["Issn"].astype(str).str.contains(issn_request, na=False)]

        if result.empty:
            print(f"[INFO] Journal '{journal_name}' not found in {year}")
            return None

        row = result.iloc[0]
        issn_field = str(row.get("Issn", "")).strip()
        split = [s.strip() for s in issn_field.split(",")] if issn_field else []
        issn = split[0] if len(split) > 0 else None
        e_issn = split[1] if len(split) > 1 else None

        return {
            "title": row.get("Title"),
            "issn": issn,
            "e_issn": e_issn,
            "scimago_rank": row.get("SJR Best Quartile"),
            "is_scopus_indexed": is_scopus_index,
        }

    except Exception as e:
        print(f"[ERROR] Failed to read {file_path}: {e}")
        return None




def get_metadata_from_openalex(doi: str | None,title : str | None) -> dict:
    """
    Fetch publication metadata from OpenAlex using a DOI.
    Returns a dictionary with useful fields.
    """
    try:
        data = None
        if doi:
            # Normalize DOI (OpenAlex prefers lowercase, without "https://doi.org/")
            doi = doi.lower().replace("https://doi.org/", "")
            url = f"https://api.openalex.org/works/doi:{doi}"
            
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
        else:
            
            encoded_title = urllib.parse.quote_plus(title)
            search_url = f"https://api.openalex.org/works?search={encoded_title}&per-page=1"
            search_resp = requests.get(search_url,timeout=10)
            search_resp.raise_for_status()
            if search_resp.status_code == 200:
                results = search_resp.json().get("results", None)
                if results:
                    first_result = results[0]
                    work_url = first_result["id"]
                    response = requests.get(work_url.replace("https://openalex.org/", "https://api.openalex.org/"),timeout=10)
                    if response.status_code == 200:
                        data = response.json()
        
        # Extract useful fields
        if not data:
            return {'message':'Nothing'}
        metadata = {
            "abstract": data.get("abstract_inverted_index",None),
            "citations": data.get("cited_by_count",None),
            "open_access": {
                "is_oa": data.get("open_access", {}).get("is_oa",None),
                "oa_status": data.get("open_access", {}).get("oa_status",None),
                "oa_url": data.get("open_access", {}).get("oa_url",None),
            },
            "primary_location": data.get("primary_location",{}),
            "authorships":data.get("authorships",{}),
            "citations":data.get("cited_by_count",None)
        }
        
        # Reconstruct abstract if present in inverted index
        if metadata["abstract"]:
            words = metadata["abstract"]
            # abstract is inverted index, need to rebuild
            abstract_words = [""] * (max(max(positions) for positions in words.values()) + 1)
            for word, positions in words.items():
                for pos in positions:
                    abstract_words[pos] = word
            metadata["abstract"] = " ".join(abstract_words)
        
        return metadata
    
    except requests.exceptions.HTTPError as e:
        print(f"OpenAlex API error: {e}")
        return {}
    except Exception as e:
        print(f"Error fetching metadata: {e} **** {doi} **** {title}")
        return {}



    

# --- DBLP publications fetcher ---
def fetch_dblp_publications(dblp_url: str):
    pid = dblp_url.split("pid/")[-1].replace(".html", "")
    api_url = f"https://dblp.org/pid/{pid}.xml"
    
    r = requests.get(api_url)
    r.raise_for_status()
    root = ET.fromstring(r.content)
    researcher_name = root.find(".//author").text if root.find(".//author") is not None else None
    position = None
    pubs = []
    for r_elem in root.findall(".//r"):
        pub_elem = list(r_elem)[0]
        pub_type = pub_elem.tag

        title = pub_elem.findtext("title")
        year = pub_elem.findtext("year")
         

        doi = None
        url = None
        for ee in pub_elem.findall("ee"):
            link = ee.text
            if link and "doi.org" in link:
                doi = link.split("doi.org/")[-1]
                url = link  # keep DOI link as URL too
            elif link:
                url = link

        # fallback: build DBLP URL from key
        if not url:
            key = pub_elem.attrib.get("key")
            if key:
                url = f"https://dblp.org/rec/{key}.html"
        metadata = get_metadata_from_openalex(doi=doi, title=title)
        #-------------------------------get position of the reseaecher----------------
        authorships = metadata.get("authorships", [])
        if authorships:
            for author in authorships:
                author_name = author.get("author", {}).get("display_name", "")
                if author_name == researcher_name:
                    position = author.get("author_position")
                    break
        # --- Extract journal/source info safely ---
        primary_location = metadata.get('primary_location',{}) or {}
        source = primary_location.get('source', {}) or {}
        revue = source.get('display_name', None)

        # Extract ISSN (OpenAlex may have issn_l or issn[])
        issn_request = None
        if 'issn_l' in source:
            issn_request = source.get('issn_l')
        elif 'issn' in source and isinstance(source['issn'], list) and source['issn']:
            issn_request = source['issn'][0]

        # --- Initialize placeholders ---
        revue_data = None
        oa_url = None
        ranking_data = None

        revue_data = get_scimago_ranking(revue, issn_request, year)
        # --- If article, get ranking info ---
        open_access = metadata.get("open_access", {})
        oa_url = open_access.get("oa_url", None)
        if not oa_url:
            oa_url = url  # fallback
        core_ranking = None
        conference_name = revue or ''
        acronym = ""
        dgrst_rank = None
        if pub_type == 'article':
            dgrst_rank = get_dgrsdt(issn_request=issn_request,journal_name=revue,year=year)
        elif pub_type == 'inproceedings':
            match = re.search(r'\((.*?)\)', conference_name)

            if match:
                acronym = match.group(1)
                conference_name = re.sub(r'\s*\(.*?\)\s*', ' ', conference_name).strip()
            else:
                acronym = "" 
            print(f"acronym: {acronym}, conference name: {conference_name}")
            
            core_ranking = get_core_ranking(acronym=acronym,conference_name=conference_name,year=year)

        # --- Prepare grouped outputs ---

        # 1️⃣ Publication data (matches PublicationRevueBase)
        publication_data = {
            "titre": title,
            "abstract": metadata.get("abstract", ""),
            "doi": doi,
            "annee_publication": year,
            "url": oa_url or url,
            "is_open_access": metadata.get("open_access", {}).get("is_oa", None),
            "citations":metadata.get('citations')
        }
        researcher_position = {
            "position":position
        }

        # 2️⃣ Journal data (matches RevueBase)
        journal_data = {
            "nom": revue,
            "issn": issn_request,
            "e_issn": revue_data.get("e_issn") if revue_data else None,
            "url": primary_location.get('landing_page_url',None)
        }
        conference_data = {
            "nom": revue,
            "url": primary_location.get('landing_page_url',None)
        }

        # 3️⃣ Ranking data (Scimago + DGRSDT placeholder)
        ranking_data = {
            "annee": year,
            "scimago_rank": revue_data.get("scimago_rank") if revue_data else None,
            "dgrsdt_rank": dgrst_rank,  # placeholder, to be filled later
            "is_scopus_indexed": revue_data.get("is_scopus_indexed") if revue_data else source.get('is_indexed_in_scopus')
        }
        conference_ranking = {
            "annee": year,
            "scimago_rank": revue_data.get("scimago_rank") if revue_data else None,
            "is_scopus_indexed": revue_data.get("is_scopus_indexed") if revue_data else source.get('is_indexed_in_scopus'),
            "core_ranking":core_ranking or None
        }
        
        pubs.append({
            "type": pub_type,
            "publication_data": publication_data,
            "researcher_position":researcher_position,
            "journal_data": journal_data if pub_type == 'article' else conference_data,
            "ranking_data": ranking_data if pub_type == 'article' else conference_ranking
        })

    return pubs

def process_researcher_publications(session: Session, researcher: Chercheur):
    dblp = researcher.dblp_url
    publications = fetch_dblp_publications(dblp_url=dblp)

    for publication in publications:
        pub_type = publication.get("type")
        pub_data = publication.get("publication_data", {})
        researcher_position = publication.get("researcher_position", {})
        journal_data = publication.get("journal_data", {})
        ranking_data = publication.get("ranking_data", {})

        if pub_type == "article":
            doi = pub_data.get("doi")
            titre = (pub_data.get("titre") or "").strip().lower()
            revue = None

            if doi:
                existing_pub = session.exec(
                    select(PublicationRevue).where(PublicationRevue.doi == doi)
                ).first()
            else:
                existing_pub = session.exec(
                    select(PublicationRevue)
                    .where(
                        (PublicationRevue.titre == titre)
                        & (PublicationRevue.annee_publication == int(pub_data.get("annee_publication", 0)))
                    )
                ).first()

            if not existing_pub:
                issn = journal_data.get("issn")
                if issn:
                    revue = session.exec(select(Revue).where(Revue.issn == issn)).first()
                else:
                    nom = journal_data.get("nom", "")
                    revue = session.exec(select(Revue).where(Revue.nom == nom)).first()

                if not revue:
                    revue = Revue(**journal_data)
                    session.add(revue)
                    session.flush()  # no commit, just get the ID
                    session.refresh(revue)

                existing_pub = PublicationRevue(**pub_data)
                session.add(existing_pub)
                session.flush()
                session.refresh(existing_pub)

            annee = ranking_data.get("annee")
            if annee:
                annee = int(annee)
                revue_ranking = session.exec(
                    select(RevueRanking)
                    .where(
                        (RevueRanking.annee == annee)
                        & (RevueRanking.revue_id == revue.id)
                    )
                ).first()

                if not revue_ranking:
                    revue_ranking = RevueRanking(**ranking_data, revue_id=revue.id)
                    session.add(revue_ranking)

            lien_chercheur_publication = session.exec(
                select(LienChercheurRevue)
                .where(
                    (LienChercheurRevue.chercheur_id == researcher.id)
                    & (LienChercheurRevue.publication_revue_id == existing_pub.id)
                )
            ).first()

            if not lien_chercheur_publication:
                lien_chercheur_publication = LienChercheurRevue(
                    **researcher_position,
                    chercheur_id=researcher.id,
                    publication_revue_id=existing_pub.id
                )
                session.add(lien_chercheur_publication)

            session.commit()
        else:
            doi = pub_data.get("doi")
            titre = (pub_data.get("titre") or "").strip().lower()
            conference = None

            # --- Check existing publication (by DOI or title/year) ---
            if doi:
                existing_pub = session.exec(
                    select(PublicationConference).where(PublicationConference.doi == doi)
                ).first()
            else:
                existing_pub = session.exec(
                    select(PublicationConference)
                    .where(
                        (PublicationConference.titre == titre)
                        & (PublicationConference.annee_publication == int(pub_data.get("annee_publication", 0)))
                    )
                ).first()

            # --- If publication doesn't exist, create it and link to conference ---
            if not existing_pub:
                    nom = journal_data.get("nom", "") or ''
                    conference = session.exec(
                        select(Conference).where(Conference.nom == nom.upper())
                    ).first()

                    if not conference:
                        conference = Conference(**journal_data)
                        session.add(conference)
                        session.flush()
                        session.refresh(conference)

                    existing_pub = PublicationConference(**pub_data)
                    session.add(existing_pub)
                    session.flush()
                    session.refresh(existing_pub)

            # --- Handle ranking ---
            annee = ranking_data.get("annee")
            if annee:
                annee = int(annee)
                conference_ranking = session.exec(
                    select(ConferenceRanking)
                    .where(
                        (ConferenceRanking.annee == annee)
                        & (ConferenceRanking.conference_id == conference.id)
                    )
                ).first()

                if not conference_ranking:
                    conference_ranking = ConferenceRanking(**ranking_data, conference_id=conference.id)
                    session.add(conference_ranking)

            # --- Link researcher to this publication ---
            lien_chercheur_publication = session.exec(
                select(LienChercheurConference)
                .where(
                    (LienChercheurConference.chercheur_id == researcher.id)
                    & (LienChercheurConference.publication_id == existing_pub.id)
                )
            ).first()

            if not lien_chercheur_publication:
                lien_chercheur_publication = LienChercheurConference(
                    **researcher_position,
                    chercheur_id=researcher.id,
                    publication_id=existing_pub.id
                )
                session.add(lien_chercheur_publication)

            session.commit()








def process_all_researchers():
    """Fetch and process DBLP publications for all researchers with a valid DBLP URL."""
    with Session(engine) as session:
        chercheurs = session.exec(
            select(Chercheur).where(Chercheur.dblp_url.is_not(None))
        ).all()

        print(f"🔍 Found {len(chercheurs)} researchers with DBLP URLs.")

        for researcher in chercheurs:
            try:
                print(f" Processing researcher: {researcher.nom} ({researcher.dblp_url})")
                process_researcher_publications(session, researcher)
                print(f" Done with {researcher.nom}")
            except Exception as e:
                session.rollback()
                print(f" Error processing {researcher.nom}: {e}")


            
                    



# --- Example usage ---
if __name__ == "__main__":
   process_all_researchers()

  