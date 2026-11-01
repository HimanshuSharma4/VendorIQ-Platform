from app.database import engine, Base
from app import models

print("Creating database tables on Neon...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully! 🚀")