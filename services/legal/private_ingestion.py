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

def build_private_path(docket: str, document_id: str, filename: str) -> Path:
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", filename).strip("._") or "document"
    return PRIVATE_ROOT / docket / document_id / safe_name

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
