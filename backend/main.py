from fastapi import FastAPI
from Publications.routers import publications_router
from Chercheurs.routers import chercheurs_router
app = FastAPI()

app.include_router(publications_router, prefix="/publications")
app.include_router(chercheurs_router, prefix="/chercheurs")