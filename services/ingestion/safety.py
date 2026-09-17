from pathlib import PurePosixPath
def validate_archive_member(name: str) -> bool:
    path = PurePosixPath(name)
    return not path.is_absolute() and ".." not in path.parts
