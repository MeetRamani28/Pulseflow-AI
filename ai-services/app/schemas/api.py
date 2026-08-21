from pydantic import BaseModel, Field
from typing import Optional

class TaskRequest(BaseModel):
    """Guardrail for incoming task execution requests."""
    thread_id: str = Field(..., description="Unique identifier for the task/thread memory.")
    task: str = Field(..., description="The user's prompt or task description.")

class ResumeRequest(BaseModel):
    """Guardrail for handling Human-in-the-Loop approvals."""
    thread_id: str = Field(..., description="Unique identifier for the paused task/thread.")
    approved: bool = Field(..., description="Whether the human approved the action.")