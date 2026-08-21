from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage
from app.config import settings
from app.schemas.state import AgentState
from app.tools.search import AGENT_TOOLS

llm = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0
)

llm_with_tools = llm.bind_tools(AGENT_TOOLS)

def execution_node(state: AgentState) -> dict:
    """
    Executes the user task using the provided tools.
    This node generates the next logical step: either a tool request or a final response.
    """
    messages = state.get("messages", [])
    task = state.get("task", "")
    
    if not any(isinstance(msg, SystemMessage) for msg in messages):
        system_prompt = SystemMessage(
            content=(
                f"You are a highly capable AI assistant executing the following task: '{task}'.\n"
                "You have access to a web search tool. Use it if you need factual, up-to-date data.\n"
                "If you have enough information to fulfill the task, provide your final, complete response."
            )
        )
        messages = [system_prompt] + messages

    response = llm_with_tools.invoke(messages)
    
    return {"messages": [response]}