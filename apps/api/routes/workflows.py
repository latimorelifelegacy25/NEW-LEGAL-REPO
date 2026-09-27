from fastapi import APIRouter
from services.registry.legal_skills import discover_skills
from services.workflow.litigation import litigation_stages
router = APIRouter()
@router.get("")
def list_workflows() -> list[dict]:
    available = {skill.name for skill in discover_skills()}
    return [{"id": "litigation", "stages": litigation_stages(available)}]
@router.post("/{workflow_id}/runs")
def start_workflow(workflow_id: str) -> dict:
    return {"workflow_id": workflow_id, "status": "queued"}
