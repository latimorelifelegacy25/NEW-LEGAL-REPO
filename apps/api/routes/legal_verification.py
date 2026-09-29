import re
from collections import Counter
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

class ParagraphInput(BaseModel):
    number: int
    text: str

class VerificationRequest(BaseModel):
    docket: str
    paragraphs: list[ParagraphInput] = Field(default_factory=list)

class Issue(BaseModel):
    code: str
    location: str
    message: str
    severity: str

@router.post("/sac")
def verify_sac(payload: VerificationRequest) -> dict:
    issues: list[Issue] = []
    numbers = [p.number for p in payload.paragraphs]
    counts = Counter(numbers)

    for number, count in counts.items():
        if count > 1:
            issues.append(Issue(
                code="DUPLICATE_PARAGRAPH",
                location=f"Paragraph {number}",
                message=f"Paragraph number {number} appears {count} times.",
                severity="error",
            ))

    if numbers:
        expected = set(range(min(numbers), max(numbers) + 1))
        missing = sorted(expected - set(numbers))
        for number in missing:
            issues.append(Issue(
                code="MISSING_PARAGRAPH",
                location=f"Between surrounding paragraphs",
                message=f"Paragraph {number} is missing from the numbering sequence.",
                severity="error",
            ))

    exhibit_pattern = re.compile(r"\(Exhibit\s+([A-Z0-9-]+)\)")
    for p in payload.paragraphs:
        if "Exhibit" in p.text and not exhibit_pattern.search(p.text):
            issues.append(Issue(
                code="EXHIBIT_LABEL_FORMAT",
                location=f"Paragraph {p.number}",
                message="Exhibit reference does not match the required parenthetical format.",
                severity="warning",
            ))

    return {
        "docket": payload.docket,
        "status": "verified" if not issues else "issues_found",
        "issue_count": len(issues),
        "issues": [i.model_dump() for i in issues],
        "checks": [
            "paragraph numbering",
            "duplicate paragraphs",
            "missing paragraphs",
            "exhibit label format",
        ],
        "note": "Private source-document validation for names, dates, quotations, and exhibit-source matching requires the SAC and exhibits to be loaded outside the public repository.",
    }
