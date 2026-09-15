# Unified AI Operating Platform — Phase 1

Assembled Phase 1 foundation based on SPEC-001 through SPEC-003.

Includes FastAPI, PostgreSQL/Supabase migrations, SQLAlchemy base/session setup,
ingestion/hash/safety foundations, registry services, workflow state machine,
tool SDK, permission gateway, knowledge/model foundations, workers, Docker,
bootstrap script, and tests.

Quick start:
1. `cp .env.example .env`
2. `docker compose up -d postgres`
3. `./scripts/bootstrap.sh`
4. `uvicorn apps.api.main:app --reload`

## Deploy to Vercel

The repository is configured for Vercel's native FastAPI framework preset.
Vercel loads `apps.api.main:app` from the `[tool.vercel]` entrypoint in
`pyproject.toml` and deploys the application as one Python Function.

1. Import this GitHub repository into Vercel.
2. Leave the project root set to the repository root.
3. Add the required environment variables from `.env.example` in Vercel.
4. Deploy and verify `/health` returns `{"status":"ok"}`.

Never commit `.env` or production credentials to the repository.
