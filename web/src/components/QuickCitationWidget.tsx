import React, { useState, useMemo, useEffect } from 'react';
import { StatuteItem } from '../types';
import { PA_STATUTES } from '../data/paLawData';
import { generateBluebookCitations, GeneratedCitations } from '../utils/citationGenerator';
import {
  Quote,
  Copy,
  Check,
  X,
  BookOpen,
  Search,
  Scale,
  Sparkles,
  Bookmark,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

interface QuickCitationWidgetProps {
  initialStatute?: StatuteItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onSaveToBriefcase?: (title: string, content: string) => void;
  onAnalyzeStatute?: (statute: StatuteItem) => void;
}

export const QuickCitationWidget: React.FC<QuickCitationWidgetProps> = ({
  initialStatute,
  isOpen,
  onClose,
  onOpen,
  onSaveToBriefcase,
  onAnalyzeStatute
}) => {
  const [selectedStatuteId, setSelectedStatuteId] = useState<string>(() => {
    return initialStatute ? initialStatute.id : PA_STATUTES[1].id; // default: 23 Pa.C.S. § 5328
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [subsection, setSubsection] = useState('');
  const [year, setYear] = useState('2024');
  const [customParenthetical, setCustomParenthetical] = useState('');
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customCitationInput, setCustomCitationInput] = useState('42 Pa.C.S. § 8301');
  const [customHeadingInput, setCustomHeadingInput] = useState('Wrongful death actions');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showBluebookRules, setShowBluebookRules] = useState(false);

  // Sync initialStatute when passed
  useEffect(() => {
    if (initialStatute) {
      setSelectedStatuteId(initialStatute.id);
      setShowCustomBuilder(false);
    }
  }, [initialStatute]);

  const activeStatute = useMemo(() => {
    return PA_STATUTES.find((s) => s.id === selectedStatuteId) || PA_STATUTES[0];
  }, [selectedStatuteId]);

  const filteredStatutes = useMemo(() => {
    if (!searchQuery.trim()) return PA_STATUTES;
    const q = searchQuery.toLowerCase();
    return PA_STATUTES.filter(
      (s) =>
        s.citation.toLowerCase().includes(q) ||
        s.heading.toLowerCase().includes(q) ||
        s.sectionNumber.toLowerCase().includes(q) ||
        s.titleNumber.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Generate citations
  const generated: GeneratedCitations = useMemo(() => {
    if (showCustomBuilder) {
      return generateBluebookCitations(
        customCitationInput,
        customHeadingInput,
        '',
        {
          subsection,
          year,
          parenthetical: customParenthetical
        }
      );
    }
    return generateBluebookCitations(
      activeStatute.citation,
      activeStatute.heading,
      activeStatute.summary,
      {
        subsection,
        year,
        parenthetical: customParenthetical
      }
    );
  }, [
    showCustomBuilder,
    customCitationInput,
    customHeadingInput,
    activeStatute,
    subsection,
    year,
    customParenthetical
  ]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleCopyAll = () => {
    const fullBlock = [
      `=== PENNSYLVANIA STATUTE BLUEBOOK CITATION SUITE ===`,
      `Statute: ${showCustomBuilder ? customCitationInput : activeStatute.citation} - ${showCustomBuilder ? customHeadingInput : activeStatute.heading}`,
      ``,
      `1. Bluebook Official (Rule 12 / T.1.3):`,
      `   ${generated.bluebookStandard}`,
      ``,
      `2. PA Court Brief & Pleading Format:`,
      `   ${generated.paCourtPractice}`,
      ``,
      `3. Purdon's Consolidated Annotated:`,
      `   ${generated.purdonsAnnotated}`,
      ``,
      `4. Short Form (Id.):`,
      `   ${generated.shortFormId}`,
      ``,
      `5. Explanatory Parenthetical:`,
      `   ${generated.explanatoryParenthetical}`,
      ``,
      `6. In-Text Heading Reference:`,
      `   ${generated.fullWithHeading}`
    ].join('\n');
    navigator.clipboard.writeText(fullBlock);
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSaveToBriefcase = () => {
    if (!onSaveToBriefcase) return;
    const title = showCustomBuilder
      ? `Citation: ${customCitationInput}`
      : `Citation: ${activeStatute.citation} (${activeStatute.heading})`;
    const content = [
      `## Bluebook Citation Record`,
      `- **Official Bluebook:** \`${generated.bluebookStandard}\``,
      `- **PA Court Briefs:** \`${generated.paCourtPractice}\``,
      `- **Purdon's Annotated:** \`${generated.purdonsAnnotated}\``,
      `- **Short Form:** \`${generated.shortFormId}\``,
      `- **Explanatory Form:** \`${generated.explanatoryParenthetical}\``
    ].join('\n');
    onSaveToBriefcase(title, content);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const popularPresets = [
    { id: 'pa-23-5328', label: '23 Pa.C.S. § 5328 (Custody Factors)' },
    { id: 'pa-18-2904', label: '18 Pa.C.S. § 2904 (Custody Interference)' },
    { id: 'pa-23-5336', label: '23 Pa.C.S. § 5336 (Parental Records)' },
    { id: 'pa-23-6311', label: '23 Pa.C.S. § 6311 (Mandated Reporters)' },
    { id: 'pa-24-1327', label: '24 P.S. § 13-1327 (Attendance)' },
    { id: 'pa-42-5524', label: '42 Pa.C.S. § 5524 (2-Yr Limitation)' },
    { id: 'pa-rcp-1915-3', label: 'Pa.R.C.P. 1915.3 (Custody Complaint)' }
  ];

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          id="floating-quick-citation-btn"
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl border border-amber-500/40 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          title="Open Bluebook Quick Citation Tool (Ctrl+K)"
        >
          <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 group-hover:rotate-12 transition-transform">
            <Quote className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold tracking-wide pr-1">
            Quick Citation
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Bluebook
          </span>
        </button>
      )}

      {/* Floating Modal / Flyout Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] sm:max-h-[86vh] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-citation-title"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Quote className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="quick-citation-title" className="text-sm font-display font-bold text-white flex items-center gap-2">
                    Pennsylvania Bluebook Citation Generator
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Rule 12 &bull; T.1.3
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Instant standard citation snippets for Pennsylvania codes, rules, and court pleadings.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  id="close-quick-citation-btn"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Close Citation Tool (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* Statute Selector Mode Switcher */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setShowCustomBuilder(false)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      !showCustomBuilder
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Select from PA Library
                  </button>
                  <button
                    onClick={() => setShowCustomBuilder(true)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      showCustomBuilder
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Custom PA Code
                  </button>
                </div>

                <button
                  onClick={() => setShowBluebookRules(!showBluebookRules)}
                  className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{showBluebookRules ? 'Hide' : 'Bluebook Rules'}</span>
                </button>
              </div>

              {/* Bluebook Rules Help Banner */}
              {showBluebookRules && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-slate-800 space-y-1.5 font-serif-body">
                  <div className="font-bold font-sans text-amber-900 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-700" />
                    Pennsylvania Bluebook Citation Guide (Rule 12 & Table T.1.3):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                    <li>
                      <strong>Pa.C.S. (Consolidated Statutes):</strong> Official Bluebook form is <code className="bg-white px-1 py-0.5 rounded border border-amber-200 font-mono text-amber-900">23 Pa. Cons. Stat. § 5328 (2024)</code>. In Pennsylvania court pleadings and state briefs, courts use <code className="bg-white px-1 py-0.5 rounded border border-amber-200 font-mono text-amber-900">23 Pa.C.S. § 5328</code>.
                    </li>
                    <li>
                      <strong>P.S. (Purdon's Unconsolidated Statutes, e.g. Title 24 School Code):</strong> Bluebook form is <code className="bg-white px-1 py-0.5 rounded border border-amber-200 font-mono text-amber-900">24 Pa. Stat. Ann. § 13-1327 (West 2024)</code>; state court form is <code className="bg-white px-1 py-0.5 rounded border border-amber-200 font-mono text-amber-900">24 P.S. § 13-1327</code>.
                    </li>
                    <li>
                      <strong>Pa. Code (Regulations):</strong> <code className="bg-white px-1 py-0.5 rounded border border-amber-200 font-mono text-amber-900">22 Pa. Code § 235.4 (2024)</code>.
                    </li>
                    <li>
                      <strong>Pa.R.C.P. (Court Rules):</strong> <code className="bg-white px-1 py-0.5 rounded border border-amber-200 font-mono text-amber-900">Pa.R.C.P. 1018.1</code>.
                    </li>
                  </ul>
                </div>
              )}

              {/* Selector / Custom Inputs */}
              {!showCustomBuilder ? (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label htmlFor="citation-statute-select" className="block text-xs font-semibold text-slate-700">
                      Select Pennsylvania Statute:
                    </label>
                    <select
                      id="citation-statute-select"
                      aria-label="Select Pennsylvania Statute"
                      value={selectedStatuteId}
                      onChange={(e) => setSelectedStatuteId(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-medium"
                    >
                      {PA_STATUTES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.citation} - {s.heading}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Popular quick chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-500 font-medium">Quick Pick:</span>
                    {popularPresets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedStatuteId(p.id)}
                        className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                          selectedStatuteId === p.id
                            ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <label htmlFor="custom-statute-input" className="block text-xs font-semibold text-slate-700">
                      PA Statute Citation (e.g. 42 Pa.C.S. § 8301):
                    </label>
                    <input
                      id="custom-statute-input"
                      type="text"
                      placeholder="e.g. 42 Pa.C.S. § 8301 or 18 Pa.C.S. § 3921"
                      value={customCitationInput}
                      onChange={(e) => setCustomCitationInput(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="custom-heading-input" className="block text-xs font-semibold text-slate-700">
                      Statute Heading / Title (Optional):
                    </label>
                    <input
                      id="custom-heading-input"
                      type="text"
                      placeholder="e.g. Wrongful death actions"
                      value={customHeadingInput}
                      onChange={(e) => setCustomHeadingInput(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              )}

              {/* Subsection & Customization Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
                <div className="space-y-1">
                  <label htmlFor="citation-subsection-input" className="block font-semibold text-slate-700">
                    Pincite / Subsection:
                  </label>
                  <input
                    id="citation-subsection-input"
                    type="text"
                    placeholder="e.g. (a), (a)(1), (b)"
                    value={subsection}
                    onChange={(e) => setSubsection(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="citation-year-input" className="block font-semibold text-slate-700">
                    Publication / Code Year:
                  </label>
                  <select
                    id="citation-year-input"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="2024">2024 (Current)</option>
                    <option value="2025">2025 (Supp.)</option>
                    <option value="2023">2023</option>
                    <option value="2020">2020</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="citation-paren-input" className="block font-semibold text-slate-700">
                    Custom Parenthetical:
                  </label>
                  <input
                    id="citation-paren-input"
                    type="text"
                    placeholder="e.g. evaluating 16 custody factors"
                    value={customParenthetical}
                    onChange={(e) => setCustomParenthetical(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Generated Snippets Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-amber-600" />
                    Standard Bluebook & PA Citation Formats
                  </span>
                  <button
                    id="copy-all-citations-btn"
                    onClick={handleCopyAll}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition"
                  >
                    {copiedKey === 'all' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">All Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy All Styles</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 1. Standard Bluebook Official */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1 hover:border-amber-400 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      The Bluebook Official Citation (Rule 12 & Table T.1.3)
                    </span>
                    <button
                      onClick={() => handleCopy(generated.bluebookStandard, 'bluebook')}
                      className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'bluebook' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 bg-slate-50 rounded font-mono text-xs text-slate-900 select-all border border-slate-100 font-medium">
                    {generated.bluebookStandard}
                  </div>
                  <p className="text-[10px] text-slate-400 font-serif-body">
                    Official format required for law reviews, federal court briefs, and academic legal scholarship.
                  </p>
                </div>

                {/* 2. PA Appellate & Trial Court Practice */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1 hover:border-amber-400 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Pennsylvania Court Briefs & Pleadings (Pa.R.A.P. 124)
                    </span>
                    <button
                      onClick={() => handleCopy(generated.paCourtPractice, 'pacourt')}
                      className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'pacourt' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 bg-amber-50/50 rounded font-mono text-xs text-slate-900 select-all border border-amber-200/60 font-bold">
                    {generated.paCourtPractice}
                  </div>
                  <p className="text-[10px] text-slate-400 font-serif-body">
                    Standard citation format utilized in PA Supreme, Superior, Commonwealth, and County Common Pleas pleadings.
                  </p>
                </div>

                {/* 3. Short Form / Id. */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1 hover:border-amber-400 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Short Form & Id. Citation (Subsequent Reference)
                    </span>
                    <button
                      onClick={() => handleCopy(generated.shortFormId, 'shortid')}
                      className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'shortid' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 bg-slate-50 rounded font-mono text-xs text-slate-900 select-all border border-slate-100">
                    <em>Id.</em> at {generated.shortFormId.replace(/^Id\.\s*/, '')}
                  </div>
                </div>

                {/* 4. Explanatory Parenthetical Form */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1 hover:border-amber-400 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      Citation with Explanatory Parenthetical
                    </span>
                    <button
                      onClick={() => handleCopy(generated.explanatoryParenthetical, 'paren')}
                      className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'paren' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 bg-slate-50 rounded font-mono text-xs text-slate-900 select-all border border-slate-100">
                    {generated.explanatoryParenthetical}
                  </div>
                </div>

                {/* 5. Purdon's Consolidated Annotated */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1 hover:border-amber-400 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Purdon's Pennsylvania Statutes Annotated (West / Thomson Reuters)
                    </span>
                    <button
                      onClick={() => handleCopy(generated.purdonsAnnotated, 'purdons')}
                      className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'purdons' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 bg-slate-50 rounded font-mono text-xs text-slate-700 select-all border border-slate-100">
                    {generated.purdonsAnnotated}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-slate-500 font-serif-body">
                Complies with Bluebook Rule 12, Table T.1.3, & Pa.R.A.P. 124 formatting standards.
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {onSaveToBriefcase && (
                  <button
                    id="quick-cite-save-briefcase-btn"
                    onClick={handleSaveToBriefcase}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Saved to Briefcase!</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                        <span>Save to Briefcase</span>
                      </>
                    )}
                  </button>
                )}
                {!showCustomBuilder && onAnalyzeStatute && (
                  <button
                    onClick={() => {
                      onAnalyzeStatute(activeStatute);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze Code</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
