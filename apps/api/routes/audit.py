from fastapi import APIRouter
from services.storage import get_store
router = APIRouter()

@router.get("")
def list_audit() -> list[dict]:
    return get_store().list("audit")
