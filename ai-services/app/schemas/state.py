from typing import TypedDict, Annotated, Optional
from operator import add
from langchain_core.messages import AnyMessage

class AgentState(TypedDict):
    """
    The central state object that is passed between all nodes in the LangGraph.
    Each node receives this state, performs work, and returns updates to it.
    """
    messages: Annotated[list[AnyMessage], add]
    
    task: str
    
    task_category: Optional[str]
    requires_approval: Optional[bool]
    
    final_response: Optional[str]