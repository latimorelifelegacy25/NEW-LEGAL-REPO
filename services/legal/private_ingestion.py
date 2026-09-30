from dataclasses import dataclass, asdict
from pathlib import Path
import hashlib
import re

PRIVATE_ROOT = Path("private")

@dataclass(frozen=True)
class PrivateDocument:
    document_id: str
    docket: str
    filename: str
    sha256: str
    source_type: str
    storage_path: str

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def _safe_segment(value: str, fallback: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._") or fallback

def build_private_path(docket: str, document_id: str, filename: str) -> Path:
    safe_docket=_safe_segment(docket, "matter")
    safe_document_id=_safe_segment(document_id, "document")
    safe_name=_safe_segment(filename, "document")
    return PRIVATE_ROOT / safe_docket / safe_document_id / safe_name

def register_private_document(
    *,
    document_id: str,
    docket: str,
    filename: str,
    data: bytes,
    source_type: str,
) -> dict:
    path = build_private_path(docket, document_id, filename)
    return asdict(PrivateDocument(
        document_id=document_id,
        docket=docket,
        filename=filename,
        sha256=sha256_bytes(data),
        source_type=source_type,
        storage_path=str(path),
    ))
