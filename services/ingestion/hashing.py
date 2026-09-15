from hashlib import sha256
from pathlib import Path
def hash_file(path: str | Path) -> str:
    digest = sha256()
    with Path(path).open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()
