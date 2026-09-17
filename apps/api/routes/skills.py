from fastapi import APIRouter
router = APIRouter()
@router.get("")
def list_skills() -> list[dict]: return []
