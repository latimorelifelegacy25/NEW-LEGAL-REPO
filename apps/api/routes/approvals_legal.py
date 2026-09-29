from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()
_APPROVALS: dict[str, dict] = {}

class ProposedEdit(BaseModel):
    edit_id: str
    docket: str
    document_id: str
    location: str
    before: str
    after: str
    reason: str
    sources: list[str] = Field(default_factory=list)

class ApprovalDecision(BaseModel):
    approved: bool

@router.post("/proposed-edits")
def propose_edit(edit: ProposedEdit) -> dict:
    record={**edit.model_dump(), "status":"pending"}
    _APPROVALS[edit.edit_id]=record
    return record

@router.post("/proposed-edits/{edit_id}/decision")
def decide_edit(edit_id:str, decision: ApprovalDecision) -> dict:
    record=_APPROVALS.get(edit_id)
    if not record:
        raise HTTPException(status_code=404, detail="Proposed edit not found")
    record["status"]="approved" if decision.approved else "rejected"
    return record

@router.get("/proposed-edits/{edit_id}")
def get_edit(edit_id:str) -> dict:
    record=_APPROVALS.get(edit_id)
    if not record:
        raise HTTPException(status_code=404, detail="Proposed edit not found")
    return record
