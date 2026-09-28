import React, { useState } from 'react';
import { SavedResearchItem } from '../types';
import {
  Bookmark,
  Trash2,
  Download,
  Copy,
  Check,
  FileText,
  HardDrive,
  ExternalLink,
  Shield,
  Cloud
} from 'lucide-react';

interface SavedResearchModalProps {
  savedItems: SavedResearchItem[];
  onRemoveItem: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onExportToGoogleDoc?: (title: string, content: string) => void;
  onSaveToDrive?: (title: string, content: string) => void;
  isCloudSynced?: boolean;
}

export const SavedResearchModal: React.FC<SavedResearchModalProps> = ({
  savedItems,
  onRemoveItem,
  onUpdateNotes,
  onExportToGoogleDoc,
  onSaveToDrive,
  isCloudSynced = false
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = savedItems.filter(
    (item) => filterType === 'all' || item.type === filterType
  );

  const handleExportMarkdown = () => {
    let md = `# Pennsylvania Legal Research Portfolio & Case Briefcase\n`;
    md += `*Exported on ${new Date().toLocaleString()}*\n\n`;

    savedItems.forEach((item, index) => {
      md += `## ${index + 1}. ${item.title}\n`;
      if (item.citation) md += `**Citation:** ${item.citation}\n`;
      md += `**Category:** ${item.type.toUpperCase()} | **Saved:** ${item.savedAt}\n\n`;
      if (item.notes) md += `**Notes:**\n${item.notes}\n\n`;
      if (typeof item.payload === 'string') {
        md += `\`\`\`text\n${item.payload}\n\`\`\`\n\n`;
      } else if (item.payload?.fullText) {
        md += `\`\`\`text\n${item.payload.fullText}\n\`\`\`\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PA-Legal-Research-Portfolio-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleCopyItem = (item: SavedResearchItem) => {
    let textToCopy = `${item.title}\n`;
    if (item.citation) textToCopy += `Citation: ${item.citation}\n`;
    if (item.notes) textToCopy += `Notes: ${item.notes}\n`;
    if (typeof item.payload === 'string') textToCopy += `\n${item.payload}`;
    else if (item.payload?.fullText) textToCopy += `\n${item.payload.fullText}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getItemContent = (item: SavedResearchItem): string => {
    if (typeof item.payload === 'string') return item.payload;
    if (item.payload?.fullText) return item.payload.fullText;
    if (item.payload?.summary) return item.payload.summary;
    return JSON.stringify(item.payload, null, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-600" />
                Legal Research Briefcase & Cloud Portfolio
              </h1>
              {isCloudSynced ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  Synced with Firestore
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                  Local Offline Storage
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-serif-body mt-0.5">
              Review, annotate, and export saved Pennsylvania statutes, AI legal analyses, drafted pleadings, and Google Workspace records.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {savedItems.length > 0 && onSaveToDrive && (
              <button
                onClick={() => {
                  let fullText = 'PA LEGAL RESEARCH BRIEFCASE EXPORT\n\n';
                  savedItems.forEach((it, idx) => {
                    fullText += `[${idx + 1}] ${it.title}\nCitation: ${it.citation || 'N/A'}\nNotes: ${it.notes || 'None'}\n\n${getItemContent(it)}\n\n---\n\n`;
                  });
                  onSaveToDrive(`PA_Legal_Portfolio_${Date.now()}`, fullText);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                title="Backup full briefcase to Google Drive"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Backup to Drive</span>
              </button>
            )}

            {savedItems.length > 0 && (
              <button
                id="export-research-markdown-btn"
                onClick={handleExportMarkdown}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Markdown</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          {['all', 'statute', 'citation', 'analysis', 'pleading', 'case'].map((type) => (
            <button
              key={type}
              id={`saved-filter-${type}`}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                filterType === type
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'all' ? 'All Items' : `${type}s`} (
              {type === 'all'
                ? savedItems.length
                : savedItems.filter((i) => i.type === type).length}
              )
            </button>
          ))}
        </div>
      </div>

      {/* Item List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Your Research Briefcase is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-serif-body">
            Bookmark sections from the Statutes Explorer, save analyses from the Legal AI Diagnostic, save co-counsel advice, or save pleadings to build your case file.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                      {item.type}
                    </span>
                    {item.citation && (
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {item.citation}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">Saved: {item.savedAt}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                  {onExportToGoogleDoc && (
                    <button
                      onClick={() => onExportToGoogleDoc(item.title, getItemContent(item))}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200 text-xs font-medium flex items-center gap-1 transition"
                      title="Export to Google Docs"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Google Doc</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyItem(item)}
                    className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition"
                    title="Copy to clipboard"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Payload text preview */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {getItemContent(item)}
              </div>

              {/* Editable case notes */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Attorney / Client Notes & Case Reference:
                </label>
                <input
                  type="text"
                  placeholder="Add private note, case file number, or client cross-reference..."
                  value={item.notes || ''}
                  onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif-body"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
