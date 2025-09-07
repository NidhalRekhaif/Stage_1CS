from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}
@app.get("/employees")
async def get_employees():
    return {"employees": ["Alice", "Bob", "Charlie"]}