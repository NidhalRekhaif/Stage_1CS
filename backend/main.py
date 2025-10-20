from fastapi import FastAPI
from Publications.routers import publications_router,revue_router,conference_router,statistics_router
from Chercheurs.routers import chercheurs_router
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db

@asynccontextmanager
async def lifespan(app:FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


# ✅ Allowed origins (frontends)
origins = [
    "http://localhost:3000",   # React/Next.js dev
    "http://127.0.0.1:3000",
    "https://your-production-domain.com", 
     "http://192.168.43.47"
      # Production frontend
]

# ✅ Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # list of allowed origins
    allow_credentials=True,         # allow cookies/authorization headers
    allow_methods=["*"],            # allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],            # allow all custom headers
)


app.include_router(publications_router, prefix="/publications")
app.include_router(chercheurs_router, prefix="/chercheurs")
app.include_router(revue_router,prefix='/revue')
app.include_router(conference_router,prefix='/conference')
app.include_router(statistics_router,prefix='/statistics')

