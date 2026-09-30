import base64
import binascii
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.legal.docx_io import apply_approved_edits, read_docx_paragraphs
from services.legal import approvals

router = APIRouter()

class DocxInspectRequest(BaseModel):
    filename: str
    content_base64: str

class ExportRequest(BaseModel):
    filename: str
    document_id: str
    original_base64: str
    approval_ids: list[str] = Field(default_factory=list)

def decode_payload(value: str) -> bytes:
    try:
        return base64.b64decode(value, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Invalid encoded document payload") from exc

@router.post("/inspect")
def inspect_docx(payload: DocxInspectRequest) -> dict:
    try:
        data=decode_payload(payload.content_base64)
        paragraphs=read_docx_paragraphs(data)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unable to read DOCX: {exc}")
    return {"filename":payload.filename,"paragraph_count":len(paragraphs),"paragraphs":paragraphs,"preserves_original":True}

@router.post("/export-approved")
def export_approved(payload: ExportRequest) -> dict:
    original=decode_payload(payload.original_base64)
    approved=approvals.approved_for_document(payload.document_id,payload.approval_ids)
    if len(approved) != len(set(payload.approval_ids)):
        raise HTTPException(status_code=409,detail="Requested edits must exist, match this document, and be approved.")
    try:
        exported=apply_approved_edits(original_data=original,approved_edits=approved)
    except Exception as exc:
        raise HTTPException(status_code=409,detail=f"Approved edit conflict: {exc}")
    stem=payload.filename[:-5] if payload.filename.lower().endswith(".docx") else payload.filename
    return {"filename":f"{stem}_REVIEWED.docx","content_base64":base64.b64encode(exported).decode("ascii"),"applied_edit_count":len(approved),"approval_ids":payload.approval_ids,"original_preserved":True}
