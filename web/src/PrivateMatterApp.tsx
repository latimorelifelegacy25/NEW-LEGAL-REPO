import { useEffect, useMemo, useState } from 'react';
import { Document as WordDocument, Paragraph as WordParagraph, Packer, TextRun } from 'docx';
import { StoredDocument, VaultData, downloadEncryptedBackup, downloadOriginal, loadVault, readFile, restoreEncryptedBackup, saveVault, vaultExists } from './services/localVault';
import { citedExhibits, reviewQuotes } from './services/quoteReview';

interface NumberedParagraph { number: number; text: string; exhibits: string[] }
interface Finding { kind: string; paragraph: number; detail: string }
const EMPTY: VaultData = { docket: 'S-1214-2026', caption: 'Latimore v. Assumption BVM School, Diocese of Allentown, and Carol Boyer', documents: [], edits: {} };

function paragraphsFrom(text: string): NumberedParagraph[] {
  const chunks = text.replace(/\r\n/g, '\n').split(/\n(?=\s*(?:¶\s*)?\d+[.)]\s+)/);
  return chunks.flatMap(chunk => {
    const match = chunk.trim().match(/^(?:¶\s*)?(\d+)[.)]\s+([\s\S]+)/);
    if (!match) return [];
    return [{ number: Number(match[1]), text: match[2].trim(),
      exhibits: citedExhibits(match[2]) }];
  });
}

function audit(paragraphs: NumberedParagraph[], docs: StoredDocument[]): Finding[] {
  const issues: Finding[] = [];
  const seen = new Set<number>();
  paragraphs.forEach((para, index) => {
    if (seen.has(para.number)) issues.push({ kind: 'Duplicate number', paragraph: para.number, detail: 'Check the original complaint.' });
    if (index && para.number > paragraphs[index - 1].number + 1)
      issues.push({ kind: 'Numbering gap', paragraph: para.number, detail: `Gap after ¶${paragraphs[index - 1].number}.` });
    if (index && para.number < paragraphs[index - 1].number)
      issues.push({ kind: 'Number order', paragraph: para.number, detail: 'Number decreased from the preceding paragraph.' });
    seen.add(para.number);
    for (const exhibit of para.exhibits) {
      if (!docs.some(doc => doc.kind === 'exhibit' && doc.exhibit?.toUpperCase() === exhibit))
        issues.push({ kind: 'Exhibit missing', paragraph: para.number, detail: `Exhibit ${exhibit} is not loaded.` });
    }
  });
  return issues;
}

