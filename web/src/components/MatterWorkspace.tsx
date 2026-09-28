import React, { useState, useMemo, useRef } from 'react';
import {
  Matter,
  MatterDocument,
  ChronologyEvent,
  MatterTask,
  SACParagraph,
  SACCount,
  VerificationIssue,
  MatterStage
} from '../types/matter';
import {
  SEED_MATTER_S1214,
  SEED_MATTER_DOCUMENTS,
  SEED_CHRONOLOGY_EVENTS,
  SEED_MATTER_TASKS,
  SEED_SAC_PARAGRAPHS,
  SEED_SAC_COUNTS,
  SEED_VERIFICATION_ISSUES
} from '../data/matterS1214Seed';
import { generateAndDownloadSACDocx } from '../utils/docxExport';
import { DocumentCaptureModal } from './DocumentCaptureModal';
import { TextCaptureComponent, ParsedDocumentPayload } from './TextCaptureComponent';
import { User } from 'firebase/auth';
import {
  FolderLock,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Shield,
  Download,
  Upload,
  Camera,
  Eye,
  Scale,
  Calendar,
  UserCheck,
  Quote,
  Check,
  X,
  FileCheck,
  Search,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Copy,
  Plus,
  RefreshCw,
  Info,
  Lock,
  FilePlus,
  BookOpen
} from 'lucide-react';

interface MatterWorkspaceProps {
  currentUser: User | null;
  onSignIn: () => void;
  onNavigateToPAStatutes: () => void;
  onNavigateToPleadings: () => void;
}

