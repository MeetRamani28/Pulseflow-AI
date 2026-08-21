from langchain_core.tools import tool
from app.memory.vector_store import vector_store

@tool
def query_knowledge_base(query: str) -> str:
    """
    Search the internal knowledge base for past information, documents, or context.
    Use this tool when you need to recall specific internal data that wouldn't be on the public web.
    """
    try:
        docs = vector_store.similarity_search(query, k=3)
        
        if not docs:
            return "No relevant internal documents found."
        
        snippets = [f"- {doc.page_content}" for doc in docs]
        return "\n".join(snippets)
    except Exception as e:
        return f"Error querying knowledge base: {str(e)}"