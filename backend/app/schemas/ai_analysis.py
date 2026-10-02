from pydantic import BaseModel
from typing import List, Optional

class LeadAnalysis(BaseModel):
    summary: str
    intent: str
    key_requirements: List[str]
    concerns: List[str]
    recommended_next_action: str
    suggested_response: str
    priority: Optional[str] = "Medium"
    priority_score: Optional[int] = 50
    priority_reason: Optional[str] = "Not evaluated"
