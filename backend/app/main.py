import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, leads, chat, inventory
import os

os.makedirs(settings.upload_dir, exist_ok=True)

app = FastAPI(title="MASAL API")
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
logger = logging.getLogger(__name__)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    logger.info("Request validation failed for %s (%d errors).", request.url.path, len(exc.errors()))
    errors = [
        {"loc": error["loc"], "msg": error["msg"], "type": error["type"]}
        for error in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": errors})

allowed_origins = {
    origin.strip().rstrip("/")
    for origin in settings.frontend_url.split(",")
    if origin.strip()
}
allowed_origins.update({"http://127.0.0.1:5173", "http://localhost:5173"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(allowed_origins),
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

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8005, reload=True)
