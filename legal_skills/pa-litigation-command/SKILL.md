---
name: pa-litigation-command
description: Draft, revise, organize, research, and perform pre-filing accuracy review for Pennsylvania civil, custody, dependency, and related pro se litigation. Use for pleadings, motions, briefs, discovery, factual averments, exhibit mapping, service or deadline analysis, citation verification, and final filing checks, especially matters S-1214-2026, S-617-2025, and CP-54-DP-0000045/46-2025. Do not use for nonlegal business or insurance review.
---

# PA Litigation Command

Handle Pennsylvania litigation work as one source-grounded workflow. Preserve the user's evidence, separate fact from inference and law, verify authority before relying on it, and finish with a filing-readiness audit.

## Controlling principles

1. Read the complete source document and all supplied evidence before drafting or judging it.
2. Treat current official law and the actual case record as controlling. Bundled legal texts are dated offline fallbacks, not proof that a rule or statute remains current.
3. Never invent a date, time, quotation, exhibit number, service date, docket event, holding, deadline, or document content.
4. State what the record supports. Use `documented`, `disclosed`, `admitted`, or `the record shows` when accurate. Reserve `alleged` for genuinely unverified accusations, procedural necessity, or accusations against Plaintiff.
5. Distinguish three layers in analysis and drafting:
   - record fact;
   - reasonable inference, expressly identified as an inference; and
   - legal rule or conclusion, supported by verified authority.
6. Do not file, serve, send, upload to an external legal platform, or communicate with another person unless the user expressly requests that action.
7. If the requested work is clear, complete it end to end without unnecessary check-ins. Ask only when a missing fact would materially change the filing or create an unsafe false statement.

## Route the task

### Draft or revise a Pennsylvania filing

Read [core-pa-rules.md](references/core-pa-rules.md). For an identified active matter, also read [active-matter-profile.md](references/active-matter-profile.md). Then:

1. Confirm the caption, docket, court/division, parties, requested relief, procedural posture, and document being answered or enforced.
2. Build factual averments from the evidence under [evidence-to-averments.md](references/evidence-to-averments.md).
3. Separate each cause of action or alternative theory into the structure required by Rule 1020.
4. Connect every element to numbered facts and identified writings. Do not substitute labels such as `negligent`, `reckless`, or `bad faith` for supporting facts.
5. Verify each Pennsylvania rule, statute, case, quotation, deadline calculation, and procedural proposition under [authority-verification.md](references/authority-verification.md).
6. Include the applicable signature, verification, certificate, proposed order, notice, and local-rule components only when the filing type requires them.
7. Run the pre-filing review in [filing-accuracy-pass.md](references/filing-accuracy-pass.md).

### Convert evidence into numbered factual paragraphs

Read [evidence-to-averments.md](references/evidence-to-averments.md) and follow it exactly. Keep argument, duty, breach, causation, damages, and case law out of a pure factual-averment section unless the existing pleading structure specifically requires an allegation there.

### Research or verify Pennsylvania authority

Read [authority-verification.md](references/authority-verification.md). Use `scripts/lookup.py` only for the bundled offline snapshots. A successful offline match does not replace a current official-source check for filing work.

### Audit a filing before submission

Read [filing-accuracy-pass.md](references/filing-accuracy-pass.md). If a PDF is supplied, inspect both extracted text and rendered pages. Run `scripts/audit_pleading.py` as a deterministic first pass, then complete the legal and evidentiary review manually.

### Organize a matter or answer from a document set

Read [matter-workflow.md](references/matter-workflow.md). Keep work grounded in the selected matter and cite the exact document, exhibit, page, paragraph, or docket entry. Do not depend on a connector that is unavailable in the current environment.

## Required pleading discipline

- Apply Rules 1019, 1020, 1022, and 1024 uniformly; do not wait for the user to restate them.
- Rule 1019 review must ask who, what, when, where, and how, and must identify writings relied upon.
- Rule 1020 review must ensure separate counts and separate demands for relief for distinct causes of action, including alternative theories.
- Rule 1022 review must ensure consecutive numbering and, as far as practicable, one material allegation per paragraph.
- Rule 1024 review must determine whether verification is required and whether the correct signer and language are present.
- Apply Rule 204.1 and applicable Schuylkill County local filing requirements to final formatting.
- Preserve verbatim quotations, including the source's grammar and spelling. Do not silently repair quoted text.
- Repeat the exhibit citation on every paragraph sourced from that exhibit.
- Do not leave unresolved placeholders in a filing-ready document.

## Authority and deadline safeguards

- Verify statutes and statewide rules through official Pennsylvania sources on the date of use when browsing is available.
- Verify case law from the actual opinion, not a headnote, search snippet, secondary summary, or a bundled statute file.
- Record the service event, governing rule, counting method, extensions, court orders, and any competing trigger date before calculating a deadline.
- Do not treat an agreement extending a pleading deadline as extending discovery unless its text or a court order actually does so.
- Do not characterize a matter as admitted, waived, defaulted, moot, or conclusively established without checking the governing authority and the relevant procedural record.

## Output standard

Lead with the usable result. For an audit, group findings as Critical, Moderate, and Minor; identify the exact location, state why it matters, and give the correction. For a draft, provide the complete requested filing section or document, not merely an outline, unless the user asks for an outline.

When a source conflict remains unresolved, preserve both versions, identify their provenance, and mark the point for confirmation. Never choose the version that merely favors the user's position.
