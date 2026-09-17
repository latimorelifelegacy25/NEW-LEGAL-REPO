from pathlib import Path
from services.ingestion.hashing import hash_file
def test_hash_file(tmp_path: Path) -> None:
    file = tmp_path / "a.txt"
    file.write_text("hello", encoding="utf-8")
    assert len(hash_file(file)) == 64
