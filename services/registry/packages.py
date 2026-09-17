def is_duplicate(package_hash: str, known_hashes: set[str]) -> bool:
    return package_hash in known_hashes
