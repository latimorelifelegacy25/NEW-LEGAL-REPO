# Private skill package integration

Import the supplied archives into private storage outside this checkout:

```bash
python scripts/import_legal_skills.py --destination /absolute/private/skills /absolute/path/package.zip
export LEGAL_SKILLS_ROOT=/absolute/private/skills
```

Pass multiple ZIP paths to import a complete batch. Both `skills/<name>/SKILL.md`
and `<name>/SKILL.md` layouts are supported. The importer preserves package files,
validates paths and frontmatter names before copying, rejects symlinks and duplicate
packages, and never overwrites an installed directory. It does not execute package
scripts. Keep the destination private and backed up separately. Copy failures can
leave a partial installation; inspect the destination before retrying.

Legal stages now identify PA Litigation Command, Pleading Fact Paragraphs,
Legal Document Style, PA Law Reference, and Accuracy Verification as appropriate.
Lead Research can be discovered but is deliberately excluded from litigation stages.
Stage metadata does not execute instructions, perform legal research, or enforce
instruction precedence. Runtime deployment must provision these files separately.

## Review findings still requiring package revisions

- Preserve user instructions over package defaults, including asking for a missing
  starting paragraph number and preserving exact quotations.
- Reconcile historical case profiles against the selected operative source. Never
  use an older count structure merely because it appears in a cached profile.
- Reconcile business branding against current user instructions.
- Treat legal corpora as dated snapshots, not current law. The supplied civil-rule
  text covers Chapter 200 rather than all service and discovery rules.
- The PA Law Reference lookup does not support `Rule` headings through its section
  matcher; its supplied Rule 204.1 lookup fails.
- The Litigation Command audit can miss gaps and duplicates in ordinary numbered
  text. DOCX numbering reconstruction also requires separate verification.
- The five full legal texts are duplicated byte for byte across the two legal
  reference packages. Preserve provenance before any future consolidation.

These are review findings, not corrections performed by the importer. Original
archives and imported instructions remain unchanged. Do not describe an imported
package as corrected, an executed workflow, or a completed filing review.
