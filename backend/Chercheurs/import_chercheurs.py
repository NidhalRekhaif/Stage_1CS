import numpy as np
import pandas as pd
from sqlmodel import create_engine,text,Session
from database import DATABASE_URL
from .schemas import Chercheur
SOURCE_URL = "Lists-chercheurs/Chercheurs-LCSI - Sheet1.csv"
def main(csv_path):
    engine = create_engine(DATABASE_URL,echo=True,connect_args={'check_same_thread':False})
    with engine.connect() as connection:
        connection.execute(text("PRAGMA foreign_keys=ON"))
    df = pd.read_csv(csv_path, header=None)
    df.columns = ['nom', 'prenom', 'email', 'grade']
    
    successful = 0
    failed = []
    
    with Session(engine) as session:
        for index, row in df.iterrows():
            try:
                chercheur = Chercheur(
                    nom=row['nom'],
                    prenom=row['prenom'], 
                    email=row['email'],
                    grade=row['grade']
                )
                
                session.add(chercheur)
                successful += 1
                
            except Exception as e:
                failed.append(f"Row {index + 1}: {e}")
        
        session.commit()
    
    print(f"Imported: {successful}, Failed: {len(failed)}")
    for error in failed:
        print(error)


if __name__ == '__main__':
    main(SOURCE_URL)




