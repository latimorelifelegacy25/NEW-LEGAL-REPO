from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _documents() -> list[tuple[Path, str]]:
    roots = [repo_root() / "legal_skills", repo_root() / "legal_matters", repo_root() / "workflows"]
    docs: list[tuple[Path, str]] = []
    for root in roots:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in {".md", ".json"}:
                continue
            if "source-pdfs" in path.parts or "offline-law" in path.parts:
                continue
            try:
                docs.append((path, path.read_text(encoding="utf-8", errors="replace")))
            except OSError:
                continue
    return docs


def _excerpt(text: str, query: str, width: int = 420) -> tuple[str, int | None]:
    idx = text.lower().find(query.lower())
    if idx < 0:
        tokens = [t for t in re.findall(r"[A-Za-z0-9_-]+", query.lower()) if len(t) > 2]
        positions = [text.lower().find(t) for t in tokens]
        positions = [p for p in positions if p >= 0]
        idx = min(positions) if positions else 0
    start = max(0, idx - width // 3)
    end = min(len(text), start + width)
    line = text.count("\n", 0, idx) + 1 if text else None
    return text[start:end].strip(), line


def search(query: str, top_k: int = 10) -> dict[str, Any]:
    query = query.strip()
    if not query:
        return {"query": query, "results": []}
    terms = [t for t in re.findall(r"[A-Za-z0-9_-]+", query.lower()) if len(t) > 1]
    ranked = []
    root = repo_root()
    for path, text in _documents():
        low = text.lower()
        exact = low.count(query.lower())
        hits = sum(low.count(term) for term in terms)
        if exact == 0 and hits == 0:
            continue
        score = exact * 20 + hits
        excerpt, line = _excerpt(text, query)
        ranked.append({"score": score,"path": str(path.relative_to(root)),"line": line,"excerpt": excerpt})
    ranked.sort(key=lambda x: (-x["score"], x["path"]))
    return {"query": query, "results": ranked[: max(1, min(top_k, 50))]}


def build_index() -> dict[str, Any]:
    root = repo_root()
    docs = []
    for path, text in _documents():
        docs.append({"path": str(path.relative_to(root)), "chars": len(text), "lines": text.count("\n") + 1})
    target = root / "var" / "knowledge_index.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps({"documents": docs}, indent=2), encoding="utf-8")
    return {"status": "built", "documents": len(docs), "path": str(target.relative_to(root))}
