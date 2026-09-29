from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass, asdict
from io import BytesIO
from typing import Iterable

from docx import Document

@dataclass(frozen=True)
class DocxParagraph:
    index: int
    text: str
    style: str | None

def read_docx_paragraphs(data: bytes) -> list[dict]:
    doc=Document(BytesIO(data))
    out=[]
    for idx,p in enumerate(doc.paragraphs):
        out.append(asdict(DocxParagraph(
            index=idx,
            text=p.text,
            style=p.style.name if p.style else None,
        )))
    return out

def clone_document(data: bytes) -> Document:
    source=Document(BytesIO(data))
    target=Document()
    body=target._element.body
    for child in list(body):
        body.remove(child)
    for child in source._element.body:
        body.append(deepcopy(child))
    return target

def apply_approved_edits(
    *,
    original_data: bytes,
    approved_edits: Iterable[dict],
) -> bytes:
    doc=clone_document(original_data)
    paragraphs=doc.paragraphs
    for edit in approved_edits:
        if edit.get("status") != "approved":
            continue
        location=edit.get("location", "")
        if not location.startswith("paragraph-index:"):
            continue
        idx=int(location.split(":",1)[1])
        if idx < 0 or idx >= len(paragraphs):
            continue
        paragraphs[idx].text=str(edit.get("after",""))
    out=BytesIO()
    doc.save(out)
    return out.getvalue()


def read_numbered_docx_paragraphs(data: bytes) -> list[dict]:
    """Return Word list-numbered paragraphs in document order.

    Word often stores pleading numbers in w:numPr rather than literal paragraph text.
    This detects those paragraphs without pretending the visible number is embedded
    in p.text. Sequential display numbers are assigned in document order and the
    underlying numId/ilvl are retained for audit.
    """
    doc=Document(BytesIO(data))
    out=[]
    display_number=0
    for idx,p in enumerate(doc.paragraphs):
        pPr=p._p.pPr
        numPr=pPr.numPr if pPr is not None else None
        if numPr is None:
            continue
        display_number += 1
        num_id=int(numPr.numId.val) if numPr.numId is not None else None
        ilvl=int(numPr.ilvl.val) if numPr.ilvl is not None else None
        out.append({
            "index": idx,
            "display_number": display_number,
            "text": p.text,
            "style": p.style.name if p.style else None,
            "num_id": num_id,
            "level": ilvl,
        })
    return out
