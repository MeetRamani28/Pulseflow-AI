from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings
from app.schemas.state import AgentState
from app.schemas.models import TriageResult

llm = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model_name="llama-3.1-8b-instant",
    temperature=0
)

structured_llm = llm.with_structured_output(TriageResult)

def triage_node(state: AgentState) -> dict:
    """
    Analyzes the incoming task, classifies it, and determines if HITL approval is needed.
    Returns a dictionary that updates the AgentState.
    """
    task = state.get("task", "")
    
    system_prompt = (
        "You are an expert AI task triage agent. Your job is to analyze the user's task and classify it. "
        "You must determine if the task requires human approval before execution. "
        "Tasks requiring approval include: sending emails, writing to databases, or making purchases. "
        "Tasks like web research, summarizing documents, or answering general questions do NOT require approval."
    )
    
    result: TriageResult = structured_llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Task to triage: {task}")
    ])
    
    return {
        "task_category": result.task_category,
        "requires_approval": result.requires_approval
    }