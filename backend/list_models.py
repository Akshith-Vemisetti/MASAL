from groq import Groq
from app.config import settings
import json

client = Groq(api_key=settings.groq_api_key)
models = client.models.list()
for m in models.data:
    print(m.id)
