import urllib.request
import json
import time

url = "http://127.0.0.1:8005/api/chat"
queries = [
    "give me the leads",
    "give me all the leads",
    "who should I call first?",
    "how many high priority leads?",
    "show me all Hyderabad leads"
]

for i, q in enumerate(queries):
    data = json.dumps({
        "messages": [
            {"role": "user", "content": q}
        ],
        "mode": "global"
    }).encode('utf-8')

    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            with open(f"response_200_{i+3}.json", "wb") as f:
                f.write(response.read())
            print(f"Success for query: {q}")
    except urllib.error.HTTPError as e:
        with open(f"response_error_{i+3}.json", "wb") as f:
            f.write(e.read())
        print(f"Error for query: {q}")
    time.sleep(1)
