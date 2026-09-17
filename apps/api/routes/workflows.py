from fastapi import APIRouter
router = APIRouter()
@router.get("")
def list_workflows() -> list[dict]: return []
@router.post("/{workflow_id}/runs")
def start_workflow(workflow_id: str) -> dict:
    return {"workflow_id": workflow_id, "status": "queued"}
