from fastapi import FastAPI
from contextlib import asynccontextmanager
import uvicorn
from app.config import settings
from app.memory.db import setup_memory_tables
from app.memory.vector_store import setup_vector_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle hook that runs before the server starts accepting requests."""
    try:
        setup_memory_tables()
        setup_vector_db()
        print("Successfully initialized Postgres memory and pgvector tables.")
    except Exception as e:
        print(f"Warning: Could not connect to Postgres (it may not be running yet). Error: {e}")
    yield

app = FastAPI(
    title="Pulseflow AI Agent Service",
    description="Multi-agent background service powered by LangGraph, Groq, and FastAPI",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "pulseflow-ai-service",
        "keys_loaded": {
            "groq": bool(settings.GROQ_API_KEY),
            "tavily": bool(settings.TAVILY_API_KEY)
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)