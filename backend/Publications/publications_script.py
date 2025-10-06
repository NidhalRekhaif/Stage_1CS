import requests
import xml.etree.ElementTree as ET



import requests



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
            "source": data.get("primary_location",{}).get("source",{}),
            "authorships":data.get("authorships",{})
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
        source = metadata.get('source', {}) or {}
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

        # --- If article, get ranking info ---
        if pub_type == 'article':
            revue_data = get_scimago_ranking(revue, issn_request, year)
            open_access = metadata.get("open_access", {})
            oa_url = open_access.get("oa_url", None)
            if not oa_url:
                oa_url = url  # fallback

        # --- Prepare grouped outputs ---

        # 1️⃣ Publication data (matches PublicationRevueBase)
        publication_data = {
            "titre": title,
            "abstract": metadata.get("abstract", ""),
            "doi": doi,
            "annee_publication": year,
            "url": oa_url or url,
            "is_open_access": metadata.get("open_access", {}).get("is_oa", False),
            "position":position
        }

        # 2️⃣ Journal data (matches RevueBase)
        journal_data = {
            "nom": revue,
            "issn": issn_request,
            "e_issn": revue_data.get("e_issn") if revue_data else None,
        }

        # 3️⃣ Ranking data (Scimago + DGRSDT placeholder)
        ranking_data = {
            "annee": year,
            "scimago_rank": revue_data.get("scimago_rank") if revue_data else None,
            "dgrsdt_rank": None,  # placeholder, to be filled later
            "is_scopus_indexed": revue_data.get("is_scopus_indexed") if revue_data else False,
        }

        pubs.append({
            "type": pub_type,
            "publication_data": publication_data,
            "journal_data": journal_data,
            "ranking_data": ranking_data
        })

    return pubs


# --- Example usage ---
if __name__ == "__main__":
    dblp_url = "https://dblp.org/pid/96/1461"  # Replace with real DBLP researcher URL
    pubs = fetch_dblp_publications(dblp_url)

    for pub in pubs:  # print first 5 for demo
        print(pub)
