from dataclasses import dataclass, asdict

@dataclass(frozen=True)
class EditApplicationResult:
    edit_id: str
    status: str
    applied: bool
    reason: str

def filter_approved_edits(edits: list[dict]) -> tuple[list[dict], list[dict]]:
    approved=[]
    results=[]
    for edit in edits:
        status=edit.get("status","pending")
        if status=="approved":
            approved.append(edit)
            results.append(asdict(EditApplicationResult(
                edit_id=str(edit.get("edit_id","")),
                status=status,
                applied=True,
                reason="Approved edit is eligible for export.",
            )))
        else:
            results.append(asdict(EditApplicationResult(
                edit_id=str(edit.get("edit_id","")),
                status=status,
                applied=False,
                reason="Edit was not approved and will not be applied.",
            )))
    return approved, results
