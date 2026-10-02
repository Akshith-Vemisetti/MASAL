from app.database import db, connect_to_mongo
import json

connect_to_mongo()
from app.database import db

lead = db.leads.find_one({}, {"_id": 0})
print(json.dumps(lead, indent=2, default=str))
