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
