from app.database import connect_to_mongo, get_db
from app.services.ai_service import determine_query_plan, chat_with_assistant
import json

connect_to_mongo()
db = get_db()

messages_dict = [{"role": "user", "content": "give me the leads"}]
plan = determine_query_plan(messages_dict)
print("Plan:", plan)

projection = {"_id": 0}
fetch_all = False
if plan.fields_to_include and "all" in [f.lower() for f in plan.fields_to_include]:
    fetch_all = True
if not fetch_all:
    for f in (plan.fields_to_include or []):
        projection[f] = 1
    projection["name"] = 1

cursor = db.leads.find(plan.mongo_filter, projection)
if plan.sort_field:
    order = -1 if plan.sort_order == -1 else 1
    cursor = cursor.sort(plan.sort_field, order)
if plan.limit and plan.limit > 0:
    cursor = cursor.limit(plan.limit)

leads = list(cursor)
print(f"Retrieved {len(leads)} leads")

context_text = f"The database returned {len(leads)} leads matching the criteria:\n{json.dumps(leads, default=str)}"

system_prompt_override = f"""You are MASAL AI... DATA CONTEXT: {context_text} ..."""

try:
    print("Sending to chat_with_assistant...")
    reply = chat_with_assistant(messages_dict, context_text, system_prompt_override)
    print("Reply:", reply)
except Exception as e:
    print("Exception during chat_with_assistant:", str(e))

