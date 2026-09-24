from __future__ import annotations
import json, os
from copy import deepcopy
from pathlib import Path
from threading import RLock
from typing import Any
_LOCK = RLock()
_DEFAULT = {"imports": [], "approvals": [], "audit": [], "workflow_runs": []}

def _repo_root() -> Path:
    return Path(__file__).resolve().parents[2]

class JsonStore:
    def __init__(self, path: str | Path | None = None):
        configured = path or os.getenv("LEGALOS_STATE_PATH")
        self.path = Path(configured) if configured else _repo_root() / "var" / "state.json"
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists(): self._write(deepcopy(_DEFAULT))
    def _read(self) -> dict[str, Any]:
        with _LOCK:
            if not self.path.exists(): return deepcopy(_DEFAULT)
            data = json.loads(self.path.read_text(encoding="utf-8"))
            for key, value in _DEFAULT.items(): data.setdefault(key, deepcopy(value))
            return data
    def _write(self, data: dict[str, Any]) -> None:
        with _LOCK:
            tmp = self.path.with_suffix(self.path.suffix + ".tmp")
            tmp.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")
            tmp.replace(self.path)
    def list(self, collection: str) -> list[dict[str, Any]]:
        return list(self._read().get(collection, []))
    def append(self, collection: str, item: dict[str, Any]) -> dict[str, Any]:
        data=self._read(); data.setdefault(collection, []).append(item); self._write(data); return item
    def update(self, collection: str, item_id: str, changes: dict[str, Any]) -> dict[str, Any] | None:
        data=self._read()
        for item in data.setdefault(collection, []):
            if str(item.get("id")) == str(item_id):
                item.update(changes); self._write(data); return item
        return None
    def get(self, collection: str, item_id: str) -> dict[str, Any] | None:
        for item in self._read().get(collection, []):
            if str(item.get("id")) == str(item_id): return item
        return None

def get_store() -> JsonStore:
    return JsonStore()
