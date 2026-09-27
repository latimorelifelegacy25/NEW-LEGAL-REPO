from pathlib import Path
from tempfile import TemporaryDirectory

from services.registry.legal_skills import discover_skills
from services.workflow.litigation import litigation_stages


def test_discovery_and_stage_availability() -> None:
    with TemporaryDirectory() as directory:
        root = Path(directory)
        package = root / "chronology"
        package.mkdir()
        (package / "SKILL.md").write_text("---\nname: chronology\ndescription: Build a timeline.\n---\n", encoding="utf-8")
        (root / "wrong").mkdir()
        (root / "wrong" / "SKILL.md").write_text("---\nname: different\n---\n", encoding="utf-8")
        skills = discover_skills(root)
        assert [(skill.name, skill.description) for skill in skills] == [("chronology", "Build a timeline.")]
        stages = litigation_stages({skill.name for skill in skills})
        assert next(stage for stage in stages if stage["stage"] == "facts")["available_skills"] == ["chronology"]
