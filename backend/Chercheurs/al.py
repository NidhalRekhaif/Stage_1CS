from sqlmodel import inspect
from database import engine
insp = inspect(engine)
print(insp.get_foreign_keys("chercheur"))