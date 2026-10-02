from app.database import db, connect_to_mongo
import json

connect_to_mongo()
from app.database import db

# 1. Compare Rahul and Gur
f1 = {"name": {"$regex": "Rahul|Gur", "$options": "i"}}
res1 = list(db.leads.find(f1, {"_id": 0}))
print("Test 1 res:", len(res1))

# 2. All leads
f2 = {}
res2 = list(db.leads.find(f2, {"_id": 0}))
print("Test 2 res:", len(res2))

# 3. Top 2 priority leads
f3 = {}
res3 = list(db.leads.find(f3, {"_id": 0}).sort("ai_analysis.priority_score", -1).limit(2))
print("Test 3 res:", len(res3))

