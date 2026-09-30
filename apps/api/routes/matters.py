from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

class MatterSummary(BaseModel):
    docket: str
    caption: str
    stage: str
    private_materials_loaded: bool = False

MATTERS = {
    "S-1214-2026": MatterSummary(
        docket="S-1214-2026",
        caption="Latimore v. Assumption BVM School, Diocese of Allentown, and Carol Boyer",
        stage="Second Amended Complaint / discovery",
        private_materials_loaded=False,
    )
}

@router.get("/")
def list_matters() -> list[MatterSummary]:
    return list(MATTERS.values())

@router.get("/{docket}")
def get_matter(docket: str) -> MatterSummary:
    matter = MATTERS.get(docket)
    if not matter:
        raise HTTPException(status_code=404, detail="Matter not found")
    return matter