export default function PrivateMatterApp() {
  const [exists, setExists] = useState<boolean | null>(null);
  const [passphraseInput, setPassphraseInput] = useState('');
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [data, setData] = useState<VaultData>(EMPTY);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  useEffect(() => { vaultExists().then(setExists).catch(() => setMessage('Local storage is unavailable in this browser.')); }, []);
  useEffect(() => {
    if (!passphrase) return;
    setSaving(true);
    const timer = setTimeout(() => {
      saveVault(passphrase, data).then(() => { setSaving(false); setExists(true); })
        .catch(error => { setSaving(false); setMessage(`Save failed: ${String(error)}`); });
    }, 350);
    return () => clearTimeout(timer);
  }, [data, passphrase]);
  const complaint = data.documents.find(doc => doc.kind === 'complaint');
  const parsed = useMemo(() => paragraphsFrom(complaint?.numberedText || complaint?.extractedText || ''), [complaint]);
  const paragraphs = useMemo(() => parsed.map((p, index) => {
    const text = data.edits[String(index)] ?? p.text;
    return { ...p, text, exhibits: citedExhibits(text) };
  }), [parsed, data.edits]);
  const findings = useMemo(() => audit(paragraphs, data.documents), [paragraphs, data.documents]);
  const quoteChecks = useMemo(() => reviewQuotes(paragraphs, data.documents), [paragraphs, data.documents]);
  const active = data.documents.find(doc => doc.id === selected) || complaint;
  const documentText = active?.extractedText || '';

  async function unlock() {
    try {
      if (passphraseInput.length < 12) throw new Error('Enter a passphrase of at least 12 characters.');
      const stored = await loadVault(passphraseInput);
      if (exists && !stored) throw new Error('Vault record unavailable.');
      setData(stored || EMPTY);
      setPassphrase(passphraseInput);
      setPassphraseInput('');
      setMessage(stored ? 'Unlocked local encrypted vault.' : 'Created local encrypted vault. Keep your passphrase and a separate copy of source files.');
    } catch { setMessage('Unable to unlock. Check your passphrase and browser storage.'); }
  }

  async function addFile(file: File, kind: StoredDocument['kind'], exhibit?: string) {
    if (file.size > 20 * 1024 * 1024) { setMessage('Files over 20 MB are not supported in this local vault.'); return; }
    try {
      const source = await readFile(file);
      const doc: StoredDocument = { id: crypto.randomUUID(), name: file.name, kind, exhibit: exhibit?.trim().toUpperCase(),
        mime: file.type, sha256: source.sha256, originalBase64: source.base64, extractedText: source.text,
        numberedText: source.numberedText, countHeadings: source.countHeadings, uploadedAt: new Date().toISOString() };
      setData(prev => ({ ...prev, documents: [...prev.documents.map(existing =>
        kind === 'complaint' && existing.kind === 'complaint' ? { ...existing, kind: 'other' as const } : existing), doc],
        edits: kind === 'complaint' ? {} : prev.edits }));
      if (kind === 'complaint') { setRangeStart(''); setRangeEnd(''); }
      setSelected(doc.id);
      setMessage(source.text ? `Loaded ${file.name}; compare extracted text and reconstructed Word list numbers with the original.` :
        `Preserved ${file.name}; text extraction is unavailable for this format. Download or inspect the original before relying on it.`);
    } catch (error) { setMessage(`Could not read file: ${String(error)}`); }
  }

  async function addExhibits(files: File[]) {
    const loaded: StoredDocument[] = [];
    const skipped: string[] = [];
    for (const file of files) {
      const label = file.name.match(/(?:^|[^a-z0-9])(?:exhibit[\s_-]*)?(P[\s_-]*\d+[A-Z]?)(?=[^a-z0-9]|$)/i)?.[1]?.replace(/[\s_]/g, '-').toUpperCase();
      if (!label || file.size > 20 * 1024 * 1024) { skipped.push(file.name); continue; }
      try {
        const source = await readFile(file);
        loaded.push({ id: crypto.randomUUID(), name: file.name, kind: 'exhibit', exhibit: label,
          mime: file.type, sha256: source.sha256, originalBase64: source.base64, extractedText: source.text,
          numberedText: source.numberedText, countHeadings: source.countHeadings, uploadedAt: new Date().toISOString() });
      } catch { skipped.push(file.name); }
    }
    if (loaded.length) setData(prev => ({ ...prev, documents: [...prev.documents, ...loaded] }));
    setMessage(`Loaded ${loaded.length} labeled exhibits. ${skipped.length} skipped (missing recognizable P-number, over 20 MB, or unreadable): ${skipped.join(', ') || 'none'}. Confirm each label and source text against its original.`);
  }

  async function exportDraft() {
    if (!paragraphs.length) return;
    const start = complaint?.numberedText ? Number(rangeStart) : 1;
    const end = complaint?.numberedText ? Number(rangeEnd) : paragraphs.length;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > paragraphs.length || end < start) {
      setMessage('Set a valid first and last source item after checking the original.'); return;
    }
    const chosen = paragraphs.slice(start - 1, end);
    const word = new WordDocument({ sections: [{ children: [
      new WordParagraph({ children: [new TextRun({ text: `Working source-item draft — ${data.docket}; items ${start}–${end}. Numbering and content require comparison with the original.`, bold: true })] }),
      ...chosen.map(p => new WordParagraph({ text: `${p.number}. ${p.text}` }))
    ] }] });
    const url = URL.createObjectURL(await Packer.toBlob(word));
    const link = document.createElement('a'); link.href = url; link.download = `Working_Paragraph_Draft_${data.docket}.docx`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function exportReview() {
    const rows = [
      `Review report — ${data.docket}. Generated ${new Date().toLocaleString()}. Structural and exact text checks only; facts, context and authorities remain unverified.`,
      `Complaint: ${complaint?.name || 'none'}; SHA-256: ${complaint?.sha256 || 'none'}; numbered source items: ${paragraphs.length}.`,
      ...(complaint?.countHeadings || []).map((heading, index, all) => `Count ${heading.count} — ${heading.title}: source items ${heading.startItem}–${(all[index + 1]?.startItem || paragraphs.length + 1) - 1}.`),
      ...findings.map(item => `¶${item.paragraph} — ${item.kind}: ${item.detail}`),
      ...quoteChecks.map(item => `¶${item.paragraph} — ${item.status}: “${item.quote}” | ${item.sources.join('; ')} | SHA-256 ${item.sourceHashes.join('; ')}`),
    ];
    const word = new WordDocument({ sections: [{ children: rows.map(row => new WordParagraph({ text: row })) }] });
    const url = URL.createObjectURL(await Packer.toBlob(word));
    const link = document.createElement('a'); link.href = url; link.download = `SAC_Source_Review_${data.docket}.docx`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function lock() {
    if (!passphrase) return;
    try {
      setSaving(true);
      await saveVault(passphrase, data);
      setPassphrase(null); setData(EMPTY); setSelected(null);
    } catch (error) { setMessage(`Cannot lock until changes are saved: ${String(error)}`); }
    finally { setSaving(false); }
  }

  if (!passphrase) return <main className="mx-auto mt-16 max-w-lg rounded-xl bg-white p-8 shadow-lg">
    <h1 className="text-3xl font-bold text-slate-800">Latimore Legal OS</h1>
    <p className="mt-3 text-slate-700">{exists ? 'Unlock your encrypted matter on this device.' : 'Create an encrypted matter vault on this device.'}</p>
    <p className="mt-2 text-sm text-slate-600">This vault stays in this browser. Losing the passphrase or clearing browser data can make files unrecoverable. Keep original files separately.</p>
    <label className="mt-6 block text-sm font-bold" htmlFor="vault-password">Passphrase</label>
    <input id="vault-password" className="mt-2 w-full rounded border p-3" type="password" value={passphraseInput} onChange={e => setPassphraseInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && unlock()} />
    <button className="mt-4 rounded bg-slate-800 px-5 py-3 font-bold text-white" onClick={unlock}>{exists ? 'Unlock' : 'Create vault'}</button>
    {exists === false && <label className="mt-6 block text-sm font-semibold">Restore encrypted backup
      <input type="file" accept=".json,application/json" className="mt-2 block w-full" onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return;
        try { await restoreEncryptedBackup(file); setExists(true); setMessage('Encrypted backup restored. Enter its original passphrase to unlock.'); }
        catch (error) { setMessage(`Restore failed: ${String(error)}`); }
        e.currentTarget.value = '';
      }} />
    </label>}
    {message && <p role="alert" className="mt-4 text-amber-800">{message}</p>}
  </main>;

  return <main className="mx-auto max-w-7xl p-4 text-slate-900 md:p-8">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-600 pb-5">
      <div><p className="text-sm font-bold uppercase tracking-widest text-amber-700">Private local workspace</p><h1 className="text-3xl font-bold">Latimore Legal OS</h1><p>{data.caption} · {data.docket}</p></div>
      <div className="flex gap-2"><button className="rounded border border-slate-700 px-4 py-2" onClick={async () => {
        try { await saveVault(passphrase, data); await downloadEncryptedBackup(); setMessage('Encrypted backup downloaded. Keep it and the passphrase separately.'); }
        catch (error) { setMessage(`Backup failed: ${String(error)}`); }
      }}>Download encrypted backup</button><button className="rounded border border-slate-700 px-4 py-2" onClick={lock}>Save and lock</button></div>
    </header>
    <div role="status" className="my-5 rounded border border-amber-400 bg-amber-50 p-3 text-sm">{saving ? 'Saving encrypted changes…' : 'Saved locally on this device.'} Structural checks are limited to loaded material. Legal authorities, dates, and quotations require source review. {message}</div>
    <section className="grid gap-6 lg:grid-cols-[minmax(250px,1fr)_minmax(0,2fr)]">
      <aside className="rounded-xl bg-white p-5 shadow">
        <h2 className="text-xl font-bold">Source documents</h2>
        <label className="mt-4 block text-sm font-semibold">Upload complaint (.docx, .txt, .md)
          <input className="mt-1 block w-full text-sm" type="file" accept=".docx,.txt,.md" onChange={e => { const file = e.target.files?.[0]; if (file) addFile(file, 'complaint'); e.currentTarget.value = ''; }} />
        </label>
        <form className="mt-5 border-t pt-4" onSubmit={e => { e.preventDefault(); const target = e.currentTarget; const file = (target.elements.namedItem('exhibit-file') as HTMLInputElement).files?.[0]; const label = (target.elements.namedItem('exhibit-label') as HTMLInputElement).value; if (file && label) addFile(file, 'exhibit', label); target.reset(); }}>
          <label className="block text-sm font-semibold">Exhibit label<input name="exhibit-label" required placeholder="P-16" className="mt-1 w-full rounded border p-2" /></label>
          <label className="mt-3 block text-sm font-semibold">Exhibit file<input name="exhibit-file" required type="file" accept=".docx,.txt,.md,.pdf" className="mt-1 block w-full text-sm" /></label>
          <button className="mt-3 rounded bg-slate-800 px-4 py-2 font-semibold text-white">Add exhibit</button>
        </form>
        <label className="mt-4 block border-t pt-4 text-sm font-semibold">Add labeled exhibits together (.pdf, .docx, .txt, .md)
          <input type="file" multiple accept=".pdf,.docx,.txt,.md" className="mt-2 block w-full text-sm" onChange={e => { const files = Array.from(e.target.files || []); if (files.length) void addExhibits(files); e.currentTarget.value = ''; }} />
          <span className="mt-1 block font-normal text-slate-600">Filenames must contain P-16 or a similar P-number. Check labels after import.</span>
        </label>
        <ul className="mt-5 space-y-2">{data.documents.map(doc => <li key={doc.id} className="rounded border p-2 text-sm"><button className="font-semibold text-left" onClick={() => setSelected(doc.id)}>{doc.exhibit && `Exhibit ${doc.exhibit} · `}{doc.name}</button><p className="break-all text-xs text-slate-500">SHA-256: {doc.sha256}</p><button className="mt-1 text-amber-800 underline" onClick={() => downloadOriginal(doc)}>Download original</button></li>)}</ul>
      </aside>
      <div className="space-y-6">
        <section className="rounded-xl bg-white p-5 shadow"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Review findings ({findings.length})</h2><div className="flex gap-2"><button disabled={!paragraphs.length} onClick={exportReview} className="rounded border border-amber-700 px-4 py-2 font-bold disabled:opacity-40">Export review report</button><button disabled={!paragraphs.length} onClick={exportDraft} className="rounded bg-amber-600 px-4 py-2 font-bold text-white disabled:opacity-40">Export editable draft</button></div></div>
          {!complaint && <p className="mt-3">Upload your SAC to begin the review.</p>}
          {complaint?.numberedText && <p className="mt-3 text-sm text-amber-800">Word list numbers were reconstructed in source order. This file yielded {parsed.length} list items across the document. Exhibit indexes and other lists may be included. Confirm pleading boundaries and actual numbering against the original before using the exported draft.</p>}
          {complaint?.numberedText && <div className="mt-3 flex flex-wrap gap-3 text-sm"><label>First source item<input aria-label="First source item" type="number" min="1" max={parsed.length} value={rangeStart} onChange={e => setRangeStart(e.target.value)} className="ml-2 w-20 rounded border p-1" /></label><label>Last source item<input aria-label="Last source item" type="number" min="1" max={parsed.length} value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} className="ml-2 w-20 rounded border p-1" /></label></div>}
          {complaint && !parsed.length && <p className="mt-3 text-amber-800">Text extracted, but no explicit paragraph numbers or Word list items were detected. Check the original formatting.</p>}
          <ul className="mt-3 space-y-2">{findings.map((f, i) => <li key={i} className="rounded border-l-4 border-amber-600 bg-amber-50 p-2">¶{f.paragraph}: <strong>{f.kind}</strong> — {f.detail}</li>)}</ul>
          {complaint && parsed.length > 0 && !findings.length && <p className="mt-3">No numbering gaps, duplicates, or missing loaded exhibits detected. Facts and quotations remain unverified.</p>}
          {complaint && <div className="mt-4 border-t pt-3 text-sm"><h3 className="font-bold">Exhibit quotation text checks</h3><p>{quoteChecks.filter(x => x.status === 'matched').length} exact text matches · {quoteChecks.filter(x => x.status === 'not-found').length} not found · {quoteChecks.filter(x => x.status === 'source-unavailable').length} source text unavailable · {quoteChecks.filter(x => x.status === 'no-citation').length} without a paragraph exhibit citation. Checks cover quotations of at least 20 characters. A text match does not establish context or accuracy.</p><ul className="mt-2 max-h-64 space-y-2 overflow-auto">{quoteChecks.filter(x => x.status !== 'matched').map((check, index) => <li key={index} className="rounded bg-amber-50 p-2">¶{check.paragraph}: {check.status === 'not-found' ? 'Text not found' : check.status === 'no-citation' ? 'No exhibit citation in paragraph' : 'Source text unavailable'} — “{check.quote}” · {check.sources.join('; ')}</li>)}</ul></div>}
        </section>
        {!!complaint?.countHeadings?.length && <section className="rounded-xl bg-white p-5 shadow"><h2 className="text-xl font-bold">Counts in the uploaded pleading ({complaint.countHeadings.length})</h2><p className="mt-1 text-sm text-slate-600">Ranges locate numbered source items under each heading. They do not establish which prior facts prove a count.</p><ul className="mt-3 grid gap-2 md:grid-cols-2">{complaint.countHeadings.map((heading, index, all) => <li key={`${heading.count}-${index}`} className="rounded border p-2"><strong>Count {heading.count}</strong> — {heading.title}<span className="block text-sm">Items {heading.startItem}–{(all[index + 1]?.startItem || paragraphs.length + 1) - 1}</span></li>)}</ul></section>}
        <section className="grid gap-4 rounded-xl bg-white p-5 shadow xl:grid-cols-2">
          <div><h2 className="text-lg font-bold">Working paragraphs ({paragraphs.length})</h2><div className="mt-3 max-h-[65vh] space-y-3 overflow-auto">{paragraphs.map((para, index) => <article key={`${para.number}-${index}`} className="rounded border p-3"><strong>¶{para.number}</strong><textarea aria-label={`Paragraph ${para.number}`} className="mt-2 min-h-28 w-full rounded border p-2" value={para.text} onChange={e => setData(prev => ({ ...prev, edits: { ...prev.edits, [String(index)]: e.target.value } }))} />{para.exhibits.map((ex, i) => <button key={i} className="mr-2 text-sm text-amber-800 underline" onClick={() => { const doc = data.documents.find(d => d.kind === 'exhibit' && d.exhibit === ex); if (doc) setSelected(doc.id); }}>{`Exhibit ${ex}`}</button>)}</article>)}</div></div>
          <div><h2 className="text-lg font-bold">Source: {active?.name || 'None selected'}</h2><p className="mt-1 text-xs text-slate-600">Read-only extracted text. Compare it with the downloadable original file.</p><pre className="mt-3 max-h-[65vh] overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-3 font-serif text-sm">{documentText || 'No text extracted for this file format.'}</pre></div>
        </section>
      </div>
    </section>
  </main>;
}
