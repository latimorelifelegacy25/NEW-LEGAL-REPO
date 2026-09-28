# Legal OS web prototype

This is the source for the Legal OS interface. It is a prototype, not a deployed or secure matter vault. The matter view reads DOCX, TXT and Markdown into browser memory; it does not retain the original file, and data is lost on refresh. Numbering and missing exhibit checks inspect only text and exhibits loaded in the session. They cannot authenticate quotes or verify legal authorities. Platform dashboards contain demonstration records. Archive ingestion returns HTTP 501 because no real scanner or storage is connected.

## Local build

```sh
npm install
npm run lint
npm run build
```

To run with Firebase features, provision your own Firebase project and replace `firebase-applet-config.json` locally. Do not upload a pleading to a shared demo project. The server's AI routes require a private `GEMINI_API_KEY` and need authentication and access controls before any public deployment. The frontend is not connected to the Python API under the repository root.

The original case-specific package and PA reference PDFs are held outside this public repository. This repository only contains the public application code and an empty case shell. Do not place personal exhibits or source documents in Git history.
