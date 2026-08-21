from pydantic import BaseModel, Field

class TriageResult(BaseModel):
    """Structured output schema for the Triage Node."""
    
    task_category: str = Field(
        description="The category of the task. Must be one of: 'research', 'communication', 'general'."
    )
    requires_approval: bool = Field(
        description="True if the task involves sensitive actions (e.g., sending emails, modifying data, spending money). False otherwise."
    )
    reasoning: str = Field(
        description="A brief, 1-sentence explanation of why this category and approval status were chosen."
    )