from fastapi import APIRouter
router = APIRouter()
@router.get("")
def list_imports() -> list[dict]: return []
@router.post("")
def create_import() -> dict: return {"status": "accepted"}
