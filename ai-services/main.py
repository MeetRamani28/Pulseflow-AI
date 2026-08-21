from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
import uvicorn
from langchain_core.messages import HumanMessage
from langgraph.types import Command

from app.config import settings
from app.memory.db import setup_memory_tables, pool
from app.memory.vector_store import setup_vector_db
from app.agents.workflow import get_workflow_with_memory
from app.schemas.api import TaskRequest, ResumeRequest

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        setup_memory_tables()
        setup_vector_db()
        print("Successfully initialized Postgres memory and pgvector tables.")
    except Exception as e:
        print(f"Warning: Could not connect to Postgres. Error: {e}")
    yield

app = FastAPI(
    title="Pulseflow AI Agent Service",
    description="Multi-agent background service powered by LangGraph, Groq, and FastAPI",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "pulseflow-ai"}

@app.post("/task")
def execute_task(request: TaskRequest):
    """Entry point for the Node.js backend to start a new LangGraph task."""
    try:
        with pool.connection() as conn:
            workflow = get_workflow_with_memory(conn)
            config = {"configurable": {"thread_id": request.thread_id}}
            
            initial_state = {
                "task": request.task,
                "messages": [HumanMessage(content=request.task)]
            }
            
            for event in workflow.stream(initial_state, config, stream_mode="values"):
                pass 
            
            state = workflow.get_state(config)
            
            if state.next:
                return {"status": "paused_for_hitl", "message": "Task requires human approval."}
            
            return {"status": "completed", "final_response": state.values.get("final_response") or state.values["messages"][-1].content}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/task/resume")
def resume_task(request: ResumeRequest):
    """Entry point for the Node.js backend to resume a paused HITL task."""
    try:
        with pool.connection() as conn:
            workflow = get_workflow_with_memory(conn)
            config = {"configurable": {"thread_id": request.thread_id}}
            
            for event in workflow.stream(Command(resume=request.approved), config, stream_mode="values"):
                pass
                
            state = workflow.get_state(config)
            return {"status": "completed", "final_response": state.values.get("final_response") or state.values["messages"][-1].content}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)