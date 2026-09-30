from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ResearchResult(BaseModel):
    title: str
    citation: str
    source_path: str
    excerpt: str

@router.get("/pa")
def pa_research(q: str = "") -> dict:
    return {
        "query": q,
        "results": [],
        "source_policy": "Results must come from installed Pennsylvania reference materials with provenance. No authority is fabricated when the private/reference index is not loaded.",
    }
