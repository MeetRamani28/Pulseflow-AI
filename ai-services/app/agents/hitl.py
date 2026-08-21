from langgraph.types import interrupt
from app.schemas.state import AgentState

def hitl_node(state: AgentState) -> dict:
    """
    Pauses execution to request human approval for sensitive tasks.
    The graph halts here, waiting for a user to send a Command(resume=True/False).
    """
    approved = interrupt("This task requires human approval. Do you wish to proceed?")
    
    if not approved:
        # If the human rejected the action, we bypass execution and end the task.
        return {"final_response": "Task execution was rejected by the user."}
    
    return {}