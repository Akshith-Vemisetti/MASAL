import json
import os
from dotenv import load_dotenv

load_dotenv()

from app.services.ai_service import determine_query_plan

msgs = [
    {"role": "user", "content": "How many high priority leads?"}
]
plan = determine_query_plan(msgs)
print(plan.model_dump_json(indent=2))

msgs2 = [
    {"role": "user", "content": "Top 2 priority leads"}
]
plan2 = determine_query_plan(msgs2)
print(plan2.model_dump_json(indent=2))

msgs3 = [
    {"role": "user", "content": "Top 2 priority leads"},
    {"role": "assistant", "content": "1. Rahul Sharma... 2. Priya Reddy..."},
    {"role": "user", "content": "Compare them."}
]
plan3 = determine_query_plan(msgs3)
print(plan3.model_dump_json(indent=2))
