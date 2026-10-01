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

def test_counts_follow_loaded_headings_without_inventing_missing_counts():
    headings=[
        {"text":"COUNT I — NEGLIGENCE INCLUDING RECKLESSNESS", "start_paragraph":1},
        {"text":"COUNT II — NEGLIGENCE PER SE", "start_paragraph":3},
        {"text":"COUNT III — VICARIOUS LIABILITY", "start_paragraph":4},
        {"text":"COUNT IV — NEGLIGENT TRAINING", "start_paragraph":5},
        {"text":"COUNT V — INTERFERENCE WITH CUSTODIAL RIGHTS", "start_paragraph":6},
        {"text":"COUNT VI — BREACH OF CONTRACT", "start_paragraph":7},
        {"text":"COUNT VII — RACIAL DISCRIMINATION", "start_paragraph":8},
    ]
    counts=build_count_map({}, headings=headings, paragraph_numbers=list(range(1,9)))
    assert [count["count"] for count in counts]==["I","II","III","IV","V","VI","VII"]
    assert counts[0]["mapped_paragraphs"]==[1,2]
    assert counts[-1]["mapped_paragraphs"]==[8]
