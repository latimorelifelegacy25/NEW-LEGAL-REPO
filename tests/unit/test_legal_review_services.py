from services.legal.sac_review import review_paragraph_sequence, review_text_fields
from services.legal.count_mapping import derive_count_map

def test_sequence_review():
    issues=review_paragraph_sequence([1,2,2,4])
    codes={i.code for i in issues}
    assert "DUPLICATE_PARAGRAPH" in codes
    assert "MISSING_PARAGRAPH" in codes

def test_docket_mismatch():
    issues=review_text_fields(22,"Filed under S-9999-2026. (Exhibit P-16)","S-1214-2026")
    assert any(i.code=="DOCKET_MISMATCH" for i in issues)

def test_counts_are_derived_from_loaded_pleading():
    headings=[
        {"text":"COUNT I — NEGLIGENCE INCLUDING RECKLESSNESS","start_paragraph":360},
        {"text":"COUNT II — NEGLIGENCE PER SE","start_paragraph":454},
        {"text":"COUNT VII — RACIAL DISCRIMINATION IN CONTRACT ENFORCEMENT UNDER 42 U.S.C. § 1981","start_paragraph":604},
    ]
    counts=derive_count_map(headings,list(range(1,650)))
    assert [x["count"] for x in counts]==["I","II","VII"]
    assert counts[0]["start_paragraph"]==360
    assert counts[1]["title"]=="NEGLIGENCE PER SE"
