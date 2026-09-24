from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from services.audit.service import create_event
from services.matters.service import get_matter
from services.registry.catalog import get_skill
from services.storage import get_store


def root() -> Path:
    return Path(__file__).resolve().parents[2] / "workflows"


def list_workflows() -> list[dict[str, Any]]:
    result = []
    if not root().exists():
        return result
    for path in sorted(root().glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        result.append({**data, "path": str(path.name)})
    return result


def get_workflow(canonical_id: str) -> dict[str, Any] | None:
    path = root() / f"{canonical_id}.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else None


def prepare_run(workflow_id: str, variables: dict[str, Any] | None = None) -> dict[str, Any]:
    definition = get_workflow(workflow_id)
    if not definition:
        raise KeyError(workflow_id)
    variables = variables or {}
    run_id = str(uuid.uuid4())
    steps = []
    blocked = False
    missing: list[str] = []
    for step in definition.get("steps", []):
        prepared = dict(step)
        if step.get("type") == "matter_guard":
            for required in step.get("requires", []):
                if not variables.get(required):
                    missing.append(required)
            matter_id = variables.get("matter_id")
            if matter_id and not get_matter(str(matter_id)):
                missing.append(f"known_matter:{matter_id}")
            prepared["status"] = "blocked" if missing else "succeeded"
            blocked = blocked or bool(missing)
        elif step.get("type") == "skill":
            skill = get_skill(step["skill"])
            prepared["status"] = "blocked" if not skill else "prepared"
            prepared["skill_available"] = bool(skill)
            if not skill:
                blocked = True
        else:
            prepared["status"] = "prepared"
        steps.append(prepared)
    status = "waiting_for_input" if missing else ("quarantined" if blocked else "prepared")
    record = {
        "id": run_id,
        "workflow_id": workflow_id,
        "name": definition.get("name"),
        "status": status,
        "legal_task_status": "not_executed",
        "variables": variables,
        "missing": sorted(set(missing)),
        "steps": steps,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "note": "Legal OS prepared the deterministic execution package. Skill/model execution is a separate action and must remain source-grounded; external actions require explicit user authorization.",
    }
    get_store().append("workflow_runs", record)
    get_store().append("audit", create_event("workflow.prepared", {"run_id": run_id, "workflow_id": workflow_id, "status": status}))
    return record


def list_runs() -> list[dict[str, Any]]:
    return get_store().list("workflow_runs")
