# Private skill package integration

Import the supplied archives into private storage outside this checkout:

```bash
python scripts/import_legal_skills.py --reviewed --destination /absolute/private/skills /absolute/path/to/six-packages/*.zip
export LEGAL_SKILLS_ROOT=/absolute/private/skills
```

Supply only the six skill archives, not a repository archive. `--reviewed` requires
all six packages and applies the reviewed corrections before installation. Omit
it for an unchanged import. Both `skills/<name>/SKILL.md`
and `<name>/SKILL.md` layouts are supported. The importer preserves package files,
validates paths and frontmatter names before copying, rejects symlinks and duplicate
packages, and never overwrites an installed directory. It does not execute package
scripts. Keep the destination private and backed up separately. Ordinary copy
failures roll back the directories created by the batch; a process crash or power
loss still requires inspecting the destination before retrying.

Legal stages now identify PA Litigation Command, Pleading Fact Paragraphs,
Legal Document Style, PA Law Reference, and Accuracy Verification as appropriate.
Lead Research can be discovered but is deliberately excluded from litigation stages.
Stage metadata does not execute instructions, perform legal research, or enforce
instruction precedence. Runtime deployment must provision these files separately.

## Corrections applied by reviewed integration

- Preserve user instructions over package defaults through a shared precedence
  section in each installed skill, including asking for a missing
  starting paragraph number and preserving exact quotations.
- Label cached case profiles as historical and require the selected operative source. Never
  use an older count structure merely because it appears in a cached profile.
- Correct the business website, card hub, and navy brand value. Keep business
  prospecting instructions separate from legal work.
- Treat legal corpora as dated snapshots, not current law. The supplied civil-rule
  text covers Chapter 200 rather than all service and discovery rules.
- Replace the PA Law Reference lookup with a standalone script supporting Rule
  headings, page markers, explicit failure exit codes, and article ambiguity checks.
- Correct the Litigation Command audit to retain gaps, duplicates, marked labels,
  and sequences starting after 1. DOCX automatic list numbering still requires
  rendered or numbering.xml verification; output notes state that limitation.
- The five full legal texts are duplicated byte for byte across the two legal
  reference packages. Preserve provenance before any future consolidation.

The private `.integration/originals/` directory retains the original bytes of
every changed file. `.integration/manifest.json` records the revision, reasons,
and before/after SHA-256 values. The uploaded archives remain unchanged. These
corrections do not execute a legal workflow or complete a filing review. Existing
installations are never overwritten; use a new private directory, verify it, and
then point `LEGAL_SKILLS_ROOT` at that directory.
