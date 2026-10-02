from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import uuid
from app.schemas.lead import LeadCreate, LeadResponse
from app.database import get_db
import logging

router = APIRouter(prefix="/api/leads", tags=["leads"])
logger = logging.getLogger(__name__)

@router.post("", response_model=LeadResponse)
def create_lead(lead: LeadCreate):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    lead_dict = lead.model_dump()
    lead_dict["id"] = str(uuid.uuid4())
    lead_dict["created_at"] = datetime.utcnow()
    lead_dict["status"] = "NEW"
    lead_dict["ai_analysis"] = None

    db.leads.insert_one(lead_dict)
    
    return lead_dict

@router.get("/my", response_model=List[LeadResponse])
def get_my_leads(customer_id: str = Query(...)):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    leads_cursor = db.leads.find({"customer_id": customer_id}).sort("created_at", -1)
    leads = list(leads_cursor)
    return leads

@router.get("", response_model=List[LeadResponse])
def get_all_leads():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    leads_cursor = db.leads.find().sort("created_at", -1)
    leads = list(leads_cursor)
    return leads

@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    lead = db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    return lead

from app.services.ai_service import analyze_lead_with_ai

@router.post("/{lead_id}/analyze", response_model=LeadResponse)
def analyze_lead(lead_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    lead = db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    try:
        analysis = analyze_lead_with_ai(lead)
    except ValueError as e:
        logger.error("Lead analysis failed (%s).", type(e).__name__)
        raise HTTPException(
            status_code=502,
            detail="Lead analysis failed. Check AI service configuration and try again.",
        )
        
    db.leads.update_one(
        {"id": lead_id},
        {"$set": {"ai_analysis": analysis.model_dump()}}
    )
    
    updated_lead = db.leads.find_one({"id": lead_id})
    return updated_lead

@router.post("/analyze-all", response_model=List[LeadResponse])
def analyze_all_leads():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
        
    leads = list(db.leads.find({"ai_analysis": None}))
    analyzed_leads = []
    
    for lead in leads:
        try:
            analysis = analyze_lead_with_ai(lead)
            db.leads.update_one(
                {"id": lead["id"]},
                {"$set": {"ai_analysis": analysis.model_dump()}}
            )
            analyzed_leads.append(db.leads.find_one({"id": lead["id"]}))
        except Exception as e:
            logger.error("Lead analysis failed for lead %s (%s).", lead["id"], type(e).__name__)
            
    return analyzed_leads
