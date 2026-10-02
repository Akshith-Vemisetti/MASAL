from pymongo import MongoClient
from pymongo.errors import PyMongoError
import logging
from app.config import settings

logger = logging.getLogger(__name__)

client = None
db = None

def connect_to_mongo():
    global client, db
    if settings.mongodb_uri:
        try:
            import certifi
            client = MongoClient(
                settings.mongodb_uri,
                tlsCAFile=certifi.where(),
                connectTimeoutMS=5000,
                serverSelectionTimeoutMS=5000,
            )
            client.admin.command("ping")
            db = client[settings.database_name]
            logger.info("Connected to MongoDB.")
        except PyMongoError as error:
            logger.error("MongoDB connection failed (%s).", type(error).__name__)
            if client:
                client.close()
            client = None
            db = None
    else:
        import mongomock
        client = mongomock.MongoClient()
        db = client[settings.database_name]
        logger.warning("MONGODB_URI is not set; using an in-memory database.")

def get_db():
    return db

def close_mongo_connection():
    global client
    if client:
        client.close()
