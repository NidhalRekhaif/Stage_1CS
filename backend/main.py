from fastapi import FastAPI
from Publications.routers import publications_router
from Chercheurs.routers import chercheurs_router
from contextlib import asynccontextmanager
from database import init_db

@asynccontextmanager
async def lifespan(app:FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(publications_router, prefix="/publications")
app.include_router(chercheurs_router, prefix="/chercheurs")



