from fastapi import FastAPI
import uvicorn
from app.config import settings

app = FastAPI(
    title="Pulseflow AI Agent Service",
    description="Multi-agent background service powered by LangGraph, Groq, and FastAPI",
    version="1.0.0"
)

@app.get("/health")
async def health_check():
    """
    Diagnostic endpoint. The Node.js backend will ping this to 
    ensure the AI service is responsive before routing tasks.
    """
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