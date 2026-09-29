from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)

def test_s1214_workspace():
    r = client.get("/api/v1/legal/workspace/S-1214-2026")
    assert r.status_code == 200
    body = r.json()
    assert body["docket"] == "S-1214-2026"
    assert "verification" in body["modules"]

def test_detects_duplicate_and_missing_paragraphs():
    r = client.post("/api/v1/legal/verification/sac", json={
        "docket": "S-1214-2026",
        "paragraphs": [
            {"number": 1, "text": "One. (Exhibit P-1)"},
            {"number": 1, "text": "Duplicate. (Exhibit P-1)"},
            {"number": 3, "text": "Three. (Exhibit P-2)"}
        ]
    })
    assert r.status_code == 200
    codes = {i["code"] for i in r.json()["issues"]}
    assert "DUPLICATE_PARAGRAPH" in codes
    assert "MISSING_PARAGRAPH" in codes

def test_pleading_fact_structure():
    r = client.post("/api/v1/legal/drafting/pleading-facts", json={
        "start_number": 10,
        "date": "August 25, 2025",
        "time": "4:08 p.m.",
        "sender": "Plaintiff",
        "sender_email": "latimorejackson@gmail.com",
        "recipient": "Carol Boyer",
        "recipient_email": "cboyer@assumptionbvmschool.net",
        "subject": "Attention to sensitive matter",
        "exhibit": "Exhibit P-16",
        "statements": [
            {
                "speaker": "Plaintiff",
                "quote": "After 15 minutes of catching up, my children informed me that Mr Butterfly was spanking them with a paddle.",
                "exhibit": "Exhibit P-16"
            }
        ]
    })
    assert r.status_code == 200
    paragraphs = r.json()["paragraphs"]
    assert paragraphs[0].startswith("10.")
    assert paragraphs[1].startswith("11.")
