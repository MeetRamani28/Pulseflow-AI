from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row
from app.config import settings
from langgraph.checkpoint.postgres import PostgresSaver

pool = ConnectionPool(
    conninfo=settings.DATABASE_URL,
    max_size=10,
    kwargs={
        "autocommit": True, 
        "row_factory": dict_row
    }
)

def setup_memory_tables():
    """
    Ensures the LangGraph checkpoint tables exist in Postgres.
    This will be called when the FastAPI server starts up.
    """
    with pool.connection() as conn:
        saver = PostgresSaver(conn)
        saver.setup()