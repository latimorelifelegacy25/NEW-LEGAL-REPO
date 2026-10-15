from pathlib import Path
from zipfile import ZipFile

import pytest

from services.registry.skill_import import import_packages
from services.registry.legal_skills import discover_skills
from services.workflow.litigation import litigation_stages


def archive(path: Path, prefix: str, extra: str | None = None) -> Path:
    with ZipFile(path, "w") as output:
        output.writestr(f"{prefix}/example/SKILL.md", '---\nname: "example"\ndescription: Example.\n---\n')
        output.writestr(f"{prefix}/example/references/source.txt", b"unchanged")
        if extra:
            output.writestr(extra, b"unsafe")
    return path


@pytest.mark.parametrize("prefix", ["skills", "package"])
def test_import_preserves_bytes_and_discovers(tmp_path, prefix):
    source = archive(tmp_path / "input.zip", prefix)
    destination = tmp_path / "installed"
    assert import_packages([source], destination) == ["example"]
    assert (destination / "example/references/source.txt").read_bytes() == b"unchanged"
    assert discover_skills(destination)[0].name == "example"
    with pytest.raises(ValueError, match="already installed"):
        import_packages([source], destination)


def test_rejects_traversal_before_installing_any_package(tmp_path):
    good = archive(tmp_path / "good.zip", "skills")
    bad = archive(tmp_path / "bad.zip", "skills", "../escaped.txt")
    destination = tmp_path / "installed"
    with pytest.raises(ValueError, match="Unsafe"):
        import_packages([good, bad], destination)
    assert not destination.exists()


def test_legal_stages_include_reviewed_roles_without_business_skill():
    stages = {stage["stage"]: stage["skills"] for stage in litigation_stages(set())}
    assert "pa-litigation-command" in stages["pleadings"]
    assert "style-latimore-legal-documents" in stages["motions"]
    assert "pa-law-reference" in stages["discovery"]
    assert all("latimore-lead-research" not in skills for skills in stages.values())
