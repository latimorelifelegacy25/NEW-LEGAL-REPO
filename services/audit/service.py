from __future__ import annotations
from datetime import datetime, timezone
import uuid

def create_event(event_type: str, details: dict, *, actor_type: str = "system", resource_type: str | None = None, resource_id: str | None = None) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "actor_type": actor_type,
        "event_type": event_type,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": details,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
