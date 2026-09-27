"""Discover local legal skill packages without publishing matter data."""

from dataclasses import dataclass
from pathlib import Path
import os
import re


@dataclass(frozen=True)
class LegalSkill:
    name: str
    description: str
    path: str


def skill_root() -> Path:
    return Path(os.environ.get("LEGAL_SKILLS_ROOT", "legal/skills")).resolve()


def discover_skills(root: Path | None = None) -> list[LegalSkill]:
    root = (root or skill_root()).resolve()
    if not root.is_dir():
        return []
    found: list[LegalSkill] = []
    for file in sorted(root.glob("*/SKILL.md")):
        if file.is_symlink() or not file.resolve().is_relative_to(root):
            continue
        contents = file.read_text(encoding="utf-8")
        match = re.match(r"\A---\s*\n(.*?)\n---\s*\n", contents, re.S)
        if not match:
            continue
        fields = dict(re.findall(r"^(name|description):\s*(.+)$", match.group(1), re.M))
        name = fields.get("name", "").strip(' "\'')
        if name != file.parent.name:
            continue
        found.append(LegalSkill(name=name, description=fields.get("description", "").strip(' "\''), path=str(file.relative_to(root))))
    return found
