import sys
import os
import asyncio
from app.routes.chat import ChatRequest, ChatMessage, chat_endpoint
from app.database import connect_to_mongo, get_db

from dotenv import load_dotenv
load_dotenv()

def run_test():
    connect_to_mongo()
    db = get_db()
    lead = db.leads.find_one({})
    if not lead:
        print("No leads found in DB.")
        return

    lead_id = lead["id"]
    lead_name = lead.get("name", "Unknown")
    print(f"\n--- Testing Lead Chat for {lead_name} ({lead_id}) ---")

    tests = [
        ("hi", "Test 12: hi (Must NOT assume search)"),
        ("What is his budget?", "Test 13: Budget"),
        ("Why is he high priority?", "Test 14: Priority"),
        ("What are his concerns?", "Test 15: Concerns"),
        ("What should I do next?", "Test 16: Next action"),
        ("Draft a follow-up message.", "Test 17: Follow-up message"),
        ("What about Srishanth?", "Test 18: Other lead (Srishanth)"),
        ("What is Priya's budget?", "Test 19: Other lead (Priya)"),
        ("Compare with Arjun.", "Test 20: Other lead (Arjun)")
    ]

    msgs = []
    for msg, desc in tests:
        print(f"\n{desc} -> User: '{msg}'")
        msgs.append(ChatMessage(role="user", content=msg))
        req = ChatRequest(messages=msgs, mode="lead", lead_id=lead_id)
        res = chat_endpoint(req)
        reply = res.get("reply", "")
        msgs.append(ChatMessage(role="assistant", content=reply))
        sys.stdout.buffer.write((reply[:250] + "...\n").encode('utf-8'))

if __name__ == "__main__":
    run_test()
