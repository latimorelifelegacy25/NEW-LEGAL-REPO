import re
from dataclasses import dataclass, asdict

EXHIBIT_RE = re.compile(r"\(Exhibit\s+(P-\d+|[A-Z0-9-]+)\)")

@dataclass(frozen=True)
class ParagraphExhibitLink:
    paragraph_number: int
    exhibit_label: str
    source_document_id: str | None
    status: str

def extract_exhibit_labels(text: str) -> list[str]:
    return [m.group(1) for m in EXHIBIT_RE.finditer(text)]

def build_links(
    paragraphs: list[dict],
    exhibit_index: dict[str, str],
) -> list[dict]:
    links=[]
    for p in paragraphs:
        number=int(p["number"])
        text=str(p["text"])
        labels=extract_exhibit_labels(text)
        for label in labels:
            source_id=exhibit_index.get(label)
            links.append(asdict(ParagraphExhibitLink(
                paragraph_number=number,
                exhibit_label=label,
                source_document_id=source_id,
                status="linked" if source_id else "missing_source",
            )))
    return links
