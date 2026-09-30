from io import BytesIO
from docx import Document

from services.legal.docx_io import apply_approved_edits, read_docx_paragraphs
from services.legal.edit_application import filter_approved_edits

def make_docx() -> bytes:
    doc=Document()
    doc.add_paragraph("Paragraph one.")
    doc.add_paragraph("Paragraph two.")
    out=BytesIO()
    doc.save(out)
    return out.getvalue()

def test_read_docx_paragraphs():
    data=make_docx()
    paras=read_docx_paragraphs(data)
    assert paras[0]["text"]=="Paragraph one."
    assert paras[1]["text"]=="Paragraph two."

def test_only_approved_edits_are_applied():
    data=make_docx()
    edits=[
        {
            "edit_id":"e1",
            "status":"approved",
            "location":"paragraph-index:0",
            "after":"Paragraph one corrected."
        },
        {
            "edit_id":"e2",
            "status":"rejected",
            "location":"paragraph-index:1",
            "after":"This should not appear."
        },
    ]
    approved, decisions=filter_approved_edits(edits)
    result=apply_approved_edits(original_data=data, approved_edits=approved)
    paras=read_docx_paragraphs(result)
    assert paras[0]["text"]=="Paragraph one corrected."
    assert paras[1]["text"]=="Paragraph two."
    assert sum(1 for d in decisions if d["applied"])==1


def test_before_text_conflict_is_rejected():
    import pytest
    data=make_docx()
    edits=[{
        "edit_id":"e-conflict",
        "status":"approved",
        "location":"paragraph-index:0",
        "before":"Stale paragraph text.",
        "after":"Should never be applied.",
    }]
    with pytest.raises(ValueError, match="source text no longer matches"):
        apply_approved_edits(original_data=data, approved_edits=edits)

def test_invalid_paragraph_index_is_rejected():
    import pytest
    data=make_docx()
    edits=[{
        "edit_id":"e-index",
        "status":"approved",
        "location":"paragraph-index:999",
        "before":"Paragraph one.",
        "after":"No.",
    }]
    with pytest.raises(ValueError, match="out of range"):
        apply_approved_edits(original_data=data, approved_edits=edits)
