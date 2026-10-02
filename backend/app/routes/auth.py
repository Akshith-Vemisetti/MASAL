import base64
import hashlib
import hmac
import secrets
from fastapi import APIRouter, HTTPException
from app.config import settings
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.database import get_db
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])
PASSWORD_HASH_ITERATIONS = 310_000


def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PASSWORD_HASH_ITERATIONS)
    salt_text = base64.urlsafe_b64encode(salt).decode()
    digest_text = base64.urlsafe_b64encode(digest).decode()
    return f"pbkdf2_sha256${PASSWORD_HASH_ITERATIONS}${salt_text}${digest_text}"


def _verify_password(password: str, stored_value: str) -> tuple[bool, bool]:
    if stored_value.startswith("pbkdf2_sha256$"):
        try:
            algorithm, iterations, salt_text, digest_text = stored_value.split("$", 3)
            if algorithm != "pbkdf2_sha256":
                return False, False
            salt = base64.urlsafe_b64decode(salt_text.encode())
            expected = base64.urlsafe_b64decode(digest_text.encode())
            actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(iterations))
            return hmac.compare_digest(actual, expected), False
        except (ValueError, TypeError):
            return False, False

    return hmac.compare_digest(stored_value.encode(), password.encode()), True

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
        "password_hash": _hash_password(user.password),
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

    if (
        settings.sales_demo_email
        and settings.sales_demo_password
        and hmac.compare_digest(user.email.casefold().encode(), settings.sales_demo_email.casefold().encode())
        and hmac.compare_digest(user.password.encode(), settings.sales_demo_password.encode())
    ):
        return UserResponse(
            id="sales-1",
            name="Sarah Jenkins",
            email=settings.sales_demo_email,
            role="salesperson"
        )

    db_user = db.users.find_one({"email": user.email})
    stored_password = db_user.get("password_hash") if db_user else None
    if not stored_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    password_valid, needs_rehash = _verify_password(user.password, stored_password)
    if not password_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if needs_rehash:
        db.users.update_one(
            {"id": db_user["id"]},
            {"$set": {"password_hash": _hash_password(user.password)}},
        )

    return UserResponse(
        id=db_user["id"],
        name=db_user["name"],
        email=db_user["email"],
        role=db_user.get("role", "customer")
    )
