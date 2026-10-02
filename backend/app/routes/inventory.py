from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import uuid
import os
import base64
from pydantic import BaseModel
import logging

from app.schemas.inventory import InventoryCreate, InventoryResponse, InventoryUpdate, MarketingPostResponse
from app.database import get_db
from app.config import settings

router = APIRouter(prefix="/api/inventory", tags=["inventory"])
logger = logging.getLogger(__name__)

class ImageUploadRequest(BaseModel):
    filename: str
    data: str  # Base64 string

class ImageUploadResponse(BaseModel):
    url: str

@router.post("/upload", response_model=ImageUploadResponse)
def upload_image(request: ImageUploadRequest):
    try:
        # data could be "data:image/jpeg;base64,/9j/4AAQ..."
        header, encoded = request.data.split(",", 1) if "," in request.data else ("", request.data)
        file_extension = request.filename.split('.')[-1]
        new_filename = f"{uuid.uuid4().hex}.{file_extension}"
        filepath = os.path.join(settings.upload_dir, new_filename)
        
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(encoded))
            
        return {"url": f"/uploads/{new_filename}"}
    except Exception as e:
        logger.error("Image upload failed (%s).", type(e).__name__)
        raise HTTPException(status_code=400, detail="Image upload failed. Check the image data and try again.")

@router.post("", response_model=InventoryResponse)
def create_inventory(inventory: InventoryCreate):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    inv_dict = inventory.model_dump()
    inv_dict["id"] = str(uuid.uuid4())
    inv_dict["created_at"] = datetime.utcnow()
    inv_dict["updated_at"] = inv_dict["created_at"]

    db.inventory.insert_one(inv_dict)
    
    return inv_dict

@router.get("/my", response_model=List[InventoryResponse])
def get_my_inventory(salesperson_id: str = Query(...)):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    inventory_cursor = db.inventory.find({"salesperson_id": salesperson_id}).sort("created_at", -1)
    inventory_list = list(inventory_cursor)
    return inventory_list

@router.get("/{inventory_id}", response_model=InventoryResponse)
def get_inventory(inventory_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    inv = db.inventory.find_one({"id": inventory_id})
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory not found")
        
    return inv

@router.put("/{inventory_id}", response_model=InventoryResponse)
def update_inventory(inventory_id: str, inventory: InventoryUpdate, salesperson_id: str = Query(...)):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    inv = db.inventory.find_one({"id": inventory_id})
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory not found")
        
    if inv["salesperson_id"] != salesperson_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this inventory")
        
    update_data = inventory.model_dump()
    update_data["updated_at"] = datetime.utcnow()
    
    db.inventory.update_one(
        {"id": inventory_id},
        {"$set": update_data}
    )
    
    updated_inv = db.inventory.find_one({"id": inventory_id})
    return updated_inv

@router.delete("/{inventory_id}")
def delete_inventory(inventory_id: str, salesperson_id: str = Query(...)):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    inv = db.inventory.find_one({"id": inventory_id})
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory not found")
        
    if inv["salesperson_id"] != salesperson_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this inventory")
        
    db.inventory.delete_one({"id": inventory_id})
    return {"status": "success", "message": "Inventory deleted"}

@router.post("/{inventory_id}/marketing-post", response_model=MarketingPostResponse)
def generate_marketing(inventory_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
    
    inv = db.inventory.find_one({"id": inventory_id})
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory not found")
        
    try:
        from app.services.ai_service import generate_marketing_post
        result = generate_marketing_post(inv)
        return result
    except Exception as e:
        logger.error("Marketing post generation failed (%s).", type(e).__name__)
        raise HTTPException(
            status_code=502,
            detail="Marketing generation failed. Check AI service configuration and try again.",
        )
