from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Location(BaseModel):
    city: str
    locality: str
    address: Optional[str] = None

class InventoryBase(BaseModel):
    title: str
    property_type: str
    listing_type: str
    location: Location
    price: float
    bhk: str
    area: float
    furnishing: str
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    parking: str
    possession_status: str
    amenities: List[str] = []
    key_highlights: Optional[str] = None
    description: Optional[str] = None
    images: List[str] = []

class InventoryCreate(InventoryBase):
    salesperson_id: str

class InventoryUpdate(InventoryBase):
    pass

class AILeadMatchRecommendation(BaseModel):
    lead_id: str
    lead_name: str
    match_score: int
    why_match: str
    matching_factors: List[str]
    concerns: List[str]
    recommended_action: str

class AILeadMatches(BaseModel):
    generated_at: datetime
    recommendations: List[AILeadMatchRecommendation]

class InventoryResponse(InventoryBase):
    id: str
    salesperson_id: str
    created_at: datetime
    updated_at: datetime
    ai_lead_matches: Optional[AILeadMatches] = None

class MarketingPostResponse(BaseModel):
    caption: str
    hashtags: List[str]
    image_base64: str
