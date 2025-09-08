from fastapi import APIRouter
publications_router = APIRouter()  
@publications_router.get("/")
async def get_publications():
    return {"publications": ["Publication 1", "Publication 2", "Publication 3"]}