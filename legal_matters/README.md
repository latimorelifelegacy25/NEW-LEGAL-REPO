# Legal OS Matter Layer

This directory is the live case-state layer. A matter's `matter.json` is intended to hold the current caption, posture, operative documents, deadlines, discovery status, and source links.

**Precedence:** current source documents and a reconciled matter record control over any cached profile bundled inside a skill. Skill profiles are routing/typo-detection aids only. Do not silently copy a stale count, deadline, service date, or discovery status from a skill snapshot into a filing.

Sensitive dependency or custody material should be marked `restricted` and should not be surfaced into public filing artifacts without an explicit confidentiality review.
