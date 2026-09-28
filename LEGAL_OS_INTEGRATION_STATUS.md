# Legal OS repository status — 2026-09-28

The `web/` directory contains the checked-in prototype interface from `Legal_OS_S1214_Integrated_Working_Source.zip`, corrected for demonstrably false upload, verification, and export claims. The root Python API remains a separate service and is not integrated with the web interface.

Verified locally: `npm install`, `npm run lint`, and `npm run build` in `web/`; Python unit/security tests previously passed on the main branch. The web interface can extract DOCX text into browser memory, identify explicitly numbered paragraphs, check duplicates, gaps, and whether referenced exhibits are loaded, and export a working paragraph draft as DOCX. It does not retain original binary files or survive a page refresh.

Remaining before this can be deployed as a private working Legal OS:
1. Owner-controlled authentication and server-side encrypted matter storage; replace the placeholder Firebase config with an owner-controlled project if using Firebase.
2. Connect the web application to the Python API or retire the duplicate server, with authorization on every matter route.
3. Implement and test real archive ingestion and PA source indexing. The web ingestion route returns 501 until then; dashboard data are examples.
4. Add exact source alignment for quotations and exhibits and test with the actual SAC and source documents. Do not infer accuracy from numbering checks alone.
5. Review every authority for currency and provenance before permitting legal-citation verification.
6. Test a private deployment end to end. No live production deployment is claimed.

The original skill packages, source PDFs, private references, SAC and exhibits remain outside this public repository. Set `LEGAL_SKILLS_ROOT` privately for the Python skill metadata endpoint.
