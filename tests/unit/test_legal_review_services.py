from services.legal.sac_review import review_paragraph_sequence, review_text_fields
from services.legal.count_mapping import build_count_map

def test_sequence_review():
    issues=review_paragraph_sequence([1,2,2,4])
    codes={i.code for i in issues}
    assert "DUPLICATE_PARAGRAPH" in codes
    assert "MISSING_PARAGRAPH" in codes

def test_docket_mismatch():
    issues=review_text_fields(22, "Filed under S-9999-2026. (Exhibit P-16)", "S-1214-2026")
    assert any(i.code=="DOCKET_MISMATCH" for i in issues)

def test_five_counts_always_returned():
    counts=build_count_map({"I":[1,2], "V":[10]})
    assert len(counts)==5
    assert counts[0]["status"]=="mapped"
    assert counts[1]["status"]=="unmapped"
