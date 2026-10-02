from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_uri: str = ""
    database_name: str = "masal"
    frontend_url: str = "http://localhost:5173"
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-70b-versatile"
    huggingface_api_key: str = ""
    sales_demo_email: str = ""
    sales_demo_password: str = ""
    upload_dir: str = "uploads"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
