from fastapi import APIRouter, HTTPException, status
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.database import get_db
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")

    existing_user = db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = {
        "id": str(uuid.uuid4()),
        "name": user.name,
        "email": user.email,
        "password_hash": user.password, # Plaintext for task 3 demo, in prod use bcrypt
        "role": "customer"
    }

    db.users.insert_one(user_dict)
    
    return UserResponse(
        id=user_dict["id"],
        name=user_dict["name"],
        email=user_dict["email"],
        role=user_dict["role"]
    )

@router.post("/login", response_model=UserResponse)
def login(user: UserLogin):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")

    # Hardcoded Salesperson login bypass
    if user.email == "sales@masal.com" and user.password == "masal2024":
        return UserResponse(
            id="sales-1",
            name="Sarah Jenkins",
            email="sales@masal.com",
            role="salesperson"
        )

    db_user = db.users.find_one({"email": user.email})
    if not db_user or db_user.get("password_hash") != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return UserResponse(
        id=db_user["id"],
        name=db_user["name"],
        email=db_user["email"],
        role=db_user.get("role", "customer")
    )
