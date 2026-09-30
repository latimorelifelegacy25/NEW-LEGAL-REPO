from dataclasses import dataclass, asdict
from difflib import SequenceMatcher

@dataclass(frozen=True)
class QuoteCheck:
    paragraph_number: int
    quote: str
    source_document_id: str
    matched: bool
    similarity: float

def normalize(text: str) -> str:
    return " ".join(text.split())

def verify_quote(
    *,
    paragraph_number: int,
    quote: str,
    source_document_id: str,
    source_text: str,
    threshold: float = 0.98,
) -> dict:
    q=normalize(quote)
    s=normalize(source_text)
    if q and q in s:
        score=1.0
        matched=True
    else:
        score=SequenceMatcher(None, q, s).ratio() if q and s else 0.0
        matched=score >= threshold
    return asdict(QuoteCheck(
        paragraph_number=paragraph_number,
        quote=quote,
        source_document_id=source_document_id,
        matched=matched,
        similarity=round(score, 4),
    ))
