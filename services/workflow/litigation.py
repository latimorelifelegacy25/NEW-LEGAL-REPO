"""Suggested litigation stages and their relevant skill identifiers."""

STAGES = {
    "intake": ("cold-start-interview", "matter-intake", "matter-workspace"),
    "facts": ("pa-litigation-command", "chronology", "pleading-fact-paragraphs", "style-latimore-legal-documents"),
    "evidence": ("chronology", "legal-hold", "pa-law-reference"),
    "pleadings": ("pa-litigation-command", "pleading-fact-paragraphs", "style-latimore-legal-documents", "pa-law-reference", "claim-chart", "brief-section-drafter", "accuracy-verification-pass"),
    "discovery": ("pa-litigation-command", "style-latimore-legal-documents", "pa-law-reference", "subpoena-triage", "privilege-log-review", "deposition-prep", "accuracy-verification-pass"),
    "motions": ("pa-litigation-command", "style-latimore-legal-documents", "brief-section-drafter", "pa-law-reference", "accuracy-verification-pass"),
    "hearing_trial": ("deposition-prep", "matter-briefing"),
    "archive": ("matter-update", "matter-workspace"),
}


def litigation_stages(available: set[str]) -> list[dict]:
    return [{"stage": stage, "skills": list(skills), "available_skills": [s for s in skills if s in available]}
            for stage, skills in STAGES.items()]
