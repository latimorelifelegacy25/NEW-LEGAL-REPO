from datetime import datetime, timezone
def create_event(event_type: str, details: dict) -> dict:
    return {"event_type": event_type, "details": details, "created_at": datetime.now(timezone.utc).isoformat()}
