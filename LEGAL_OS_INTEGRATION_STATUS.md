# Legal OS status — 2026-09-28

The static `web/` entrypoint is a local encrypted matter workspace. It preserves original uploaded files, SHA-256 hashes, extracted text and edits in passphrase-encrypted IndexedDB on one browser/device. The SAC DOCX was inspected locally: Mammoth extracted about 192,000 text characters and 670 Word list items, which include material outside complaint paragraphs. The user must select the verified list-item boundaries for export. PDF exhibits have no text extraction. No SAC or private exhibit is committed to this public repository.

This is a functional local review tool, not a completed legal accuracy verification or a filing-ready complaint. Numbering reconstruction, exhibit presence, and missing/gap checks cannot establish accurate quotations, facts, exhibits, citations, or authority currency. No private cross-device synchronization, recovery, owner login, or deployed static site has been verified. Browser storage can be lost. The older Python API and Express prototype remain separate and should not be offered as authenticated matter services.

Next work: verify exact paragraph boundaries against the original SAC, ingest and align the underlying exhibits and Pennsylvania references, add source-grounded quote/authority review, and verify a private deployment with backup and access controls if cross-device use is desired.
