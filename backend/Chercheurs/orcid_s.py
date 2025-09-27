import time
import requests
from sqlmodel import Session, select
from database import engine  # assuming you have an engine defined here
from .schemas import Chercheur  # your Researcher model


def get_dblp_url_from_name(name: str, max_retries: int = 3):
    """
    Searches DBLP for the given researcher name and returns
    the URL of the first matching profile (if found).
    Retries on 429 (Too Many Requests).
    """
    base_url = "https://dblp.org/search/author/api"
    params = {"q": name, "format": "json"}
    headers = {"User-Agent": "Mozilla/5.0 (compatible; dblp-fetcher/1.0)"}

    for attempt in range(max_retries):
        try:
            response = requests.get(base_url, params=params, headers=headers, timeout=10)

            if response.status_code == 429:
                wait_time = int(response.headers.get("Retry-After", 2))
                print(f"Rate limited. Waiting {wait_time} seconds before retry...")
                time.sleep(wait_time)
                continue

            response.raise_for_status()
            data = response.json()

            hits = data.get("result", {}).get("hits", {}).get("hit", [])
            if not hits:
                return None

            first_hit = hits[0]["info"]
            return first_hit.get("url")

        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            if attempt < max_retries - 1:
                print("Retrying...")
                time.sleep(2)
            else:
                return None


def update_dblp_urls():
    """
    Fetches all researchers from the DB that don't have a dblp_url yet,
    queries DBLP, and updates their dblp_url field.
    """
    with Session(engine) as session:
        # Get researchers without dblp_url
        statement = select(Chercheur).where(Chercheur.dblp_url == None)
        chercheurs = session.exec(statement).all()

        for chercheur in chercheurs:
            print(f"Fetching DBLP URL for {chercheur.full_name}...")
            dblp_url = get_dblp_url_from_name(chercheur.full_name)
            if dblp_url:
                chercheur.dblp_url = dblp_url
                print(f"✅ Found: {dblp_url}")
            else:
                print(f"⚠️ No DBLP profile found for {chercheur.full_name}")

            session.add(chercheur)
            session.commit()
            time.sleep(1)  # Be nice to DBLP servers


if __name__ == "__main__":
    update_dblp_urls()
