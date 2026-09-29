from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.legal.linking import build_links
from services.legal.private_ingestion import register_private_document
from services.legal.quotes import verify_quote
from services.legal.source_index import SourceIndex, SourceRecord

router = APIRouter()
_INDEX = SourceIndex()
_TEXT: dict[str, str] = {}

class PrivateSourceRegistration(BaseModel):
    source_id: str
    docket: str
    label: str
    filename: str
    source_type: str
    content_text: str = ""

class LinkRequest(BaseModel):
    paragraphs: list[dict] = Field(default_factory=list)

class QuoteRequest(BaseModel):
    paragraph_number: int
    quote: str
    source_id: str

@router.post("/register")
def register_source(payload: PrivateSourceRegistration) -> dict:
    metadata = register_private_document(
        document_id=payload.source_id,
        docket=payload.docket,
        filename=payload.filename,
        data=payload.content_text.encode("utf-8"),
        source_type=payload.source_type,
    )
    _INDEX.register(SourceRecord(
        source_id=payload.source_id,
        docket=payload.docket,
        label=payload.label,
        filename=payload.filename,
        sha256=metadata["sha256"],
        source_type=payload.source_type,
    ))
    _TEXT[payload.source_id]=payload.content_text
    return {
        "source": _INDEX.by_id(payload.source_id),
        "private_storage_path": metadata["storage_path"],
        "repository_policy": "metadata schema may be public; private document bytes/text must not be committed to GitHub",
    }

@router.get("/{source_id}")
def get_source(source_id: str) -> dict:
    record=_INDEX.by_id(source_id)
    if not record:
        raise HTTPException(status_code=404, detail="Source not found")
    return record

@router.post("/link-paragraphs")
def link_paragraphs(payload: LinkRequest) -> dict:
    links=build_links(payload.paragraphs, _INDEX.label_map())
    return {
        "links": links,
        "missing_source_count": sum(1 for x in links if x["status"]=="missing_source"),
    }

@router.post("/verify-quote")
def quote_check(payload: QuoteRequest) -> dict:
    if payload.source_id not in _TEXT:
        raise HTTPException(status_code=404, detail="Source text not loaded")
    return verify_quote(
        paragraph_number=payload.paragraph_number,
        quote=payload.quote,
        source_document_id=payload.source_id,
        source_text=_TEXT[payload.source_id],
    )
