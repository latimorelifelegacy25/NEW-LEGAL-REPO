from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.storage import get_store
from services.audit.service import create_event
router = APIRouter()

class ApprovalRequest(BaseModel):
    workflow_run_id: str | None = None
    requested_by: str = "system"
    required_role: str = "owner"
    note: str | None = None

@router.get("")
def list_approvals() -> list[dict]:
    return get_store().list("approvals")

@router.post("")
def create_approval(req: ApprovalRequest) -> dict:
    record = {"id": str(uuid.uuid4()), **req.model_dump(), "status":"pending", "requested_at":datetime.now(timezone.utc).isoformat()}
    get_store().append("approvals", record)
    get_store().append("audit", create_event("approval.requested", {"approval_id":record["id"]}))
    return record


def _resolve(approval_id: str, status: str) -> dict:
    item = get_store().update("approvals", approval_id, {"status":status, "resolved_at":datetime.now(timezone.utc).isoformat()})
    if not item:
        raise HTTPException(404, "approval not found")
    get_store().append("audit", create_event(f"approval.{status}", {"approval_id":approval_id}))
    return item

@router.post("/{approval_id}/approve")
def approve(approval_id: str) -> dict:
    return _resolve(approval_id, "approved")

@router.post("/{approval_id}/reject")
def reject(approval_id: str) -> dict:
    return _resolve(approval_id, "rejected")
