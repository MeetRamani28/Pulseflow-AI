from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.postgres import PostgresSaver

from app.schemas.state import AgentState
from app.agents.triage import triage_node
from app.agents.executor import execution_node
from app.agents.hitl import hitl_node
from app.tools.search import AGENT_TOOLS

def route_after_triage(state: AgentState) -> str:
    """Routes to HITL if approval is required, otherwise straight to execution."""
    if state.get("requires_approval"):
        return "hitl"
    return "executor"

def route_after_hitl(state: AgentState) -> str:
    """Routes to END if the user rejected the task, otherwise proceeds to executor."""
    if state.get("final_response"): 
        return END
    return "executor"

def route_after_executor(state: AgentState) -> str:
    """Checks if the LLM decided to call a tool or if it finished the task."""
    messages = state.get("messages", [])
    last_message = messages[-1]
    
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    
    return END

builder = StateGraph(AgentState)

builder.add_node("triage", triage_node)
builder.add_node("hitl", hitl_node)
builder.add_node("executor", execution_node)
builder.add_node("tools", ToolNode(AGENT_TOOLS))

builder.add_edge(START, "triage")
builder.add_conditional_edges("triage", route_after_triage, {"hitl": "hitl", "executor": "executor"})
builder.add_conditional_edges("hitl", route_after_hitl, {"executor": "executor", END: END})
builder.add_conditional_edges("executor", route_after_executor, {"tools": "tools", END: END})
builder.add_edge("tools", "executor")

def get_workflow_with_memory(conn):
    """
    Compiles the graph using a live Postgres connection for memory.
    This replaces the InMemorySaver so states persist across server restarts.
    """
    saver = PostgresSaver(conn)
    return builder.compile(checkpointer=saver)