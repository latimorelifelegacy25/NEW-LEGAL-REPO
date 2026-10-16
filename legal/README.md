# Legal skill integration

The repository is public. Keep source documents, case references, personal information, and skill packages containing them outside Git. Set `LEGAL_SKILLS_ROOT` to an absolute path containing directories named after each skill, each with a `SKILL.md` frontmatter `name` matching that directory.

The `/api/v1/skills` endpoint discovers installed skill metadata at request time. `/api/v1/workflows` lists the litigation stages and identifies which stage skills are present. Neither endpoint executes skill instructions or searches legal sources. `/api/v1/workflows/{workflow_id}/runs` is the pre-existing queue response stub; it does not run a workflow. Do not treat these endpoints as a working legal research or drafting engine.

The reviewed six-package bundle consists of `pa-litigation-command`, `style-latimore-legal-documents`, `pleading-fact-paragraphs`, `pa-law-reference`, `accuracy-verification-pass`, and `latimore-lead-research`. Install it using the [reviewed private import](../docs/SKILL_PACKAGE_INTEGRATION.md) before setting `LEGAL_SKILLS_ROOT`. Other general Legal OS modules are optional and are not included in this bundle. Lead Research remains outside litigation stage mappings. The Pennsylvania reference package includes large PDF/text sources; review currency and authority before citing them. The accuracy references include personal case and business details and should remain private.

Run `python -m pytest -q` after installing `.[dev]`. Deployment must provision `LEGAL_SKILLS_ROOT` and its content separately; setting the variable alone will leave the registry empty.
