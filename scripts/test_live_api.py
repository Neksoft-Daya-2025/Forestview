import json
import urllib.request

BASE = "https://forestviewmontessori.org/api"
tests = [
    ("contact", {"name": "Live Test", "email": "test@example.com", "message": "API check"}),
    (
        "tour",
        {
            "parentName": "Jane",
            "childName": "Sam",
            "childAge": "3",
            "tourDate": "2026-06-06",
            "phone": "7635551234",
            "email": "jane@example.com",
        },
    ),
]
for path, body in tests:
    req = urllib.request.Request(
        f"{BASE}/{path}",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        print(path, r.status, r.read().decode())
