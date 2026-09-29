from fastapi import APIRouter

router = APIRouter()

@router.get("/S-1214-2026")
def workspace() -> dict:
    return {
        "docket": "S-1214-2026",
        "caption": "Latimore v. Assumption BVM School, Diocese of Allentown, and Carol Boyer",
        "modules": [
            "documents",
            "chronology",
            "tasks",
            "drafting",
            "discovery",
            "motions",
            "verification",
            "pa-research",
        ],
        "workflow": [
            "intake",
            "evidence",
            "pleadings",
            "discovery",
            "motions",
            "hearing-preparation",
        ],
        "privacy_boundary": {
            "public_repository": "application code, schemas, tests, non-confidential configuration examples",
            "private_storage": "SAC, exhibits, CYS records, personal reference data, credentials, secrets, generated matter artifacts",
        },
    }
