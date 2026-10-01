from fastapi import FastAPI
from apps.api.routes import (
    approvals,
    approvals_legal,
    audit,
    counts,
    docx_export,
    drafting,
    imports,
    knowledge,
    legal_verification,
    matters,
    review_report,
    sac_acceptance,
    research,
    skills,
    workflows,
    workspace,
)

app = FastAPI(title="Unified AI Operating Platform API", version="0.2.0")
app.include_router(imports.router, prefix="/api/v1/imports", tags=["imports"])
app.include_router(skills.router, prefix="/api/v1/skills", tags=["skills"])
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
app.include_router(knowledge.router, prefix="/api/v1/knowledge", tags=["knowledge"])
app.include_router(approvals.router, prefix="/api/v1/approvals", tags=["approvals"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["audit"])

app.include_router(matters.router, prefix="/api/v1/legal/matters", tags=["legal-matters"])
app.include_router(workspace.router, prefix="/api/v1/legal/workspace", tags=["legal-workspace"])
app.include_router(drafting.router, prefix="/api/v1/legal/drafting", tags=["legal-drafting"])
app.include_router(legal_verification.router, prefix="/api/v1/legal/verification", tags=["legal-verification"])
app.include_router(research.router, prefix="/api/v1/legal/research", tags=["legal-research"])
app.include_router(counts.router, prefix="/api/v1/legal/counts", tags=["legal-counts"])
app.include_router(review_report.router, prefix="/api/v1/legal/review-report", tags=["legal-review-report"])
app.include_router(approvals_legal.router, prefix="/api/v1/legal/approvals", tags=["legal-approvals"])
app.include_router(sac_acceptance.router, prefix="/api/v1/legal/sac-acceptance", tags=["legal-sac-acceptance"])
app.include_router(docx_export.router, prefix="/api/v1/legal/docx", tags=["legal-docx"])

@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "Unified AI Operating Platform API",
        "version": "0.2.0",
        "health": "/health",
        "docs": "/docs",
        "legal_workspace": "/api/v1/legal/workspace/S-1214-2026",
    }

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
