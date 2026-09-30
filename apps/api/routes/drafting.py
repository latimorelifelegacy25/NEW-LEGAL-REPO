from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

class EvidenceStatement(BaseModel):
    speaker: str
    quote: str
    exhibit: str

class PleadingDraftRequest(BaseModel):
    start_number: int = 1
    date: str | None = None
    time: str | None = None
    sender: str
    sender_email: str
    recipient: str
    recipient_email: str
    subject: str
    exhibit: str
    statements: list[EvidenceStatement] = Field(default_factory=list)

@router.post("/pleading-facts")
def draft_pleading_facts(payload: PleadingDraftRequest) -> dict:
    n = payload.start_number
    meta_bits = [f"On {payload.date}" if payload.date else "On ___"]
    if payload.time:
        meta_bits.append(f"at {payload.time}")
    meta = (
        f"{n}. {' '.join(meta_bits)}, {payload.sender} transmitted an email from "
        f"{payload.sender_email} to {payload.recipient} at {payload.recipient_email}, "
        f"subject line \"{payload.subject}\". ({payload.exhibit})."
    )
    paragraphs = [meta]
    n += 1
    for item in payload.statements:
        paragraphs.append(f'{n}. {item.speaker} stated: "{item.quote}" ({item.exhibit}).')
        n += 1
    return {
        "paragraphs": paragraphs,
        "rules_applied": [
            "one meta paragraph per exchange",
            "one quoted statement per numbered paragraph",
            "verbatim quotation preserved",
            "exhibit citation repeated on every paragraph",
            "no legal argument embedded in fact paragraphs",
        ],
    }
