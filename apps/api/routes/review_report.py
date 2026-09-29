from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

class ReviewIssue(BaseModel):
    code: str
    severity: str
    location: str
    message: str
    source: str | None = None

class ReviewReportRequest(BaseModel):
    docket: str
    document_name: str
    issues: list[ReviewIssue] = Field(default_factory=list)

@router.post("/generate")
def generate_review_report(payload: ReviewReportRequest) -> dict:
    grouped = {"error": [], "warning": [], "info": []}
    for issue in payload.issues:
        grouped.setdefault(issue.severity, []).append(issue.model_dump())
    return {
        "docket": payload.docket,
        "document_name": payload.document_name,
        "summary": {
            "total": len(payload.issues),
            "errors": len(grouped.get("error", [])),
            "warnings": len(grouped.get("warning", [])),
            "info": len(grouped.get("info", [])),
        },
        "issues": [i.model_dump() for i in payload.issues],
        "required_fields_per_issue": ["location", "message", "source"],
        "status": "review_required" if payload.issues else "no_issues_found",
    }
