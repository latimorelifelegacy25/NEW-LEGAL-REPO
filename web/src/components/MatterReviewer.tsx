import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Scale,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Search,
  Quote,
  Check,
  RefreshCw,
  Download,
  Copy,
  ChevronRight,
  Filter,
  Eye,
  Info,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { SACParagraph, MatterDocument } from '../types/matter';
import { StatuteItem } from '../types';
import {
  CitationValidator,
  CitationAuditSummary,
  CitationValidationItem
} from '../services/citationValidator';
import { PA_STATUTES } from '../data/paLawData';

interface MatterReviewerProps {
  paragraphs: SACParagraph[];
  documents: MatterDocument[];
  docketNumber: string;
  caption?: string;
  onUpdateParagraph?: (index: number, updatedText: string) => void;
  onApplyFix?: (fixId: string, paragraphNumber: number, correctedText: string) => void;
  onExportDocx?: () => void;
  onClose?: () => void;
}

export const MatterReviewer: React.FC<MatterReviewerProps> = ({
  paragraphs,
  documents,
  docketNumber,
  caption = 'Matter caption pending',
  onUpdateParagraph,
  onApplyFix,
  onExportDocx,
  onClose
}) => {
  // Navigation & selection state
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<number>(0);
  const [rightPaneTab, setRightPaneTab] = useState<'exhibits' | 'statutes'>('exhibits');
  const [selectedExhibitLetter, setSelectedExhibitLetter] = useState<string>('B');
  const [selectedStatuteId, setSelectedStatuteId] = useState<string>('pa-23-5328');
  const [filterMode, setFilterMode] = useState<'ALL' | 'EXHIBITS' | 'STATUTES' | 'WARNINGS'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Exhibit list from matter documents
  const exhibits = useMemo(() => {
    return documents.filter((d) => d.type === 'EXHIBIT' && d.exhibitLetter);
  }, [documents]);

  // Run CitationValidator across all paragraphs
  const auditSummary: CitationAuditSummary = useMemo(() => {
    return CitationValidator.auditParagraphs(paragraphs);
  }, [paragraphs]);

  // Selected paragraph object
  const currentParagraph = paragraphs[selectedParagraphIndex] || paragraphs[0];

  // Update edit text whenever selected paragraph changes
  useEffect(() => {
    if (currentParagraph) {
      setEditText(currentParagraph.text);
      setIsEditing(false);
    }
  }, [selectedParagraphIndex, currentParagraph]);

  // Current active exhibit document
  const activeExhibit = useMemo(() => {
    return exhibits.find((ex) => ex.exhibitLetter === selectedExhibitLetter) || exhibits[0];
  }, [exhibits, selectedExhibitLetter]);

  // Current active statute item
  const activeStatute = useMemo(() => {
    return PA_STATUTES.find((s) => s.id === selectedStatuteId) || PA_STATUTES[0];
  }, [selectedStatuteId]);

  // Filtered paragraphs list
  const filteredParagraphs = useMemo(() => {
    return paragraphs.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText = p.text.toLowerCase().includes(q);
        const matchesNum = p.number.toString().includes(q);
        if (!matchesText && !matchesNum) return false;
      }

      if (filterMode === 'EXHIBITS') {
        return p.citedExhibits && p.citedExhibits.length > 0;
      }
      if (filterMode === 'STATUTES') {
        return p.citedStatutes && p.citedStatutes.length > 0;
      }
      if (filterMode === 'WARNINGS') {
        return auditSummary.results.some(
          (r) => r.paragraphNumber === p.number && (r.status === 'FORMAT_WARNING' || r.status === 'MISSING_CITATION')
        );
      }
      return true;
    });
  }, [paragraphs, filterMode, searchQuery, auditSummary]);

  // Citation validation results for the current paragraph
  const currentParagraphCitationIssues = useMemo(() => {
    if (!currentParagraph) return [];
    return auditSummary.results.filter((r) => r.paragraphNumber === currentParagraph.number);
  }, [currentParagraph, auditSummary]);

  // Jump handlers
  const handleJumpToExhibit = (letter: string) => {
    setSelectedExhibitLetter(letter);
    setRightPaneTab('exhibits');
  };

  const handleJumpToStatute = (statuteId: string) => {
    setSelectedStatuteId(statuteId);
    setRightPaneTab('statutes');
  };

  // 1-Click apply formatted citation
  const handleApplyCitationStandard = (issue: CitationValidationItem) => {
    if (!issue.suggestedCorrection || !onUpdateParagraph) return;
    onUpdateParagraph(selectedParagraphIndex, issue.suggestedCorrection);
    setEditText(issue.suggestedCorrection);
    setSuccessBanner(`Standardized citation in ¶ ${issue.paragraphNumber} to "${issue.recommendedOfficialFormat}".`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleSaveEdit = () => {
    if (!onUpdateParagraph) return;
    onUpdateParagraph(selectedParagraphIndex, editText);
    setIsEditing(false);
    setSuccessBanner(`Updated paragraph ¶ ${currentParagraph.number}.`);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[750px]">
      {/* Top Header & Citation Audit Metrics Bar */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-white tracking-wide flex items-center gap-2">
                  <span>MatterReviewer: Side-by-Side Legal Audit Workbench</span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold border border-amber-500/30">
                    {docketNumber}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-serif-body">
                  Cross-referencing allegations paragraph-by-paragraph against source exhibits and Pennsylvania statutory authority.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onExportDocx && (
              <button
                onClick={onExportDocx}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export SAC (.docx)</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Close Reviewer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Citation Validation Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-4 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Paragraphs</span>
            <span className="text-sm font-bold font-mono text-white">{paragraphs.length}</span>
          </div>

          <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Citations Audited</span>
            <span className="text-sm font-bold font-mono text-amber-400">{auditSummary.totalCitationsFound}</span>
          </div>

          <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">PA Law Verified</span>
            <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {auditSummary.verifiedCount}
            </span>
          </div>

          <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Format Warnings</span>
            <span className="text-sm font-bold font-mono text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {auditSummary.formatWarningCount}
            </span>
          </div>

          <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Missing Citations</span>
            <span className="text-sm font-bold font-mono text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {auditSummary.missingCitationCount}
            </span>
          </div>

          <div className="bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Compliance Score</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {auditSummary.complianceScorePercent}%
            </span>
          </div>
        </div>
      </div>

      {successBanner && (
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 px-5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successBanner}</span>
        </div>
      )}

      {/* Main Two-Pane Auditing Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* LEFT PANE: Numbered Paragraphs Auditing Workspace (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-50/50">
          {/* Filter Bar & Search */}
          <div className="p-3.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { id: 'ALL', label: 'All Allegations' },
                  { id: 'EXHIBITS', label: 'Citing Exhibits' },
                  { id: 'STATUTES', label: 'Citing Statutes' },
                  { id: 'WARNINGS', label: 'Citation Warnings' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                    filterMode === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'WARNINGS' && auditSummary.formatWarningCount + auditSummary.missingCitationCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px]">
                      {auditSummary.formatWarningCount + auditSummary.missingCitationCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ¶ text or number..."
                className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Paragraphs Scrollable List */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[640px]">
            {filteredParagraphs.map((para, idx) => {
              const originalIndex = paragraphs.findIndex((p) => p.number === para.number);
              const isSelected = selectedParagraphIndex === originalIndex;
              const hasCitationIssue = auditSummary.results.some(
                (r) => r.paragraphNumber === para.number && r.status !== 'VERIFIED'
              );

              return (
                <div
                  key={`reviewer-para-${para.number}-${para.section}-${idx}`}
                  onClick={() => setSelectedParagraphIndex(originalIndex)}
                  className={`p-4 rounded-xl border text-xs leading-relaxed transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-400/40 shadow-xs'
                      : hasCitationIssue
                      ? 'bg-amber-50/30 border-amber-300 hover:bg-amber-50/60'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-amber-600 text-white'
                            : hasCitationIssue
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        ¶ {para.number}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {para.section}
                      </span>
                    </div>

                    {/* Interactive Citation & Exhibit Jump Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {para.citedExhibits.map((ex, exIdx) => (
                        <button
                          key={exIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedParagraphIndex(originalIndex);
                            handleJumpToExhibit(ex.exhibitLetter);
                          }}
                          className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 font-mono text-[10px] font-bold border border-blue-300 transition flex items-center gap-1"
                          title={`Jump to Exhibit ${ex.exhibitLetter}`}
                        >
                          <span>[Ex. {ex.exhibitLetter}]</span>
                        </button>
                      ))}

                      {para.citedStatutes.map((stat, statIdx) => {
                        const matched = CitationValidator.findStatute(stat);
                        return (
                          <button
                            key={statIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParagraphIndex(originalIndex);
                              if (matched) handleJumpToStatute(matched.id);
                              else setRightPaneTab('statutes');
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold border border-emerald-300 transition flex items-center gap-1"
                            title={`Inspect ${stat}`}
                          >
                            <span>§ {stat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Allegation Text (or Inline Editor if selected and editing) */}
                  {isSelected && isEditing ? (
                    <div className="space-y-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        className="w-full p-2.5 text-xs font-serif-body border border-amber-400 rounded-lg focus:ring-1 focus:ring-amber-500 bg-white leading-relaxed"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md text-xs shadow-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-800 font-serif-body leading-relaxed">{para.text}</p>
                  )}

                  {/* Inline Citation Anomaly Notice if Present */}
                  {currentParagraphCitationIssues.length > 0 && isSelected && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-amber-200/80">
                      {currentParagraphCitationIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-lg text-[11px] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{issue.status === 'FORMAT_WARNING' ? 'Citation Format Discrepancy' : 'Missing Legal Citation'}</span>
                            </span>
                            <span className="text-[10px] font-mono text-amber-800 bg-white/70 px-1.5 py-0.2 rounded border border-amber-200">
                              Pa.R.A.P. Standard
                            </span>
                          </div>

                          <p className="text-amber-900 leading-relaxed">{issue.formatIssueDescription}</p>

                          {issue.suggestedCorrection && (
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-amber-800">
                                Recommended: <strong className="font-mono text-slate-900">{issue.recommendedOfficialFormat}</strong>
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyCitationStandard(issue);
                                }}
                                className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded font-bold text-[10px] flex items-center gap-1 shadow-2xs"
                              >
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>1-Click Standardize</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action row when selected */}
                  {isSelected && !isEditing && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-serif-body italic">
                        Viewing paragraph {para.number} of {paragraphs.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                        }}
                        className="text-amber-700 hover:text-amber-900 font-semibold underline"
                      >
                        Edit Allegation Text
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Dual Source Inspector (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white">
          {/* Dual Inspector Tabs */}
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRightPaneTab('exhibits')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  rightPaneTab === 'exhibits'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Source Exhibits ({exhibits.length})</span>
              </button>

              <button
                onClick={() => setRightPaneTab('statutes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  rightPaneTab === 'statutes'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>PA Law References</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Auditing ¶ {currentParagraph?.number || 1}
            </span>
          </div>

          {/* TAB 1: SOURCE EXHIBITS INSPECTOR */}
          {rightPaneTab === 'exhibits' && (
            <div className="p-5 flex-1 flex flex-col space-y-4 overflow-y-auto max-h-[640px]">
              {/* Exhibit Letter Selectors */}
              <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-slate-100">
                {exhibits.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExhibitLetter(ex.exhibitLetter || 'A')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedExhibitLetter === ex.exhibitLetter
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>Ex. {ex.exhibitLetter}</span>
                  </button>
                ))}
              </div>

              {activeExhibit ? (
                <div className="space-y-4">
                  {/* Exhibit Metadata */}
                  <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-950">
                        Exhibit {activeExhibit.exhibitLetter}: {activeExhibit.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-200/80 text-blue-900 font-semibold">
                        {activeExhibit.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-800 flex items-center gap-3">
                      <span>Date: {activeExhibit.date}</span>
                      <span>Vault: Private Encrypted</span>
                    </div>
                  </div>

                  {/* Verbatim Exhibit Content */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Verbatim Evidentiary Record:
                    </label>
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed max-h-[340px] overflow-y-auto border border-slate-800 whitespace-pre-wrap selection:bg-amber-500 selection:text-slate-950">
                      {activeExhibit.content}
                    </div>
                  </div>

                  {/* Quotation Alignment Matcher */}
                  {currentParagraph?.citedExhibits.some(
                    (e) => e.exhibitLetter === activeExhibit.exhibitLetter && e.quotedText
                  ) && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                      <span className="font-semibold text-amber-900 flex items-center gap-1">
                        <Quote className="w-3.5 h-3.5 text-amber-600" />
                        Quotation Alignment in Selected ¶ {currentParagraph.number}:
                      </span>
                      <p className="text-slate-800 font-serif-body italic">
                        "{currentParagraph.citedExhibits.find((e) => e.exhibitLetter === activeExhibit.exhibitLetter)?.quotedText}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No exhibit selected. Select an exhibit badge to inspect.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SOURCE PA LEGAL REFERENCE DATABASE (CitationValidator) */}
          {rightPaneTab === 'statutes' && (
            <div className="p-5 flex-1 flex flex-col space-y-4 overflow-y-auto max-h-[640px]">
              {/* Statute Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Governing Pennsylvania Statute:
                </label>
                <select
                  value={selectedStatuteId}
                  onChange={(e) => setSelectedStatuteId(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {PA_STATUTES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.citation} - {s.heading}
                    </option>
                  ))}
                </select>
              </div>

              {activeStatute && (
                <div className="space-y-4">
                  {/* Statute Header Card */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-950 text-sm">
                        {activeStatute.citation}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold uppercase">
                        Verified PA Authority
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs">{activeStatute.heading}</h4>
                    <p className="text-slate-700 font-serif-body leading-relaxed text-[11px]">
                      {activeStatute.summary}
                    </p>
                  </div>

                  {/* Required Legal Elements & Burden of Proof */}
                  {activeStatute.elements && activeStatute.elements.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        Mandatory Legal Elements to Plead:
                      </label>
                      <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        {activeStatute.elements.map((el, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="font-serif-body leading-snug">{el}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verbatim Statute Full Text */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Official Codified Text:
                    </label>
                    <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs leading-relaxed max-h-[220px] overflow-y-auto border border-slate-800 whitespace-pre-wrap selection:bg-amber-500 selection:text-slate-950">
                      {activeStatute.fullText}
                    </div>
                  </div>

                  {/* Statute of Limitations & Grade */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Limitation Period</span>
                      <span className="font-medium text-slate-800">{activeStatute.statuteOfLimitations || '42 Pa.C.S. § 5524 (2 Years)'}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Governing Code</span>
                      <span className="font-medium text-slate-800">{activeStatute.titleName}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
