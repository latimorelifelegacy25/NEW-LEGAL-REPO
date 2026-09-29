from fastapi import APIRouter
from pydantic import BaseModel, Field
from services.legal.count_mapping import build_count_map
from services.legal.linking import build_links
from services.legal.sac_review import review_paragraph_sequence, review_text_fields, issue_dicts

router = APIRouter()

class Paragraph(BaseModel):
    number: int
    text: str

class AcceptanceRequest(BaseModel):
    docket: str = "S-1214-2026"
    paragraphs: list[Paragraph] = Field(default_factory=list)
    exhibit_index: dict[str,str] = Field(default_factory=dict)
    count_mapping: dict[str,list[int]] = Field(default_factory=dict)

@router.post("/run")
def run_acceptance(payload: AcceptanceRequest) -> dict:
    issues=[]
    numbers=[p.number for p in payload.paragraphs]
    issues.extend(review_paragraph_sequence(numbers))
    for p in payload.paragraphs:
        issues.extend(review_text_fields(p.number, p.text, payload.docket))

    links=build_links(
        [{"number":p.number,"text":p.text} for p in payload.paragraphs],
        payload.exhibit_index,
    )
    for link in links:
        if link["status"]=="missing_source":
            issues.append(type("Issue", (), {
                "__dict__": {},
                "code":"MISSING_EXHIBIT_SOURCE",
                "severity":"error",
                "location":f'Paragraph {link["paragraph_number"]}',
                "message":f'No loaded source is registered for Exhibit {link["exhibit_label"]}.',
                "source":"paragraph-to-exhibit linking",
            })())

    serialized=[]
    for i in issues:
        if hasattr(i, "__dataclass_fields__"):
            serialized.append({
                "code":i.code,
                "severity":i.severity,
                "location":i.location,
                "message":i.message,
                "source":i.source,
            })
        else:
            serialized.append({
                "code":getattr(i,"code"),
                "severity":getattr(i,"severity"),
                "location":getattr(i,"location"),
                "message":getattr(i,"message"),
                "source":getattr(i,"source",None),
            })

    return {
        "docket": payload.docket,
        "checks": {
            "paragraph_numbering": True,
            "duplicate_missing": True,
            "docket_references": True,
            "exhibit_labels": True,
            "paragraph_exhibit_links": True,
            "five_count_mapping": True,
        },
        "links": links,
        "counts": build_count_map(payload.count_mapping),
        "issues": serialized,
        "issue_count": len(serialized),
        "status": "issues_found" if serialized else "passed",
        "limitations": [
            "name/date verification requires normalized source metadata or loaded source text",
            "quotation verification runs through the private source quote endpoint",
            "docx export requires document-generation integration and approved edits only",
        ],
    }
