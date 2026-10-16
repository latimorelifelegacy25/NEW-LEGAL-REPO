import hashlib
import json
from pathlib import Path
import subprocess
import sys
from zipfile import ZipFile

import pytest

from services.registry.pa_snapshot_lookup import find_section
from services.registry.skill_import import import_packages
from services.registry.skill_revisions import NUMBERING


NAMES = ("pa-litigation-command", "pa-law-reference", "pleading-fact-paragraphs",
         "style-latimore-legal-documents", "accuracy-verification-pass", "latimore-lead-research")


def bundle(tmp_path):
    path = tmp_path / "skills.zip"
    with ZipFile(path, "w") as output:
        for name in NAMES:
            output.writestr(f"skills/{name}/SKILL.md", f"---\nname: {name}\ndescription: Example.\n---\nKeep this original instruction.\n")
        output.writestr("skills/pa-law-reference/scripts/lookup.py", "# original lookup\n")
        output.writestr("skills/pa-litigation-command/scripts/audit_pleading.py", "import re\n\ndef paragraph_numbers(text):\n    return []\n\ndef sequence_issues(numbers):\n    return numbers\n")
        output.writestr("skills/pa-law-reference/references/pa-code-rules-civil-procedure.txt",
                        "===== PAGE 1 =====\nRule 204.1. Format.\nUse white paper.\nRule 205. Next rule.\n")
        output.writestr("skills/accuracy-verification-pass/references/legal-case-reference.md", "# Prior snapshot\nHistorical structure.\n")
        output.writestr("skills/latimore-lead-research/references/shared-rules.md",
                        "Navy #000835\nDomain: latimorelegacy.com only (never latimorelifeandlegacy.com).\n")
    return path


def test_reviewed_bundle_preserves_originals_and_hashes(tmp_path):
    source = bundle(tmp_path)
    destination = tmp_path / "installed"
    assert import_packages([source], destination, reviewed=True) == sorted(NAMES)
    manifest = json.loads((destination / ".integration/manifest.json").read_text())
    with ZipFile(source) as archive:
        for entry in manifest["changes"]:
            original = (destination / ".integration/originals" / entry["path"]).read_bytes()
            assert original == archive.read("skills/" + entry["path"])
            assert hashlib.sha256(original).hexdigest() == entry["before_sha256"]
            assert hashlib.sha256((destination / entry["path"]).read_bytes()).hexdigest() == entry["after_sha256"]
    profile = (destination / "accuracy-verification-pass/references/legal-case-reference.md").read_text()
    assert "HISTORICAL SNAPSHOT" in profile and "Historical structure." in profile
    branding = (destination / "latimore-lead-research/references/shared-rules.md").read_text()
    assert "#2C3E50" in branding and "www.latimorelifelegacy.com" in branding
    namespace = {"__name__": "test_import"}
    exec((destination / "pa-litigation-command/scripts/audit_pleading.py").read_text(), namespace)
    assert namespace["paragraph_numbers"]("98. First\n102. Gap\n102. Duplicate") == [98, 102, 102]
    script = destination / "pa-law-reference/scripts/lookup.py"
    result = subprocess.run([sys.executable, str(script), "--file", "pa-code-rules", "--rule", "204.1"], capture_output=True, text=True)
    assert result.returncode == 0 and "Use white paper." in result.stdout and "PDF page: 1" in result.stdout
    missing = subprocess.run([sys.executable, str(script), "--file", "pa-code-rules", "--rule", "999"], capture_output=True)
    assert missing.returncode == 1


def test_review_requires_complete_dependency_bundle(tmp_path):
    source = tmp_path / "single.zip"
    with ZipFile(source, "w") as archive:
        archive.writestr("example/SKILL.md", "---\nname: example\ndescription: Example.\n---\n")
    with pytest.raises(ValueError, match="all six"):
        import_packages([source], tmp_path / "installed", reviewed=True)
    assert not (tmp_path / "installed").exists()


@pytest.mark.parametrize("text,expected", [
    ("1. First\n2. Second\n4. Gap", [1, 2, 4]),
    ("1. First\n2. Second\n2. Duplicate\n3. Third", [1, 2, 2, 3]),
    ("98. First\n99. Next\n102. Gap", [98, 99, 102]),
    ("1.\u200bFirst\n2.\ufeffSecond", [1, 2]),
])
def test_corrected_numbering_keeps_all_labels(text, expected):
    import re
    namespace = {"re": re}
    exec(NUMBERING, namespace)
    assert namespace["paragraph_numbers"](text) == expected


def test_lookup_chooses_body_over_table_of_contents():
    text = "Rule 204.1. Format.\nRule 205. Other.\n===== PAGE 2 =====\nRule 204.1. Format.\nDetailed operative body language.\nRule 205. Other."
    result = find_section(text, "204.1", rule=True)
    assert result and "Detailed operative body" in result[0]


def test_copy_failure_rolls_back_new_directories(tmp_path, monkeypatch):
    source = bundle(tmp_path)
    destination = tmp_path / "installed"
    import services.registry.skill_import as importer
    real_copy = importer.shutil.copytree

    def fail_on_second(src, dst, *args, **kwargs):
        if Path(dst).name == "pa-law-reference":
            raise OSError("Synthetic copy failure")
        return real_copy(src, dst, *args, **kwargs)

    monkeypatch.setattr(importer.shutil, "copytree", fail_on_second)
    with pytest.raises(OSError, match="Synthetic"):
        import_packages([source], destination)
    assert list(destination.iterdir()) == []
