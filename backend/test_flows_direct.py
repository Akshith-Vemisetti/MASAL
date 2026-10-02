import json
import os
import asyncio
import sys
from app.routes.chat import ChatRequest, ChatMessage, chat_endpoint
from app.database import connect_to_mongo

# Load .env before initializing config
from dotenv import load_dotenv
load_dotenv()

def run_test():
    connect_to_mongo()

    print("\n--- Test 1: Top 2 leads ---")
    req1 = ChatRequest(messages=[ChatMessage(role="user", content="Show me the top 2 leads.")], mode="global")
    res1 = chat_endpoint(req1)
    reply1 = res1.get("reply", "")
    sys.stdout.buffer.write((reply1[:200] + "...\n").encode('utf-8'))

    print("\n--- Test 2: Compare Rahul and Priya ---")
    req2 = ChatRequest(
        messages=[
            ChatMessage(role="user", content="Show me the top 2 leads."),
            ChatMessage(role="assistant", content=reply1),
            ChatMessage(role="user", content="Compare Rahul and Priya.")
        ],
        mode="global"
    )
    res2 = chat_endpoint(req2)
    reply2 = res2.get("reply", "")
    sys.stdout.buffer.write((reply2[:200] + "...\n").encode('utf-8'))

    print("\n--- Test 11: Out of scope ---")
    req3 = ChatRequest(messages=[ChatMessage(role="user", content="What is Python?")], mode="global")
    res3 = chat_endpoint(req3)
    reply3 = res3.get("reply", "")
    sys.stdout.buffer.write((reply3[:200] + "\n").encode('utf-8'))

    print("\n--- Test Lead Context ---")
    req4 = ChatRequest(messages=[ChatMessage(role="user", content="hi")], mode="lead", lead_id="1234")
    # Need an actual lead ID to test lead mode fully, but we can just let it fail gracefully or mock it
    try:
        res4 = chat_endpoint(req4)
        sys.stdout.buffer.write((res4.get("reply", "")[:200] + "\n").encode('utf-8'))
    except Exception as e:
        print("Lead test failed (likely invalid ID):", str(e))

if __name__ == "__main__":
    run_test()
