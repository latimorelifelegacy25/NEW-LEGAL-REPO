from fastapi import APIRouter
router = APIRouter()
@router.post("/search")
def search_knowledge() -> dict: return {"results": []}
