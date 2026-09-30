# DOCX review/export flow

The Legal OS preserves the original source document and creates a new reviewed DOCX.

## Inspect
The DOCX inspect endpoint reads paragraph text and style metadata from a runtime-supplied document.
The source bytes are not committed to GitHub.

## Proposed edits
Edits must identify a document location and remain pending until the user approves or rejects them.

## Export
Only edits with status `approved` are eligible for application.
Rejected and pending edits are never applied.
The export endpoint creates a new `*_REVIEWED.docx` payload and reports each edit decision.

## Preservation boundary
The original document bytes remain unchanged. The exported DOCX is a derived artifact.
Private originals and derived artifacts belong in authenticated private storage, not this public repository.
