# Legal OS local matter workspace

The repository's Vercel build serves this browser-only workspace at `/app/` through the FastAPI project. The hosted legal API routes require a separate owner token; the workspace does not call them.

`npm ci && npm run lint && npm run build` builds a static React application in `dist/`. `npm run dev` serves it locally. Its current entrypoint uses browser IndexedDB with a passphrase-derived AES-GCM key to retain uploaded source bytes, hashes, extracted text, and working edits on one device. No case material is sent to the older Express, Firebase, or Python services by this entrypoint. Download an encrypted backup after edits and keep it outside the browser with the passphrase stored separately. Restore is available only in a browser without an existing vault. Clearing site data without a backup or losing the passphrase can destroy access.

Upload a DOCX/TXT/Markdown complaint and labeled exhibits. PDF exhibits are preserved but their text is not extracted. DOCX Word list numbers are reconstructed in source order; list items can include indexes and material outside the complaint. Review the original before choosing an explicit source-item export range. The exported DOCX is an editable working draft, not a verified or filing-ready pleading. Structural checks cover numbering and whether referenced exhibits are loaded; facts, quotations, exhibit alignment, and legal authorities require source review.

The older `App.tsx`, Express server, and Firebase files are historical prototype source and are excluded from the static entrypoint/build. The Python API at the repository root is separate. Do not commit case files or deploy the old unauthenticated server for confidential matters.
