import json
import httpx
import asyncio

async def test_flows():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000", timeout=30.0) as client:
        # GLOBAL CHAT TESTS

        # Test 1: Top 2 leads
        print("\n--- Test 1: Top 2 leads ---")
        msgs = [{"role": "user", "content": "Show me the top 2 leads."}]
        res = await client.post("/api/chat", json={"messages": msgs, "mode": "global"})
        print(res.json().get("reply", "")[:200] + "...\n")

        # Test 2: Compare Rahul and Priya
        print("--- Test 2: Compare Rahul and Priya ---")
        msgs.append({"role": "assistant", "content": res.json().get("reply")})
        msgs.append({"role": "user", "content": "Compare Rahul and Priya."})
        res = await client.post("/api/chat", json={"messages": msgs, "mode": "global"})
        print(res.json().get("reply", "")[:200] + "...\n")

        # Test 11: Out of scope
        print("--- Test 11: What is Python? ---")
        res = await client.post("/api/chat", json={"messages": [{"role": "user", "content": "What is Python?"}], "mode": "global"})
        print(res.json().get("reply", "")[:200] + "\n")

        # LEAD CHAT TESTS

        # We need a valid lead_id. Let's just ask global for a lead ID or assume we have one.
        # But wait, without actual db we can't get lead_id. Let's fetch one from DB.

if __name__ == "__main__":
    asyncio.run(test_flows())
