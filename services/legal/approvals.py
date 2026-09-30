from __future__ import annotations

_APPROVALS: dict[str, dict] = {}

def propose(record: dict) -> dict:
    saved={**record, "status":"pending"}
    _APPROVALS[str(record["edit_id"])]=saved
    return dict(saved)

def decide(edit_id: str, approved: bool) -> dict | None:
    record=_APPROVALS.get(edit_id)
    if record is None:
        return None
    record["status"]="approved" if approved else "rejected"
    return dict(record)

def get(edit_id: str) -> dict | None:
    record=_APPROVALS.get(edit_id)
    return dict(record) if record else None

def approved_for_document(document_id: str, edit_ids: list[str]) -> list[dict]:
    out=[]
    for edit_id in edit_ids:
        record=_APPROVALS.get(edit_id)
        if record and record.get("status")=="approved" and record.get("document_id")==document_id:
            out.append(dict(record))
    return out
