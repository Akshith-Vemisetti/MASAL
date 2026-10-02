from app.database import db, connect_to_mongo

connect_to_mongo()
from app.database import db

print("Collections in database:", db.list_collection_names())
leads = list(db.leads.find({}))
print(f"Total leads in db.leads: {len(leads)}")
if len(leads) > 0:
    print("Sample lead name:", leads[0].get('name'))
