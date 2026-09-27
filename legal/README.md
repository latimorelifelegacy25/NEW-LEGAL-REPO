# Legal skill integration

The repository is public. Keep source documents, case references, personal information, and skill packages containing them outside Git. Set `LEGAL_SKILLS_ROOT` to an absolute path containing directories named after each skill, each with a `SKILL.md` frontmatter `name` matching that directory.

The `/api/v1/skills` endpoint discovers installed skill metadata at request time. `/api/v1/workflows` lists the litigation stages and identifies which stage skills are present. Neither endpoint executes skill instructions or searches legal sources. `/api/v1/workflows/{workflow_id}/runs` is the pre-existing queue response stub; it does not run a workflow. Do not treat these endpoints as a working legal research or drafting engine.

The five supplied ZIPs include 14 general Legal OS modules and three additional modules (`pa-law-reference`, `accuracy-verification-pass`, `pleading-fact-paragraphs`). Extract those packages into a private skills directory before setting `LEGAL_SKILLS_ROOT`. The Pennsylvania reference package includes large PDF/text sources; review currency and authority before citing them. The accuracy references include personal case and business details and should remain private.

Run `python -m pytest -q` after installing `.[dev]`. Deployment must provision `LEGAL_SKILLS_ROOT` and its content separately; setting the variable alone will leave the registry empty.
