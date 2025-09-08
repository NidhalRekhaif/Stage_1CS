from fastapi import APIRouter
chercheurs_router = APIRouter()

@chercheurs_router.get("/")
async def get_chercheurs():
    return {"chercheurs": ["Dr. Smith", "Dr. Johnson", "Dr. Lee"]}