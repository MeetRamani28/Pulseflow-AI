import sqlalchemy
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_postgres.vectorstores import PGVector
from app.config import settings

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

engine = sqlalchemy.create_engine(settings.DATABASE_URL)

vector_store = PGVector(
    embeddings=embeddings,
    collection_name="pulseflow_knowledge_base",
    connection=engine,
    use_jsonb=True,
)

def setup_vector_db():
    """
    Ensures the pgvector extension and necessary tables exist in the database.
    This runs during the FastAPI server startup.
    """
    with engine.connect() as conn:
        conn.execute(sqlalchemy.text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    vector_store.create_tables_if_not_exists()