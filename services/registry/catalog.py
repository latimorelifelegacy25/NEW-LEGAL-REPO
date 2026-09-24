from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from typing import Any


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def skills_root() -> Path:
    override = os.getenv("LEGALOS_SKILLS_DIR")
    return Path(override) if override else repo_root() / "legal_skills"


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _frontmatter(text: str) -> dict[str, str]:
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end < 0:
        return {}
    result: dict[str, str] = {}
    for line in text[3:end].splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            result[key.strip()] = value.strip().strip('"').strip("'")
    return result


def _registry() -> dict[str, Any]:
    path = skills_root() / "registry.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {"skills": [], "policy": {}}


def list_skills() -> list[dict[str, Any]]:
    root = skills_root()
    declared = {item["canonical_id"]: item for item in _registry().get("skills", [])}
    records: list[dict[str, Any]] = []
    for skill_file in sorted(root.glob("**/SKILL.md")):
        rel = skill_file.relative_to(root)
        text = skill_file.read_text(encoding="utf-8", errors="replace")
        fm = _frontmatter(text)
        name = fm.get("name") or skill_file.parent.name
        canonical_candidates = [k for k, v in declared.items() if v.get("name") == name]
        canonical_id = canonical_candidates[0] if len(canonical_candidates) == 1 else str(rel.parent).replace("/", ".")
        meta = dict(declared.get(canonical_id, {}))
        meta.update({
            "canonical_id": canonical_id,
            "name": name,
            "description": fm.get("description", ""),
            "path": str(rel),
            "content_hash": _sha256(skill_file),
            "integrity": "verified" if not meta.get("skill_hash") or meta.get("skill_hash") == _sha256(skill_file) else "hash_mismatch",
        })
        records.append(meta)
    return records


def get_skill(canonical_id: str) -> dict[str, Any] | None:
    return next((s for s in list_skills() if s["canonical_id"] == canonical_id), None)


def _resolve_skill_dir(record: dict[str, Any]) -> Path:
    return skills_root() / Path(record["path"]).parent


def skill_bundle(canonical_id: str) -> dict[str, Any] | None:
    record = get_skill(canonical_id)
    if not record:
        return None
    directory = _resolve_skill_dir(record)
    files: list[dict[str, str]] = []
    for path in sorted(directory.rglob("*.md")):
        files.append({"path": str(path.relative_to(skills_root())), "content": path.read_text(encoding="utf-8", errors="replace")})
    return {"skill": record, "files": files}


def verify_catalog() -> dict[str, Any]:
    records = list_skills()
    ids = [r["canonical_id"] for r in records]
    duplicate_ids = sorted({x for x in ids if ids.count(x) > 1})
    mismatches = [r["canonical_id"] for r in records if r.get("integrity") != "verified"]
    declared_ids = {item["canonical_id"] for item in _registry().get("skills", [])}
    discovered_ids = set(ids)
    return {
        "status": "pass" if not duplicate_ids and not mismatches and declared_ids == discovered_ids else "pass_with_warnings",
        "count": len(records),
        "duplicate_ids": duplicate_ids,
        "hash_mismatches": mismatches,
        "declared_not_discovered": sorted(declared_ids - discovered_ids),
        "discovered_not_declared": sorted(discovered_ids - declared_ids),
        "policy": _registry().get("policy", {}),
    }
