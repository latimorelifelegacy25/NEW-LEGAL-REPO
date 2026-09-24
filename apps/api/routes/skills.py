from fastapi import APIRouter, HTTPException
from services.registry import get_skill, list_skills, skill_bundle, verify_catalog
router = APIRouter()

@router.get("")
def skills() -> list[dict]:
    return list_skills()

@router.get("/verify")
def verify() -> dict:
    return verify_catalog()

@router.get("/{canonical_id}")
def skill(canonical_id: str) -> dict:
    record = get_skill(canonical_id)
    if not record:
        raise HTTPException(404, "skill not found")
    return record

@router.get("/{canonical_id}/bundle")
def bundle(canonical_id: str) -> dict:
    result = skill_bundle(canonical_id)
    if not result:
        raise HTTPException(404, "skill not found")
    return result
