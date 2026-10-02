from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.ai_analysis import LeadAnalysis

class LeadCreate(BaseModel):
    name: str
    location: str
    property_requirement: str
    property_type: Optional[str] = None
    bhk_or_size: Optional[str] = None
    budget: str
    buying_timeline: str
    purpose: Optional[str] = None
    financing: Optional[str] = None
    customer_message: str
    customer_id: str

class LeadResponse(BaseModel):
    id: str
    customer_id: str
    name: str
    location: str
    property_requirement: str
    property_type: Optional[str] = None
    bhk_or_size: Optional[str] = None
    budget: str
    buying_timeline: str
    purpose: Optional[str] = None
    financing: Optional[str] = None
    customer_message: str
    created_at: datetime
    ai_analysis: Optional[LeadAnalysis] = None
    status: str
