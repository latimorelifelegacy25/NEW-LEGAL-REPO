"""Reviewed package corrections, applied only in private installer staging."""

import hashlib
import json
from pathlib import Path
import re


REVISION = "2026-10-16.1"
POLICY = """## Integrated instruction precedence

This section supersedes conflicting legacy instructions below and in referenced
files. Follow the user's current instructions first. For legal work use PA Litigation
Command for coordination, Pleading Fact Paragraphs for factual structure, Legal
Document Style for formatting, PA Law Reference for dated offline lookups, and
Accuracy Verification for final checks. Use current official sources and actual
case documents for legal authority and procedural status. Cached profiles are
historical aids only. Never infer the operative count or paragraph structure from
them. Ask for the starting paragraph number when it cannot be determined from the
supplied document. Preserve exact quotations, names, dates, exhibits, and sections.
Use placeholders only in clearly marked drafts, never as fabricated evidence.
Keep correction history outside a clean final filing. Do not add em dashes to
original prose; preserve them when reproducing verbatim source quotations.
Complete authorized work without redundant approval questions. An instruction to
draft does not authorize sending. Explicit user authorization governs subsequent
external actions. Do not apply business prospecting rules to legal work.

"""
HISTORICAL = """> HISTORICAL SNAPSHOT: Preserve the text below for provenance only. Do not use
> its count structure, paragraph totals, or procedural status as the operative
> record. Read the actual selected pleading and current docket first.

"""
NUMBERING = '''def paragraph_numbers(text: str) -> list[int]:
    # Collect all displayed labels, including gaps, duplicates and non-1 starts.
    # These are candidates: headings and numbered exhibits require human review.
    result: list[int] = []
    for raw in text.splitlines():
        match = re.match(r"^\\s*(\\d{1,4})\\.(?:[\\u200b\\ufeff]|\\s*¶|\\s+)\\s*\\S", raw)
        if match:
            result.append(int(match.group(1)))
    return result


'''


def revise_packages(root: Path) -> dict:
    """Keep originals and before/after hashes with the private installation."""
    audit = root / ".integration"
    changes = []

    def change(path: Path, revised: str, reason: str) -> None:
        original = path.read_bytes()
        replacement = revised.encode("utf-8")
        if original == replacement:
            return
        relative = path.relative_to(root)
        backup = audit / "originals" / relative
        if not backup.exists():
            backup.parent.mkdir(parents=True, exist_ok=True)
            backup.write_bytes(original)
        path.write_bytes(replacement)
        previous = next((entry for entry in changes if entry["path"] == str(relative)), None)
        if previous:
            previous["reason"] += "; " + reason
            previous["after_sha256"] = hashlib.sha256(replacement).hexdigest()
            return
        changes.append({"path": str(relative), "reason": reason,
                        "before_sha256": hashlib.sha256(original).hexdigest(),
                        "after_sha256": hashlib.sha256(replacement).hexdigest()})

    for skill in sorted(root.glob("*/SKILL.md")):
        original = skill.read_text(encoding="utf-8")
        end = re.match(r"\A---\s*\n.*?\n---\s*\n", original, re.S)
        if not end:
            raise ValueError("Invalid skill frontmatter")
        revised = original[:end.end()] + "\n" + POLICY + original[end.end():]
        if skill.parent.name == "pa-litigation-command":
            revised = revised.replace(
                "If the starting number cannot be determined, use a clearly marked working sequence and flag it once; do not interrupt an otherwise complete draft.",
                "If the starting number cannot be determined, ask the user before numbering the final factual paragraphs.")
        change(skill, revised, "Apply explicit shared precedence without deleting source instructions")

    for relative in (
        "accuracy-verification-pass/references/legal-case-reference.md",
        "pa-litigation-command/references/active-matter-profile.md",
    ):
        path = root / relative
        if path.exists():
            change(path, HISTORICAL + path.read_text(), "Label cached case structure as historical")

    path = root / "pa-litigation-command/references/evidence-to-averments.md"
    if path.exists():
        text = path.read_text().replace(
            "If the starting number cannot be determined, use a clearly marked working sequence and flag it once; do not interrupt an otherwise complete draft.",
            "If the starting number cannot be determined, ask the user before numbering the final factual paragraphs.")
        text = text.replace("addresses if relevant", "sender and recipient email addresses when supplied")
        change(path, text, "Align numbering and email metadata with the factual-paragraph rules")

    path = root / "latimore-lead-research/references/shared-rules.md"
    if path.exists():
        text = path.read_text().replace("Navy #000835", "Navy #2C3E50").replace(
            "Domain: latimorelegacy.com only (never latimorelifeandlegacy.com).",
            "Public website: www.latimorelifelegacy.com. Card hub: card.latimorelifelegacy.com. Preserve the email domain supplied by the user.")
        text = text.replace("These rules apply to every Latimore agent task.", "These rules apply to Latimore business prospecting tasks.")
        text = text.replace("Never send, post, publish, or schedule anything. Produce drafts only, each labeled at the top:",
                            "By default produce drafts only. Send, post, publish, or schedule only when the user explicitly authorizes that action. Label unapproved drafts at the top:")
        text = text.replace("Jackson reviews and performs every external action.",
                            "Jackson controls external actions through explicit authorization.")
        change(path, text, "Reconcile established branding and explicit user authorization")

    path = root / "pa-law-reference/SKILL.md"
    if path.exists():
        text = path.read_text().replace("correct, current statutory/rule language", "correct snapshot statutory/rule language, with current official-source verification")
        text = text.replace("Service of process, reinstatement of complaints, filing format, discovery mechanics", "Chapter 200 business-of-courts rules, including filing format; full service and discovery rules are not bundled")
        text = text.replace("Everything else search first in these five files.", "Other missing sources include the full service, pleadings, and discovery rules, local rules, and appellate opinions. Use current official sources for these gaps.")
        text = text.replace("which is NOT bundled here", "whose relevant Chapters 53 and 63 are NOT bundled here")
        text = text.replace("--section 6311 --file chapter-63", "--rule 204.1 --file pa-code-rules")
        text = text.replace('e.g., "42 Pa.C.S. § 6311(b)(2)"', 'e.g., "Pa.R.C.P. 204.1"')
        text = text.replace("Service/reinstatement mechanics → `pa-code-rules`", "Service/reinstatement mechanics → current official service rules; not the bundled Chapter 200 snapshot")
        change(path, text, "Correct coverage claims and distinguish current law from offline snapshots")
    path = root / "pa-law-reference/scripts/lookup.py"
    if path.exists():
        change(path, Path(__file__).with_name("pa_snapshot_lookup.py").read_text(), "Support Rule headings, page markers, ambiguity rejection and nonzero failure status")

    path = root / "pa-litigation-command/scripts/audit_pleading.py"
    if path.exists():
        text = path.read_text()
        start = text.index("def paragraph_numbers(")
        end = text.index("def sequence_issues(", start)
        text = text[:start] + NUMBERING + text[end:]
        text = text.replace('"Mechanical output does not verify', '"Displayed numbering candidates may include headings and exhibits. DOCX automatic list labels require rendered or numbering.xml review.",\n            "Mechanical output does not verify')
        change(path, text, "Retain numbering gaps, duplicates and non-1 starting labels for audit")
    audit.mkdir(exist_ok=True)
    manifest = {"revision": REVISION, "changes": changes}
    (audit / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest
