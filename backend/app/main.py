from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, leads, chat, inventory
import os

os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="MASAL API")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    close_mongo_connection()

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(chat.router)
app.include_router(inventory.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to MASAL API"}
