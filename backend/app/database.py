from pymongo import MongoClient
import os
from app.config import settings

client = None
db = None

def connect_to_mongo():
    global client, db
    if settings.mongodb_uri:
        import certifi
        client = MongoClient(settings.mongodb_uri, tlsCAFile=certifi.where())
        db = client[settings.database_name]
        print("Connected to MongoDB!")
    else:
        import mongomock
        client = mongomock.MongoClient()
        db = client[settings.database_name]
        print("Warning: MONGODB_URI not set. Running with mongomock (in-memory database).")

def get_db():
    return db

def close_mongo_connection():
    global client
    if client:
        client.close()
