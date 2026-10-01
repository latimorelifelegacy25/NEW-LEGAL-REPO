from fastapi.testclient import TestClient

from apps.api.main import app


def test_hosted_legal_routes_disabled_without_owner_token(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.delenv("LEGAL_OS_OWNER_TOKEN", raising=False)
    client = TestClient(app)
    response = client.post("/api/v1/legal/private-sources/register", json={"content_text": "private"})
    assert response.status_code == 503
    assert client.get("/health").status_code == 200


def test_hosted_legal_routes_require_valid_bearer_token(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    token = "a-secret-owner-token-with-at-least-32-characters"
    monkeypatch.setenv("LEGAL_OS_OWNER_TOKEN", token)
    client = TestClient(app)
    path = "/api/v1/legal/workspace/S-1214-2026"
    assert client.get(path).status_code == 401
    assert client.get(path, headers={"Authorization": "Bearer wrong"}).status_code == 401
    assert client.get(path, headers={"Authorization": f"Bearer {token}"}).status_code == 200
