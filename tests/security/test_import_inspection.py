import zipfile
from pathlib import Path
from apps.api.routes.imports import _inspect

def test_safe_zip_inspection(tmp_path: Path):
    archive = tmp_path / "safe.zip"
    with zipfile.ZipFile(archive, "w") as zf: zf.writestr("skill/SKILL.md", "ok")
    result = _inspect(archive)
    assert result["archive"] is True
    assert result["unsafe_members"] == []

def test_unsafe_zip_inspection(tmp_path: Path):
    archive = tmp_path / "unsafe.zip"
    with zipfile.ZipFile(archive, "w") as zf: zf.writestr("../escape.txt", "bad")
    result = _inspect(archive)
    assert result["unsafe_members"] == ["../escape.txt"]
