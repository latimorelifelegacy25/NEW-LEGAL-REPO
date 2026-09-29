from fastapi import APIRouter
from pydantic import BaseModel, Field
from services.legal.count_mapping import build_count_map

router = APIRouter()

class CountMappingRequest(BaseModel):
    docket: str
    mapping: dict[str, list[int]] = Field(default_factory=dict)

@router.post("/map")
def map_counts(payload: CountMappingRequest) -> dict:
    return {
        "docket": payload.docket,
        "counts": build_count_map(payload.mapping),
        "note": "Mappings must be derived from the actual SAC and supporting source documents when private matter data is loaded.",
    }
