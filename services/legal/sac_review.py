import re
from dataclasses import dataclass, asdict
from typing import Iterable

EXHIBIT_RE = re.compile(r"\(Exhibit\s+(P-\d+|[A-Z0-9-]+)\)")
DOCKET_RE = re.compile(r"\bS-\d{3,5}-\d{4}\b")

@dataclass(frozen=True)
class ReviewIssue:
    code: str
    severity: str
    location: str
    message: str
    source: str | None = None

def review_paragraph_sequence(numbers: Iterable[int]) -> list[ReviewIssue]:
    nums=list(numbers)
    issues=[]
    if not nums:
        return issues
    seen={}
    for n in nums:
        seen[n]=seen.get(n,0)+1
    for n,count in sorted(seen.items()):
        if count>1:
            issues.append(ReviewIssue(
                code="DUPLICATE_PARAGRAPH",
                severity="error",
                location=f"Paragraph {n}",
                message=f"Paragraph number {n} appears {count} times.",
                source="SAC numbering",
            ))
    expected=set(range(min(nums), max(nums)+1))
    for n in sorted(expected-set(nums)):
        issues.append(ReviewIssue(
            code="MISSING_PARAGRAPH",
            severity="error",
            location=f"Paragraph {n}",
            message=f"Paragraph number {n} is missing from the sequence.",
            source="SAC numbering",
        ))
    return issues

def review_text_fields(paragraph_number:int,text:str,expected_docket:str) -> list[ReviewIssue]:
    issues=[]
    docket_matches=DOCKET_RE.findall(text)
    for docket in docket_matches:
        if docket != expected_docket:
            issues.append(ReviewIssue(
                code="DOCKET_MISMATCH",
                severity="error",
                location=f"Paragraph {paragraph_number}",
                message=f"Found docket {docket}; expected {expected_docket}.",
                source="SAC text",
            ))
    if "Exhibit" in text and not EXHIBIT_RE.search(text):
        issues.append(ReviewIssue(
            code="EXHIBIT_LABEL_FORMAT",
            severity="warning",
            location=f"Paragraph {paragraph_number}",
            message="Exhibit reference is present but does not match the required parenthetical format.",
            source="SAC text",
        ))
    return issues

def issue_dicts(issues:list[ReviewIssue]) -> list[dict]:
    return [asdict(i) for i in issues]
