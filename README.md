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
