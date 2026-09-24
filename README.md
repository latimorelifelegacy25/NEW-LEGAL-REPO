# Latimore Legal OS — Integrated Build 0.2.0

This repository is the operational shell around the Pennsylvania litigation skill stack.
It now contains a functioning local skill registry, matter-state layer, knowledge search,
workflow preparation engine, import safety inspection, persistent approvals/audit state,
and the integrated legal modules.

## Integrated legal stack

- **`pa-litigation-command`** — controlling Pennsylvania substantive/drafting/verification engine.
- **19 litigation-operation modules** — chronology, claim charts, brief sections, deposition prep,
  subpoena triage, matter intake/update/briefing/workspace/close, demand workflows, legal hold,
  privilege-log review, OC status, portfolio status, and configuration/cold-start helpers.
- **`skills-qa`** — unique QA/security module retained from Latimore Legal OS v1.

`legal_skills/registry.json` defines the operating policy. Pennsylvania law/current record controls;
case-specific live matter state overrides cached skill profiles; external actions are denied by default
without explicit user authorization.

## Live matter layer

`legal_matters/<matter-id>/matter.json` stores current matter state. The included `S-1214-2026`
record intentionally seeds stable identity only. Mutable counts, deadlines, discovery posture, and
operative-document status must be reconciled from current source documents before use.

## Functional API

Run:

```bash
cp .env.example .env
python -m pip install -e '.[dev]'
uvicorn apps.api.main:app --reload
```

Key endpoints:

- `GET /health` — registry integrity and configured model providers
- `GET /api/v1/skills` — 21 integrated legal modules
- `GET /api/v1/skills/{id}/bundle` — complete instruction/reference bundle
- `GET/PUT /api/v1/matters/{matter_id}` — live matter state
- `POST /api/v1/knowledge/search` — local source-grounded search
- `POST /api/v1/knowledge/rebuild` — index inventory
- `GET /api/v1/workflows` — orchestration definitions
- `POST /api/v1/workflows/{id}/runs` — prepare a deterministic execution package
- `POST /api/v1/imports/upload` — upload + hash + ZIP path-safety inspection
- `GET/POST /api/v1/approvals` — persistent local approval state
- `GET /api/v1/audit` — persistent append-style application audit events

## Local CLI

```bash
python scripts/legalos.py status
python scripts/legalos.py skills
python scripts/legalos.py matters
python scripts/legalos.py workflows
python scripts/legalos.py index
python scripts/legalos.py search "Rule 4014"
python scripts/legalos.py prepare pa-filing-readiness --matter-id S-1214-2026
```

## Workflow semantics

A prepared workflow is **not represented as completed legal work**. The workflow engine resolves
matter guards, skills, and checks and marks the legal task `not_executed` until an authorized model/runtime
actually performs the source-grounded task. This prevents the system from falsely treating orchestration
as legal analysis.

## Persistence

The API works locally without PostgreSQL through `var/state.json`. PostgreSQL/Supabase remains the
production persistence target. Migration `0012_rls_policies.sql` adds workspace membership policies to
the tables that had RLS enabled in Phase 1.

## Security defaults

- ZIP traversal is rejected/quarantined during import inspection.
- Skill hashes are verified against `legal_skills/registry.json`.
- No integrated skill receives automatic permission to send, file, serve, or upload legal material.
- Model API keys are detected only for routing; possession of a key is **not** treated as authorization
  to transmit legal documents.
- Dependency/custody material should remain `restricted` and be reviewed before public filing use.

## Deployment

The existing Vercel/FastAPI entrypoint remains valid. For durable production writes, configure a database
and object storage rather than relying on ephemeral function storage. Do not commit `.env` or credentials.
