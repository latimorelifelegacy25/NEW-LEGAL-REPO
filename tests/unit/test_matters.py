from services.matters import get_matter, list_matters

def test_seed_matter_is_non_stale_identity_only():
    matter = get_matter("S-1214-2026")
    assert matter is not None
    assert matter["status"] == "requires_current_record_reconciliation"
    assert matter["operative_document"] is None
    assert matter["deadlines"] == []
    assert any(m["matter_id"] == "S-1214-2026" for m in list_matters())
