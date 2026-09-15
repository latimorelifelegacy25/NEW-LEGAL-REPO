from fastapi import APIRouter
router = APIRouter()
@router.get("")
def list_approvals() -> list[dict]: return []
@router.post("/{approval_id}/approve")
def approve(approval_id: str) -> dict: return {"approval_id": approval_id, "status": "approved"}
@router.post("/{approval_id}/reject")
def reject(approval_id: str) -> dict: return {"approval_id": approval_id, "status": "rejected"}
