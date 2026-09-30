from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.legal import approvals

router = APIRouter()

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
    return approvals.propose(edit.model_dump())

@router.post("/proposed-edits/{edit_id}/decision")
def decide_edit(edit_id:str, decision: ApprovalDecision) -> dict:
    record=approvals.decide(edit_id, decision.approved)
    if not record:
        raise HTTPException(status_code=404, detail="Proposed edit not found")
    return record

@router.get("/proposed-edits/{edit_id}")
def get_edit(edit_id:str) -> dict:
    record=approvals.get(edit_id)
    if not record:
        raise HTTPException(status_code=404, detail="Proposed edit not found")
    return record
