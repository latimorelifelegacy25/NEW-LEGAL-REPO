from __future__ import annotations

import shutil
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
from services.audit.service import create_event
from services.ingestion.hashing import hash_file
from services.ingestion.safety import validate_archive_member
from services.storage import get_store
router = APIRouter()

class ImportRequest(BaseModel):
    source_path: str


def _inspect(path: Path) -> dict:
    if not path.exists() or not path.is_file():
        raise HTTPException(404, "source file not found")
    unsafe: list[str] = []
    members = 0
    if zipfile.is_zipfile(path):
        with zipfile.ZipFile(path) as archive:
            for info in archive.infolist():
                members += 1
                if not validate_archive_member(info.filename):
                    unsafe.append(info.filename)
    return {"sha256": hash_file(path), "archive": zipfile.is_zipfile(path), "members": members, "unsafe_members": unsafe}


def _record(path: Path, original_filename: str) -> dict:
    result = _inspect(path)
    status = "quarantined" if result["unsafe_members"] else "validated"
    record = {
        "id": str(uuid.uuid4()), "original_filename": original_filename,
        "source_path": str(path), "status": status, **result,
        "imported_at": datetime.now(timezone.utc).isoformat(),
    }
    get_store().append("imports", record)
    get_store().append("audit", create_event("import.inspected", {"import_id":record["id"], "status":status, "sha256":record["sha256"]}))
    return record

@router.get("")
def list_imports() -> list[dict]:
    return get_store().list("imports")

@router.post("")
def create_import(req: ImportRequest) -> dict:
    return _record(Path(req.source_path).expanduser().resolve(), Path(req.source_path).name)

@router.post("/upload")
def upload_import(file: UploadFile = File(...)) -> dict:
    target_dir = Path(__file__).resolve().parents[3] / "var" / "imports"
    target_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(file.filename or "upload.bin").name
    target = target_dir / f"{uuid.uuid4()}-{safe_name}"
    with target.open("wb") as fh:
        shutil.copyfileobj(file.file, fh)
    return _record(target, safe_name)
