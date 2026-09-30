# S-1214-2026 runtime import

The actual source document supplied for acceptance testing is:

- `1_SAC_Complaint_Plus_192_Exhibits-1(5).docx`
- docket: `S-1214-2026`
- source type: Second Amended Complaint + exhibit packet
- observed structure during local runtime inspection: 1,228 Word paragraphs, 9 tables, 198 inline shapes

## Privacy rule

The source DOCX itself is intentionally **not committed** to this public repository.

The document is loaded at runtime into the private matter workspace, where the Legal OS may:
1. preserve the original;
2. inspect paragraphs and tables;
3. identify the SAC pleading portion and exhibit packet;
4. create stable source IDs for exhibits;
5. link pleading exhibit citations to those source IDs;
6. run deterministic review checks;
7. propose corrections;
8. apply only approved edits; and
9. export a separate editable reviewed DOCX.

No private case-document bytes belong in GitHub.
