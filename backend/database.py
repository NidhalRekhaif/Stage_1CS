from sqlmodel import create_engine,SQLModel,Session,text
from fastapi import Depends
from typing import Annotated
DATABASE_URL = 'sqlite:///example.db'
engine = create_engine(DATABASE_URL,echo=True,connect_args={'check_same_thread':False})
def init_db():
    SQLModel.metadata.create_all(engine)
    with engine.connect() as connection:
        connection.execute(text("PRAGMA foreign_keys=ON"))

async def get_session():
    with Session(engine) as session:
        yield session
SessionDep = Annotated[Session, Depends(get_session)]