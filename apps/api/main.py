from fastapi import FastAPI
from apps.api.routes import approvals, audit, imports, knowledge, matters, skills, workflows
from services.models.gateway import ModelGateway
from services.registry import verify_catalog

app = FastAPI(title="Latimore Legal OS API", version="0.2.0")
app.include_router(imports.router, prefix="/api/v1/imports", tags=["imports"])
app.include_router(skills.router, prefix="/api/v1/skills", tags=["skills"])
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
app.include_router(knowledge.router, prefix="/api/v1/knowledge", tags=["knowledge"])
app.include_router(matters.router, prefix="/api/v1/matters", tags=["matters"])
app.include_router(approvals.router, prefix="/api/v1/approvals", tags=["approvals"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["audit"])

@app.get("/")
def root() -> dict:
    return {
        "name": "Latimore Legal OS API",
        "version": "0.2.0",
        "health": "/health",
        "docs": "/docs",
        "skills": "/api/v1/skills",
        "matters": "/api/v1/matters",
        "workflows": "/api/v1/workflows",
    }

@app.get("/health")
def health() -> dict:
    verification = verify_catalog()
    return {
        "status": "ok" if verification["status"] == "pass" else "degraded",
        "skill_catalog": verification,
        "configured_model_providers": ModelGateway().configured_providers(),
    }
