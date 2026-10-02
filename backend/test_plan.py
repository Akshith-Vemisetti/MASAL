from app.services.ai_service import determine_query_plan
import json

queries = [
    "compare Rahul and Gur",
    "give me top 2 priority leads",
    "how many high priority leads?",
    "show me all Hyderabad leads"
]

for q in queries:
    plan = determine_query_plan([{"role": "user", "content": q}])
    print(f"Query: {q}")
    print(plan.model_dump_json(indent=2))
