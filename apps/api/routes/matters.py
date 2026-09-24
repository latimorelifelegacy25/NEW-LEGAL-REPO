from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.matters import get_matter, list_matters, upsert_matter
router = APIRouter()

class MatterUpdate(BaseModel):
    data: dict[str, Any]

@router.get("")
def matters() -> list[dict]:
    return list_matters()

@router.get("/{matter_id}")
def matter(matter_id: str) -> dict:
    value = get_matter(matter_id)
    if not value:
        raise HTTPException(404, "matter not found")
    return value

@router.put("/{matter_id}")
def update_matter(matter_id: str, req: MatterUpdate) -> dict:
    try:
        return upsert_matter(matter_id, req.data)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
