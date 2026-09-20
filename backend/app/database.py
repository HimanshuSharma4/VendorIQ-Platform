import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# .env file se password aur details load karna
load_dotenv()

# Database URL get karna
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Engine create karna (Ye PostgreSQL se main connection banata hai)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal (Ye hamare database ke saath har naye request par baat karega)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class (Isse hum aage chalkar apne tables define karenge)
Base = declarative_base()

# Dependency: Database session get karne ke liye
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()