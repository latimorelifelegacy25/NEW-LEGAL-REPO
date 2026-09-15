from services.ingestion.safety import validate_archive_member
def test_blocks_parent_traversal() -> None:
    assert not validate_archive_member("../escape.txt")
def test_blocks_absolute_paths() -> None:
    assert not validate_archive_member("/etc/passwd")
