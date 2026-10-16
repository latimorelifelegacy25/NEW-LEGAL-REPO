"""Import intact skill directories from mixed-layout ZIPs into private storage."""

from pathlib import Path, PurePosixPath
import re
import shutil
import stat
from tempfile import TemporaryDirectory
from zipfile import ZipFile

from services.registry.skill_revisions import revise_packages


def import_packages(archives: list[Path], destination: Path, *, reviewed: bool = False) -> list[str]:
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
                    if name in packages or (destination / name).exists() or (destination / name).is_symlink():
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
        if reviewed:
            required = {"pa-litigation-command", "pa-law-reference", "pleading-fact-paragraphs",
                        "style-latimore-legal-documents", "accuracy-verification-pass", "latimore-lead-research"}
            if not required.issubset(packages):
                raise ValueError("Reviewed integration requires all six supplied skill packages")
            if (destination / ".integration").exists():
                raise ValueError("Revision audit already exists; use a new installation directory")
            revise_packages(staging)
        destination.mkdir(parents=True, exist_ok=True)
        installed = []
        try:
            for name in list(packages) + ([".integration"] if reviewed else []):
                if (destination / name).exists() or (destination / name).is_symlink():
                    raise ValueError(f"Installation target already exists: {name}")
                # Reserve exclusively, then roll back this batch on copy failure.
                (destination / name).mkdir()
                installed.append(destination / name)
                shutil.copytree(staging / name, destination / name, dirs_exist_ok=True)
        except Exception:
            for path in reversed(installed):
                shutil.rmtree(path)
            raise
    return sorted(packages)
