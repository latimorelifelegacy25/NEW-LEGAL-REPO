from pydantic import BaseModel, Field
from fastapi import APIRouter
from services.knowledge import build_index, search
router = APIRouter()

class SearchRequest(BaseModel):
    query: str = Field(min_length=1)
    top_k: int = Field(default=10, ge=1, le=50)

@router.post("/search")
def search_knowledge(req: SearchRequest) -> dict:
    return search(req.query, req.top_k)

@router.post("/rebuild")
def rebuild() -> dict:
    return build_index()
