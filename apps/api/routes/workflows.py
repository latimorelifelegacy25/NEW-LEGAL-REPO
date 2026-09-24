from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.workflow import list_runs, list_workflows, prepare_run
router = APIRouter()

class RunRequest(BaseModel):
    variables: dict[str, Any] = {}

@router.get("")
def workflows() -> list[dict]:
    return list_workflows()

@router.get("/runs")
def runs() -> list[dict]:
    return list_runs()

@router.post("/{workflow_id}/runs")
def start_workflow(workflow_id: str, req: RunRequest | None = None) -> dict:
    try:
        return prepare_run(workflow_id, (req.variables if req else {}))
    except KeyError as exc:
        raise HTTPException(404, "workflow not found") from exc
