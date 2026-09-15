from fastapi import FastAPI
from apps.api.routes import approvals, audit, imports, knowledge, skills, workflows

app = FastAPI(title="Unified AI Operating Platform API", version="0.1.0")
app.include_router(imports.router, prefix="/api/v1/imports", tags=["imports"])
app.include_router(skills.router, prefix="/api/v1/skills", tags=["skills"])
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
app.include_router(knowledge.router, prefix="/api/v1/knowledge", tags=["knowledge"])
app.include_router(approvals.router, prefix="/api/v1/approvals", tags=["approvals"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["audit"])

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
