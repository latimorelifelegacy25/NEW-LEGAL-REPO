from fastapi import APIRouter
from pydantic import BaseModel, Field
from services.legal.count_mapping import derive_count_map

router = APIRouter()

class CountHeading(BaseModel):
    text: str
    start_paragraph: int | None = None

class CountMappingRequest(BaseModel):
    headings: list[CountHeading] = Field(default_factory=list)
    paragraph_numbers: list[int] = Field(default_factory=list)
    mapping: dict[str,list[int]] = Field(default_factory=dict)

@router.post("/map")
def map_counts(payload: CountMappingRequest) -> dict:
    counts=derive_count_map(
        [h.model_dump() for h in payload.headings],
        payload.paragraph_numbers,
        payload.mapping,
    )
    return {
        "counts": counts,
        "count_total": len(counts),
        "source_policy": "Count structure is derived from the loaded operative pleading; no fixed count total is assumed.",
    }
