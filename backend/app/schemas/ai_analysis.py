from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ScoreBreakdown(BaseModel):
    timeline: int
    intent: int
    requirement_clarity: int
    budget_clarity: int
    financing_readiness: int
    purpose_clarity: int
    engagement: int

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
    score_breakdown: Optional[ScoreBreakdown] = None
    generated_at: Optional[datetime] = None
