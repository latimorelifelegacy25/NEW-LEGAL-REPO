"""Import intact skill directories from mixed-layout ZIPs into private storage."""

from pathlib import Path, PurePosixPath
import re
import shutil
import stat
from tempfile import TemporaryDirectory
from zipfile import ZipFile


def import_packages(archives: list[Path], destination: Path) -> list[str]:
    """Validate the complete batch before copying; never overwrite an installation."""
    destination = destination.resolve()
    repository = Path(__file__).resolve().parents[2]
    if destination.is_relative_to(repository):
        raise ValueError("Use private storage outside the repository")
    packages: dict[str, list[tuple[str, bytes]]] = {}
    with TemporaryDirectory() as temporary:
        staging = Path(temporary)
        for archive in archives:
            with ZipFile(archive) as source:
                entries = source.infolist()
                if sum(item.file_size for item in entries) > 100_000_000:
                    raise ValueError("Archive exceeds 100 MB expanded limit")
                for item in entries:
                    path = PurePosixPath(item.filename)
                    mode = item.external_attr >> 16
                    if path.is_absolute() or ".." in path.parts or "\\" in item.filename or stat.S_ISLNK(mode):
                        raise ValueError("Unsafe archive member")
                roots = [PurePosixPath(item.filename).parent for item in entries
                         if PurePosixPath(item.filename).name == "SKILL.md"]
                if not roots:
                    raise ValueError("Archive contains no SKILL.md")
                for root in roots:
                    name = root.name
                    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name):
                        raise ValueError("Invalid skill directory name")
                    if name in packages or (destination / name).exists():
                        raise ValueError(f"Duplicate or already installed skill: {name}")
                    members = []
                    seen = set()
                    for item in entries:
                        path = PurePosixPath(item.filename)
                        if item.is_dir() or not path.is_relative_to(root):
                            continue
                        relative = str(path.relative_to(root))
                        if relative in seen:
                            raise ValueError("Duplicate archive member")
                        seen.add(relative)
                        members.append((relative, source.read(item)))
                    text = dict(members)["SKILL.md"].decode("utf-8")
                    header = re.match(r"\A---\s*\n(.*?)\n---", text, re.S)
                    declared = re.search(r"^name:\s*[\"']?([a-z0-9-]+)[\"']?\s*$", header[1], re.M) if header else None
                    if not declared or declared[1] != name:
                        raise ValueError("Skill name must match its directory")
                    packages[name] = members
        for name, members in packages.items():
            for relative, data in members:
                target = staging / name / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
        destination.mkdir(parents=True, exist_ok=True)
        for name in packages:
            shutil.copytree(staging / name, destination / name)
    return sorted(packages)
