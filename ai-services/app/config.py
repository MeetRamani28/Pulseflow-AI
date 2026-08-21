import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Centralized configuration for the AI Service."""
    
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))

settings = Config()