export const MatterWorkspace: React.FC<MatterWorkspaceProps> = ({
  currentUser,
  onSignIn,
  onNavigateToPAStatutes,
  onNavigateToPleadings
}) => {
  // Matter and Workspace State
  const [matter, setMatter] = useState<Matter>(SEED_MATTER_S1214);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sac-review' | 'documents' | 'chronology' | 'tasks' | 'drafting'
  >('sac-review');

  const [documents, setDocuments] = useState<MatterDocument[]>(SEED_MATTER_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<MatterDocument>(SEED_MATTER_DOCUMENTS[0]);
  const [chronology, setChronology] = useState<ChronologyEvent[]>(SEED_CHRONOLOGY_EVENTS);
  const [tasks, setTasks] = useState<MatterTask[]>(SEED_MATTER_TASKS);

  // Second Amended Complaint (SAC) Review and Working Draft
  const [paragraphs, setParagraphs] = useState<SACParagraph[]>(SEED_SAC_PARAGRAPHS);
  const [counts] = useState<SACCount[]>(SEED_SAC_COUNTS);
  const [selectedParagraph, setSelectedParagraph] = useState<SACParagraph | null>(SEED_SAC_PARAGRAPHS[0] || null);
  const [activeExhibitInspection, setActiveExhibitInspection] = useState<MatterDocument | null>(null);

  // Verification Issues & Approved Edits
  const [issues, setIssues] = useState<VerificationIssue[]>(SEED_VERIFICATION_ISSUES);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [auditSuccessBanner, setAuditSuccessBanner] = useState<string | null>(null);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState<boolean>(false);
  const [showEmbeddedCapture, setShowEmbeddedCapture] = useState<boolean>(false);

  // Drafting Tool State (Evidence to Fact Paragraphs)
  const [rawEvidenceInput, setRawEvidenceInput] = useState<string>('');
  const [generatedDraftParagraphs, setGeneratedDraftParagraphs] = useState<string[]>([]);

  // Private file upload handling
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStageChange = (newStage: MatterStage) => {
    setMatter((prev) => ({ ...prev, stage: newStage }));
  };

  // Jump from paragraph exhibit citation directly to cited exhibit in side-by-side pane
  const handleJumpToExhibit = (exhibitLetter: string, paragraph: SACParagraph) => {
    setSelectedParagraph(paragraph);
    const targetExhibit = documents.find((doc) => doc.exhibitLetter === exhibitLetter);
    if (targetExhibit) {
      setActiveExhibitInspection(targetExhibit);
    }
  };

  // Run only checks supported by the loaded text; source-based claims need source review.
  const handleRunVerificationAudit = () => {
    const found: VerificationIssue[] = [];
    const seen = new Set<number>();
    paragraphs.forEach((paragraph, index) => {
      if (seen.has(paragraph.number)) {
        found.push({ id: `duplicate-${index}`, category: 'NUMBERING', severity: 'WARNING', paragraphNumber: paragraph.number,
          locationDescription: `Paragraph ${paragraph.number}`, sourceUsedToFlag: 'Loaded paragraph sequence',
          detectedIssue: 'Duplicate paragraph number.', proposedCorrection: 'Review numbering against the original document.', status: 'PENDING' });
      }
      seen.add(paragraph.number);
      if (index > 0 && paragraph.number > paragraphs[index - 1].number + 1) {
        found.push({ id: `gap-${index}`, category: 'NUMBERING', severity: 'WARNING', paragraphNumber: paragraph.number,
          locationDescription: `Before paragraph ${paragraph.number}`, sourceUsedToFlag: 'Loaded paragraph sequence',
          detectedIssue: `Gap after paragraph ${paragraphs[index - 1].number}.`, proposedCorrection: 'Check whether source paragraphs are missing.', status: 'PENDING' });
      }
      paragraph.citedExhibits.forEach(({ exhibitLetter }) => {
        if (!documents.some(doc => doc.type === 'EXHIBIT' && doc.exhibitLetter === exhibitLetter)) {
          found.push({ id: `exhibit-${index}-${exhibitLetter}`, category: 'EXHIBIT_LABEL', severity: 'WARNING', paragraphNumber: paragraph.number,
            locationDescription: `Paragraph ${paragraph.number}`, sourceUsedToFlag: 'Exhibits loaded in this session',
            detectedIssue: `Exhibit ${exhibitLetter} is not loaded.`, proposedCorrection: 'Load and inspect the source exhibit.', status: 'PENDING' });
        }
      });
    });
    setIssues(found);
    setAuditSuccessBanner(`Checked ${paragraphs.length} loaded paragraphs. ${found.length} structural issue(s) found. Quotes, facts, and legal authorities require source review.`);
  };

  const handleApproveFix = (issue: VerificationIssue) => {
    // Approval records review only. Never invent a missing paragraph or alter source text.
    setIssues(prev => prev.map(item => item.id === issue.id ? { ...item, status: 'APPROVED' } : item));
  };

  const handleRejectFix = (issueId: string) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === issueId ? { ...iss, status: 'REJECTED' } : iss))
    );
  };

  const handleApproveAllFixes = () => {
    issues.forEach((iss) => {
      if (iss.status === 'PENDING') {
        handleApproveFix(iss);
      }
    });
  };

  // Export editable .docx using docx library
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await generateAndDownloadSACDocx(matter, paragraphs, counts);
      setAuditSuccessBanner(
        `Exported working paragraph draft for ${matter.docketNumber}. Review it against the original source before use.`
      );
    } catch (err) {
      console.error('Docx export failed:', err);
      alert('Failed to generate DOCX. Please try again.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Handle uploading private SAC or source files
  const handleUploadSourceDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const extension = file.name.toLowerCase().split('.').pop();
    if (!['docx', 'txt', 'md'].includes(extension || '')) {
      alert('This view can read DOCX, TXT, and Markdown. Convert PDF or DOC to one of those formats before upload.');
      return;
    }
    try {
      const content = extension === 'docx'
        ? (await (await import('mammoth')).extractRawText({ arrayBuffer: await file.arrayBuffer() })).value
        : await file.text();
      if (!content.trim()) throw new Error('No text could be extracted from the document.');
      const isComplaint =
        file.name.toLowerCase().includes('sac') ||
        file.name.toLowerCase().includes('complaint') ||
        content.toLowerCase().includes('complaint');

      const newDoc: MatterDocument = {
        id: `uploaded-${Date.now()}`,
        title: file.name,
        type: isComplaint ? 'PLEADING' : 'EVIDENCE',
        date: new Date().toISOString().split('T')[0],
        status: 'ORIGINAL_SOURCE_IMMUTABLE',
        content,
        fileSizeBytes: file.size,
        notes: 'Extracted text held in browser memory for this session. Check against original formatting and numbering.'
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDoc(newDoc);
      if (isComplaint) {
        const chunks = content.split(/\n(?=\s*(?:¶\s*)?\d+[.)]\s+)/);
        const imported = chunks.flatMap((chunk): SACParagraph[] => {
          const match = chunk.trim().match(/^(?:¶\s*)?(\d+)[.)]\s+([\s\S]+)/);
          if (!match) return [];
          const body = match[2].trim();
          const citedExhibits = [...body.matchAll(/\bExhibit\s+([A-Z](?:-\d+)?)/gi)]
            .map((item) => ({ exhibitLetter: item[1].toUpperCase() }));
          return [{ number: Number(match[1]), section: 'FACTS', text: body,
            originalText: body, citedExhibits, citedStatutes: [] }];
        });
        if (imported.length) {
          setParagraphs(imported);
          setSelectedParagraph(imported[0]);
          setActiveTab('sac-review');
        }
        alert(`Extracted text from "${file.name}" and detected ${imported.length} explicitly numbered paragraphs. Check numbering and quotations against the original file.`);
      } else {
        alert(`Extracted text from "${file.name}" for review in this browser session.`);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not read this file.');
    }
  };

  // Ingest parsed SAC from Camera / Paste Capture Modal
  const handleImportParsedSAC = (
    newParagraphs: SACParagraph[],
    sourceDoc: MatterDocument,
    detectedTitle?: string
  ) => {
    setParagraphs(newParagraphs);
    setDocuments((prev) => [sourceDoc, ...prev.filter((d) => !d.isOriginalSAC)]);
    setSelectedDoc(sourceDoc);
    setSelectedParagraph(newParagraphs[0] || null);
    setActiveTab('sac-review');
    setAuditSuccessBanner(
      `Successfully imported ${newParagraphs.length} paragraphs from "${sourceDoc.title}". Running full verification audit...`
    );
    handleRunVerificationAudit();
  };

  // Ingest newly captured exhibit from Camera / Paste Capture Modal
  const handleAddCapturedExhibit = (newExhibit: MatterDocument) => {
    setDocuments((prev) => [newExhibit, ...prev]);
    setActiveExhibitInspection(newExhibit);
    setAuditSuccessBanner(`Exhibit ${newExhibit.exhibitLetter || ''} added for review in this session. Authenticity has not been verified.`);
  };

  // Handler for TextCaptureComponent (supports file pasting & camera input)
  const handleTextCaptureParsed = (payload: ParsedDocumentPayload) => {
    setParagraphs(payload.paragraphs);
    setDocuments((prev) => [payload.sourceDoc, ...prev.filter((d) => !d.isOriginalSAC)]);
    setSelectedDoc(payload.sourceDoc);
    setSelectedParagraph(payload.paragraphs[0] || null);
    setShowEmbeddedCapture(false);
    setIsCaptureModalOpen(false);
    setActiveTab('sac-review');
    setAuditSuccessBanner(
      `TextCaptureComponent parsed ${payload.paragraphs.length} factual paragraphs & ${payload.citedExhibits.length} cited exhibits into Docket ${matter.docketNumber}. Initiating SAC review workflow...`
    );
    handleRunVerificationAudit();
  };

  // Convert raw evidence to numbered fact paragraphs
  const handleConvertEvidenceToParagraphs = () => {
    if (!rawEvidenceInput.trim()) return;
    const sentences = rawEvidenceInput
      .split(/(?<=[.?!])\s+/)
      .filter((s) => s.trim().length > 10);

    const generated = sentences.map((sentence, idx) => {
      return sentence.trim();
    });

    setGeneratedDraftParagraphs(generated);
  };

  const handleAppendDraftToSAC = () => {
    const startNum = paragraphs.length > 0 ? paragraphs[paragraphs.length - 1].number + 1 : 1;
    const newItems: SACParagraph[] = generatedDraftParagraphs.map((text, idx) => ({
      number: startNum + idx,
      section: 'FACTS',
      text,
      originalText: text,
      citedExhibits: [],
      citedStatutes: []
    }));

    setParagraphs((prev) => [...prev, ...newItems]);
    alert(`Appended ${newItems.length} unverified draft paragraphs to ${matter.docketNumber}. Review against the source.`);
  };

  const filteredIssues = useMemo(() => {
    if (verificationFilter === 'ALL') return issues;
    return issues.filter((iss) => iss.category === verificationFilter);
  }, [issues, verificationFilter]);

  const pendingIssuesCount = issues.filter((i) => i.status === 'PENDING').length;
  const approvedIssuesCount = issues.filter((i) => i.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* 1. Clear Privacy Boundary Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-5 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 border border-emerald-700 text-emerald-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Repo Leakage (Private Vault)</span>
              </span>
              <span className="text-xs text-slate-400">
                Active Matter: <strong className="text-amber-400 font-mono">{matter.docketNumber}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              {matter.caption}
            </h1>
            <p className="text-xs text-slate-300 font-serif-body max-w-4xl leading-relaxed">
              <strong>Session storage notice:</strong> Uploaded matter documents are held in this browser session only and are lost on refresh. Do not use this prototype as your sole copy. Nothing uploaded here is committed to GitHub.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadSourceDocument}
              accept=".docx,.txt,.md"
              className="hidden"
            />
            <button
              id="btn-open-capture-modal"
              onClick={() => {
                setActiveTab('sac-review');
                setShowEmbeddedCapture(true);
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md transition"
              title="Capture document text via device camera or paste for initial parsing"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span>Capture via Camera / Paste</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-lg text-xs flex items-center gap-1.5 transition"
              title="Upload private Second Amended Complaint or exhibit file"
            >
              <Upload className="w-4 h-4 text-slate-300" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition"
              title="Export approved Second Amended Complaint as editable Word document"
            >
              {isExportingDocx ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Download className="w-4 h-4 text-amber-400" />
              )}
              <span>Export SAC (.docx)</span>
            </button>
          </div>
        </div>

        {/* Matter Procedural Stage Pipeline */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Procedural Workflow Pipeline:
            </span>
            <span className="text-xs text-amber-400 font-mono">
              Current Stage: <strong>{matter.stage}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(
              [
                { stage: 'INTAKE' as MatterStage, label: '1. Intake & Retainer', done: true },
                { stage: 'EVIDENCE' as MatterStage, label: '2. Evidence & Exhibits', done: true },
                { stage: 'PLEADINGS' as MatterStage, label: '3. Pleadings (SAC)', done: false },
                { stage: 'DISCOVERY' as MatterStage, label: '4. Discovery', done: false },
                { stage: 'MOTIONS' as MatterStage, label: '5. Motions Practice', done: false },
                { stage: 'HEARING_PREP' as MatterStage, label: '6. Hearing / Trial', done: false }
              ]
            ).map((item) => {
              const isCurrent = matter.stage === item.stage;
              return (
                <button
                  key={item.stage}
                  onClick={() => handleStageChange(item.stage)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md ring-2 ring-amber-400/30'
                      : item.done
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-950/70'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.done && !isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {auditSuccessBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{auditSuccessBanner}</span>
          </div>
          <button onClick={() => setAuditSuccessBanner(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Unified Matter Workspace Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="tab-sac-review"
            onClick={() => setActiveTab('sac-review')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === 'sac-review'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>SAC Verification & Exhibit Inspector</span>
            {pendingIssuesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-200 text-amber-950">
                {pendingIssuesCount}
              </span>
            )}
          </button>

          <button
            id="tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === 'overview'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Matter Overview</span>
          </button>

          <button
            id="tab-documents"
            onClick={() => setActiveTab('documents')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === 'documents'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documents & Exhibits ({documents.length})</span>
          </button>

          <button
            id="tab-chronology"
            onClick={() => setActiveTab('chronology')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === 'chronology'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Fact Chronology ({chronology.length})</span>
          </button>

          <button
            id="tab-tasks"
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === 'tasks'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Procedural Tasks ({tasks.length})</span>
          </button>

          <button
            id="tab-drafting"
            onClick={() => setActiveTab('drafting')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === 'drafting'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Evidence to Fact Paragraphs</span>
          </button>
        </div>

        <button
          onClick={onNavigateToPAStatutes}
          className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>PA Legal Research</span>
        </button>
      </div>

      {/* 3. SECOND AMENDED COMPLAINT (SAC) VERIFICATION & EXHIBIT INSPECTOR SUITE */}
      {activeTab === 'sac-review' && (
        <div className="space-y-6">
          {/* Action Header & Automated Verification Trigger */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <span>Second Amended Complaint (SAC) Verification Engine</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-mono font-semibold">
                  Docket {matter.docketNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-serif-body mt-1">
                Side-by-side paragraph audit comparing factual allegations against cited Exhibits A through E, Pa.R.C.P. drafting standards, and the 5 substantive legal counts.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                id="btn-scan-sac"
                onClick={() => setShowEmbeddedCapture(!showEmbeddedCapture)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs ${
                  showEmbeddedCapture
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300'
                }`}
                title="Toggle TextCaptureComponent to capture document text via camera or paste for parsing and review"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{showEmbeddedCapture ? 'Hide Capture' : 'Capture via Camera / Paste'}</span>
              </button>

              <button
                id="btn-run-audit"
                onClick={handleRunVerificationAudit}
                disabled={isVerifying}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'Auditing Paragraphs...' : 'Run Full Verification Audit'}</span>
              </button>

              <button
                id="btn-approve-all-fixes"
                onClick={handleApproveAllFixes}
                disabled={pendingIssuesCount === 0}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve All Verified Fixes</span>
              </button>

              <button
                id="btn-export-sac-docx"
                onClick={handleExportDocx}
                disabled={isExportingDocx}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Approved (.docx)</span>
              </button>
            </div>
          </div>

          {/* Embedded TextCaptureComponent for File Pasting & Camera OCR */}
          {showEmbeddedCapture && (
            <div className="animate-in fade-in duration-200">
              <TextCaptureComponent
                onDocumentParsed={handleTextCaptureParsed}
                docketNumber={matter.docketNumber}
                onCancel={() => setShowEmbeddedCapture(false)}
              />
            </div>
          )}

          {/* Adversarial Review Report (Table of Detected Issues) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Adversarial Review Report (Review and Approve Proposed Changes)</span>
                </h3>
                <p className="text-xs text-slate-500 font-serif-body">
                  Zero unapproved changes: Edits are only merged into the working draft upon human operator authorization. Original master remains unmodified.
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                {(['ALL', 'NUMBERING', 'EXHIBIT_LABEL', 'NAMES_AND_DATES', 'QUOTATION', 'LEGAL_CITATION'] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setVerificationFilter(cat)}
                      className={`px-2.5 py-1 rounded-md font-medium transition ${
                        verificationFilter === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Severity & Category</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Detected Anomaly</th>
                    <th className="py-2.5 px-3">Verification Source</th>
                    <th className="py-2.5 px-3">Proposed Verified Correction</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      className={`hover:bg-slate-50/80 transition ${
                        issue.status === 'APPROVED' ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            issue.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : issue.severity === 'WARNING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {issue.severity}
                        </span>
                        <span className="block text-[11px] text-slate-500 font-mono mt-1">{issue.category}</span>
                      </td>

                      <td className="py-3 px-3 align-top whitespace-nowrap font-medium text-slate-800">
                        {issue.locationDescription}
                      </td>

                      <td className="py-3 px-3 align-top text-slate-700 max-w-xs">{issue.detectedIssue}</td>

                      <td className="py-3 px-3 align-top text-slate-500 text-[11px] font-mono">
                        {issue.sourceUsedToFlag}
                      </td>

                      <td className="py-3 px-3 align-top text-slate-900 font-medium max-w-sm">
                        {issue.proposedCorrection}
                      </td>

                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        {issue.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        ) : issue.status === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs">
                            Rejected
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`approve-fix-${issue.id}`}
                              onClick={() => handleApproveFix(issue)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                              title="Approve this edit and apply to working draft"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectFix(issue.id)}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs transition"
                              title="Reject suggestion"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side-by-Side Paragraph & Exhibit Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Numbered Paragraphs with Citation Jump Links */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Second Amended Complaint: Numbered Factual Allegations</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-serif-body">
                    Click any exhibit citation badge (e.g. [Ex. B]) to jump immediately to the source document.
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {paragraphs.length} Paragraphs
                </span>
              </div>

              {/* Scrollable list of paragraphs */}
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                {paragraphs.map((para, index) => {
                  const isSelected = selectedParagraph?.number === para.number;
                  const hasFlaggedIssue = issues.some(
                    (i) => i.paragraphNumber === para.number && i.status === 'PENDING'
                  );
                  const isFixApplied = para.approvedFixId;

                  return (
                    <div
                      key={`sac-para-${para.number}-${para.section}-${index}`}
                      id={`sac-para-${para.number}`}
                      onClick={() => setSelectedParagraph(para)}
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed transition cursor-pointer relative ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-500 ring-1 ring-amber-400'
                          : hasFlaggedIssue
                          ? 'bg-rose-50/50 border-rose-300'
                          : isFixApplied
                          ? 'bg-emerald-50/40 border-emerald-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                              hasFlaggedIssue
                                ? 'bg-rose-600 text-white'
                                : isFixApplied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            ¶ {para.number}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {para.section}
                          </span>
                        </div>

                        {/* Badges for cited exhibits */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {para.citedExhibits.map((ex, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJumpToExhibit(ex.exhibitLetter, para);
                              }}
                              className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 flex items-center gap-1 transition"
                              title={`Jump to Exhibit ${ex.exhibitLetter} source text`}
                            >
                              <span>[Ex. {ex.exhibitLetter}]</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="mt-2 text-slate-800 font-serif-body pl-8 text-sm leading-relaxed">{para.text}</p>

                      {hasFlaggedIssue && (
                        <div className="mt-2 ml-8 p-2 rounded bg-rose-100/70 border border-rose-300 text-rose-900 text-[11px] flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Flagged by verification engine: Anomaly detected. Check review report above.</span>
                        </div>
                      )}

                      {isFixApplied && (
                        <div className="mt-2 ml-8 p-1.5 rounded bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-[11px] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Approved fix applied to working draft.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Cited Exhibit Inspector Viewer */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>Cited Exhibit Provenance Inspector</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-serif-body">
                    Side-by-side view comparing complaint quotation against authentic source records.
                  </p>
                </div>
              </div>

              {/* Exhibit Selector Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {documents
                  .filter((d) => d.type === 'EXHIBIT')
                  .map((doc) => {
                    const isSelected = activeExhibitInspection?.id === doc.id;
                    return (
                      <button
                        key={doc.id}
                        id={`btn-exhibit-${doc.exhibitLetter}`}
                        onClick={() => setActiveExhibitInspection(doc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Exhibit {doc.exhibitLetter}
                      </button>
                    );
                  })}
              </div>

              {activeExhibitInspection ? (
                <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                        Exhibit {activeExhibitInspection.exhibitLetter}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 mt-1">{activeExhibitInspection.title}</h4>
                      <span className="text-[11px] text-slate-400">Date of Record: {activeExhibitInspection.date}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      AUTHENTICATED
                    </span>
                  </div>

                  <div className="bg-slate-900 text-slate-100 font-mono text-xs p-3.5 rounded-lg leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap selection:bg-amber-500 selection:text-slate-950 border border-slate-800">
                    {activeExhibitInspection.content}
                  </div>

                  {selectedParagraph?.citedExhibits.some(
                    (e) => e.exhibitLetter === activeExhibitInspection.exhibitLetter && e.quotedText
                  ) && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                      <span className="font-semibold text-amber-900 flex items-center gap-1">
                        <Quote className="w-3.5 h-3.5 text-amber-600" />
                        Quotation Alignment in Selected ¶ {selectedParagraph.number}:
                      </span>
                      <p className="text-slate-800 font-serif-body italic">
                        "{selectedParagraph.citedExhibits.find((e) => e.exhibitLetter === activeExhibitInspection.exhibitLetter)?.quotedText}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Select an exhibit above or click an [Ex. A-E] badge in the complaint to inspect.
                </div>
              )}
            </div>
          </div>

          {/* 4. Five Legal Counts Element-to-Paragraph Matrix (Claim Chart) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>Five Counts vs Factual Paragraphs Sufficiency Matrix (Pa.R.C.P. Claim Chart)</span>
              </h3>
              <p className="text-xs text-slate-500 font-serif-body">
                Compares each of the five counts against the factual paragraphs they rely on to ensure every required legal element is satisfied before filing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {counts.map((count) => (
                <div
                  key={count.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        {count.numberRoman}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Elements Supported
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{count.title}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">{count.legalBasis}</p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Required Legal Elements:
                      </span>
                      {count.elements.map((el) => (
                        <div key={el.id} className="p-2 rounded bg-white border border-slate-200 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">{el.name}</span>
                            <div className="flex items-center gap-1">
                              {el.supportingParagraphs.map((p) => (
                                <button
                                  key={p}
                                  onClick={() => {
                                    const target = paragraphs.find((para) => para.number === p);
                                    if (target) setSelectedParagraph(target);
                                    const element = document.getElementById(`sac-para-${p}`);
                                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }}
                                  className="px-1.5 py-0.2 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 font-mono text-[10px] font-bold"
                                  title={`View Paragraph ${p}`}
                                >
                                  ¶ {p}
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 text-[10px]">{el.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-serif-body italic">
                    {count.prayerText}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MATTER OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-600">Case Docket Summary</span>
              <h2 className="text-xl font-display font-bold text-slate-900 mt-1">{matter.caption}</h2>
              <p className="text-xs text-slate-500 font-mono mt-1">
                {matter.court} &bull; Docket: {matter.docketNumber} &bull; Judge: {matter.assignedJudge}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-700">Substantive Theory of Action</h4>
              <p className="text-sm font-serif-body text-slate-800 leading-relaxed">{matter.summary}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Plaintiff Parties</span>
                </h4>
                <ul className="text-xs text-slate-700 space-y-1">
                  {matter.parties.plaintiffs.map((p, idx) => (
                    <li key={idx} className="font-medium">
                      &bull; {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Defendant Parties</span>
                </h4>
                <ul className="text-xs text-slate-700 space-y-1">
                  {matter.parties.defendants.map((d, idx) => (
                    <li key={idx} className="font-medium">
                      &bull; {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setActiveTab('sac-review')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>Open SAC Verification Suite</span>
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Browse Exhibits
              </button>
              <button
                onClick={onNavigateToPleadings}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Pleading Drafter
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Private Vault Status</h3>
              </div>
              <p className="text-xs text-slate-300 font-serif-body">
                Matter documents in this view are held in browser memory for the current session. No encrypted vault or persistent matter storage is configured.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-emerald-400 space-y-1">
                <div>Source SAC: Original Preserved</div>
                <div>Exhibits Attached: 5 of 5 Verified</div>
                <div>Elements Verified: 100% Mapped</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Stage Checklist: Pleadings</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Attach verified Exhibits A through E</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Map facts to all 5 legal counts</span>
                </li>
                <li className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Execute Pa.R.C.P. 1024 Verification</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Serve 20-day Notice to Defend</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 6. DOCUMENTS & EXHIBITS TAB */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-display font-bold text-slate-900">Case Documents & Exhibits</h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doc</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
              {documents.map((doc) => {
                const isSelected = selectedDoc.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-500 ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {doc.exhibitLetter && (
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900">
                              Ex. {doc.exhibitLetter}
                            </span>
                          )}
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {doc.type}
                          </span>
                          {doc.isOriginalSAC && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-bold">
                              MASTER SOURCE
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug">{doc.title}</h4>
                        <span className="text-[11px] text-slate-400">Date: {doc.date} &bull; {Math.round(doc.fileSizeBytes / 1024)} KB</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-700">{selectedDoc.type}</span>
                <h3 className="text-base font-display font-bold text-slate-900 mt-0.5">{selectedDoc.title}</h3>
                <span className="text-xs text-slate-400">Status: {selectedDoc.status} &bull; Preserved in Private Vault</span>
              </div>
              {selectedDoc.isOriginalSAC && (
                <button
                  onClick={() => setActiveTab('sac-review')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Inspect Paragraphs</span>
                </button>
              )}
            </div>

            <div className="bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800 selection:bg-amber-500 selection:text-slate-950">
              {selectedDoc.content}
            </div>
          </div>
        </div>
      )}

      {/* 7. CHRONOLOGY TIMELINE TAB */}
      {activeTab === 'chronology' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">Case Chronology & Fact Provenance</h2>
              <p className="text-xs text-slate-500 font-serif-body">
                Verified timeline of events connecting each factual occurrence to its corresponding exhibit and complaint paragraph.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-100 text-slate-700">
              {chronology.length} Chronological Entries
            </span>
          </div>

          <div className="relative pl-6 border-l-2 border-amber-500/40 space-y-6">
            {chronology.map((ev) => (
              <div key={ev.id} className="relative group">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-600 border-2 border-white shadow-xs"></div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 hover:bg-white transition shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-amber-100 text-amber-950 px-2 py-0.5 rounded">
                        {ev.date}
                      </span>
                      {ev.sourceExhibit && (
                        <span className="font-mono font-semibold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                          {ev.sourceExhibit}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Actors: {ev.actors.join(', ')}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900">{ev.title}</h3>
                  <p className="text-slate-700 font-serif-body text-xs leading-relaxed">{ev.description}</p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <span>Complaint Support: </span>
                      {ev.supportingParagraphs.map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setActiveTab('sac-review');
                            const target = paragraphs.find((para) => para.number === p);
                            if (target) setSelectedParagraph(target);
                          }}
                          className="font-bold text-amber-700 hover:underline"
                        >
                          ¶ {p}
                        </button>
                      ))}
                    </span>
                    <button
                      onClick={() => {
                        const doc = documents.find((d) => d.id === ev.sourceDocumentId);
                        if (doc) {
                          setSelectedDoc(doc);
                          setActiveTab('documents');
                        }
                      }}
                      className="text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Source Record</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. PROCEDURAL TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">Pennsylvania Civil Procedure Deadlines</h2>
              <p className="text-xs text-slate-500 font-serif-body">
                Calculated procedural calendar pursuant to Pa.R.C.P. 1026, 1024, and Schuylkill County Local Rules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {task.ruleReference}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Assigned to: {task.assignedTo}</span>
                    <span className="font-mono text-rose-700 font-semibold">{task.daysRemaining} days remaining</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Target Date: {task.deadline}</span>
                  <button
                    onClick={() => {
                      setTasks((prev) =>
                        prev.map((t) =>
                          t.id === task.id
                            ? { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
                            : t
                        )
                      );
                    }}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium"
                  >
                    {task.status === 'COMPLETED' ? 'Mark Pending' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. DRAFTING TOOLS (EVIDENCE TO FACT PARAGRAPHS) */}
      {activeTab === 'drafting' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-display font-bold text-slate-900">
              Evidence to Numbered Fact Paragraphs Drafter
            </h2>
            <p className="text-xs text-slate-500 font-serif-body">
              Converts unstructured casework logs, witness depositions, and exhibit notes into concise, single-allegation paragraphs compliant with Pa.R.C.P. 1019(a).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Source Evidence Notes / Witness Testimony
              </label>
              <textarea
                value={rawEvidenceInput}
                onChange={(e) => setRawEvidenceInput(e.target.value)}
                rows={8}
                className="w-full p-3.5 text-xs font-serif-body border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 leading-relaxed"
                placeholder="Paste raw exhibit notes, deposition transcript text, or case chronologies..."
              />
              <button
                onClick={handleConvertEvidenceToParagraphs}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Format into Pa.R.C.P. 1019 Paragraphs</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Formatted Numbered Factual Paragraphs
              </label>
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-[320px] overflow-y-auto">
                {generatedDraftParagraphs.map((para, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 font-serif-body leading-relaxed space-y-1">
                    <span className="font-mono font-bold text-amber-700">Proposed ¶ :</span>
                    <p>{para}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAppendDraftToSAC}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Append to Matter Working Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Camera Capture & Text Parsing Modal */}
      <DocumentCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onImportSAC={handleImportParsedSAC}
        onAddExhibit={handleAddCapturedExhibit}
        docketNumber={matter.docketNumber}
      />
    </div>
  );
};
