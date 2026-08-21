from langchain_core.tools import tool
from tavily import TavilyClient
from app.config import settings

tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)

@tool
def web_search(query: str) -> str:
    """
    Search the web for up-to-date information, facts, and research.
    Always use this tool if you are unsure about recent events or need factual grounding.
    """
    try:
        response = tavily_client.search(query=query, max_results=3)
        results = response.get("results", [])
        if not results:
            return "No relevant results found."
        
        snippets = [f"- {res['title']}: {res['content']}" for res in results]
        return "\n".join(snippets)
    except Exception as e:
        return f"Error executing web search: {str(e)}"