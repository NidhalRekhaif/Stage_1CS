import numpy as np
import pandas as pd
from sqlmodel import create_engine,text,Session
from database import DATABASE_URL,engine
from .schemas import Chercheur
from .orcid_s import get_dblp_url_from_name
SOURCE_URL = "Lists-chercheurs/avecindexes.csv"
def main(csv_path,session:Session,labo_id : int | None = None):
    df = pd.read_csv(csv_path)
    
    
    successful = 0
    failed = []
    
    with Session(engine) as session:
        for index, row in df.iterrows():
            try:
                chercheur = Chercheur(
                    nom=row['nom'],
                    prenom=row['prenom'], 
                    email=row['email'],
                    grade=row['grade'],
                    google_scholar_url=row['google_scholar_url'],
                    h_index = row['h_index'],
                    i_10_index=row['i_10_index'],
                    labo_id=labo_id
                )
                chercheur.dblp_url = get_dblp_url_from_name(chercheur.full_name)
                session.add(chercheur)
                successful += 1
                
            except Exception as e:
                failed.append(f"Row {index + 1}: {e}")
        
        session.commit()
    
    print(f"Imported: {successful}, Failed: {len(failed)}")
    for error in failed:
        print(error)


if __name__ == '__main__':
    with Session(engine) as session:
        main(SOURCE_URL,session,1)




