from fastapi import APIRouter
from services.registry.legal_skills import discover_skills
router = APIRouter()
@router.get("")
def list_skills() -> list[dict[str, str]]:
    return [skill.__dict__ for skill in discover_skills()]
