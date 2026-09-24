from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def root() -> Path:
    return Path(__file__).resolve().parents[2] / "legal_matters"


def _safe_id(matter_id: str) -> str:
    if not re.fullmatch(r"[A-Za-z0-9._-]+", matter_id):
        raise ValueError("matter_id may contain only letters, numbers, dot, underscore, and hyphen")
    return matter_id


def list_matters() -> list[dict[str, Any]]:
    items = []
    if not root().exists():
        return items
    for path in sorted(root().glob("*/matter.json")):
        try:
            items.append(json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError:
            items.append({"matter_id": path.parent.name, "status": "invalid_json", "path": str(path)})
    return items


def get_matter(matter_id: str) -> dict[str, Any] | None:
    path = root() / _safe_id(matter_id) / "matter.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else None


def upsert_matter(matter_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    matter_id = _safe_id(matter_id)
    folder = root() / matter_id
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / "matter.json"
    existing = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    merged = {**existing, **payload, "matter_id": matter_id, "updated_at": datetime.now(timezone.utc).date().isoformat()}
    merged.setdefault("classification", "confidential")
    merged.setdefault("status", "active")
    merged.setdefault("sources", [])
    path.write_text(json.dumps(merged, indent=2), encoding="utf-8")
    return merged
