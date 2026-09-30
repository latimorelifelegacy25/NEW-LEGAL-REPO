from services.legal.linking import build_links
from services.legal.private_ingestion import build_private_path
from services.legal.quotes import verify_quote

def test_private_path_never_targets_repo_source_tree():
    p=build_private_path("S-1214-2026","sac-v1","Second Amended Complaint.docx")
    assert str(p).startswith("private/S-1214-2026/")
    assert "Second_Amended_Complaint.docx" in str(p)

def test_paragraph_links_to_registered_exhibit():
    links=build_links(
        [{"number":25,"text":"Plaintiff stated this. (Exhibit P-16)"}],
        {"P-16":"src-p16"},
    )
    assert links[0]["status"]=="linked"
    assert links[0]["source_document_id"]=="src-p16"

def test_missing_exhibit_source_is_flagged():
    links=build_links(
        [{"number":25,"text":"Plaintiff stated this. (Exhibit P-16)"}],
        {},
    )
    assert links[0]["status"]=="missing_source"

def test_quote_exact_match():
    result=verify_quote(
        paragraph_number=25,
        quote="It was our mistake",
        source_document_id="src-1",
        source_text="Campion wrote: It was our mistake.",
    )
    assert result["matched"] is True
    assert result["similarity"] == 1.0


def test_private_path_sanitizes_all_segments():
    from services.legal.private_ingestion import build_private_path
    path=str(build_private_path("../S-1214-2026","../../secret","../source.docx"))
    assert ".." not in path
    assert path.startswith("private")
