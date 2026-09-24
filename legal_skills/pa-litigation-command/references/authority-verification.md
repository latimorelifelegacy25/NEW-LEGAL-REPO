# Pennsylvania Authority Verification

Use current official sources for filing work. The offline law files bundled with this skill are dated snapshots and may be incomplete or superseded.

## Source priority

1. Current official Pennsylvania statute, rule, opinion, docket, or court source.
2. Actual filed/served case record.
3. Official or authoritative secondary source if the primary source is unavailable.
4. Bundled offline snapshots for navigation and cross-checking only.

## Statutes and rules

- Verify exact title, chapter, section/rule number, operative text, amendment status, and effective date.
- Never assume a section number identifies a title. `23 Pa.C.S. § 6311` and `42 Pa.C.S. § 6311` are different statutes.
- The bundled `231 Pa. Code Chapter 200` snapshot is **not** the statewide civil-rules corpus. It does not contain Rules 1019, 1020, 1024, or 4014.
- For statewide civil rules, use the current official Pennsylvania Code chapters for pleading and discovery.

## Cases

For every relied-on decision, record:

- case name;
- court;
- year;
- official or recognized reporter citation;
- pinpoint page/paragraph when available;
- precedential status;
- actual proposition supported;
- later treatment if material.

Read the opinion itself. Do not verify case propositions against statute bundles, headnotes, search snippets, or summaries.

## Deadlines

Before calculating a litigation deadline, identify:

1. triggering event;
2. date/time of the event;
3. service method;
4. governing rule/statute/order;
5. day-counting rule;
6. weekends/holidays implications;
7. any order or agreement changing that specific deadline;
8. any competing trigger date supported by the record.

State competing calculations when the trigger is disputed instead of selecting the favorable one without explanation.

## Offline lookup safeguards

`scripts/lookup.py` uses only the bundled dated snapshots. It selects the longest matching statute/rule block to avoid table-of-contents false positives. A successful match is not a current-law certification.
