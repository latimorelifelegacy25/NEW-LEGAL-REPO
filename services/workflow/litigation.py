"""Suggested litigation stages and their relevant skill identifiers."""

STAGES = {
    "intake": ("cold-start-interview", "matter-intake", "matter-workspace"),
    "facts": ("chronology", "pleading-fact-paragraphs"),
    "evidence": ("chronology", "legal-hold", "pa-law-reference"),
    "pleadings": ("claim-chart", "brief-section-drafter", "accuracy-verification-pass"),
    "discovery": ("subpoena-triage", "privilege-log-review", "deposition-prep"),
    "motions": ("brief-section-drafter", "pa-law-reference", "accuracy-verification-pass"),
    "hearing_trial": ("deposition-prep", "matter-briefing"),
    "archive": ("matter-update", "matter-workspace"),
}


def litigation_stages(available: set[str]) -> list[dict]:
    return [{"stage": stage, "skills": list(skills), "available_skills": [s for s in skills if s in available]}
            for stage, skills in STAGES.items()]
