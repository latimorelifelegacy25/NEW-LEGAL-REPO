# Filing Accuracy Pass

Read the whole filing and the supporting sources first. Do not audit from snippets alone.

## Critical

Flag defects that could materially change the filing's truth, legal basis, procedural posture, or ability to be used, including:

- wrong party/caption/docket/court;
- invented or materially inaccurate fact/quote/date/exhibit;
- incorrect operative document or relief;
- unverified/miscited rule, statute, case, holding, or deadline;
- stale incorporation range or missing/duplicate numbered paragraphs;
- required verification/signature/proposed order/certificate omitted for the filing type;
- confidential/restricted material exposed without required review;
- a case-specific profile being treated as current despite conflicting source material.

## Moderate

Flag issues that impair clarity, source mapping, local-rule compliance, or litigation usefulness, including bundled allegations, ambiguous exhibit references, internal terminology drift, inconsistent names/titles, unsupported characterizations, formatting irregularities, or unnecessary repetition.

## Minor

Flag grammar, punctuation, capitalization, spacing, typography, and layout defects that do not change the legal substance.

## Mechanical pass

Run `scripts/audit_pleading.py` when the file type is supported. Review its findings manually; it does not decide legal sufficiency.

Check:

- paragraph sequence and duplicates;
- count headings;
- WHEREFORE count;
- incorporation ranges;
- unresolved placeholders;
- component presence;
- cited Pennsylvania rules/statutes.

## Source verification

For every disputed or important factual proposition, identify the exact supporting source. For every authority, use [authority-verification.md](authority-verification.md).

## Visual review

For PDFs, inspect rendered pages for clipping, broken fonts/glyphs, table overflow, orphan headings, page-number/footer problems, blank pages, exhibit separators, signature positioning, and readable captions.

## Reporting

For each finding identify:

1. severity;
2. exact location;
3. current text/problem;
4. why it matters;
5. exact correction or source needed.

Keep the audit trail separate from the clean filing unless redline/track-changes output is specifically requested.
