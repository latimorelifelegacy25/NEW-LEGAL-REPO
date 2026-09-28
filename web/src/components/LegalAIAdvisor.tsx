import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  AlertCircle,
  Copy,
  Check,
  Bookmark,
  FileText,
  Scale,
  Clock,
  RefreshCw,
  Brain,
  Globe,
  Zap,
  Volume2,
  VolumeX,
  HardDrive,
  ExternalLink
} from 'lucide-react';
import { StatuteItem } from '../types';
import { playPcmAudio, stopCurrentAudio } from '../utils/audioPlayer';

interface LegalAIAdvisorProps {
  initialStatute?: StatuteItem | null;
  selectedCounty: string;
  onDraftPleading: (title: string, facts: string) => void;
  onSaveAnalysis: (title: string, content: string) => void;
  onExportToGoogleDoc?: (title: string, content: string) => void;
  onSaveToDrive?: (title: string, content: string) => void;
  accessToken: string | null;
}

const PRESET_SCENARIOS = [
  {
    title: 'Custody Withholding (18 Pa.C.S. § 2904)',
    domain: 'Criminal & Family Law',
    query: 'A parent refused to return the child following weekend visitation and has withheld the child for over two weeks without communication.',
    facts: 'The parties have a valid custody order entered in Schuylkill County Court of Common Pleas granting primary physical custody to Mother and alternate weekend visitation to Father. Father took the 8-year-old child for his scheduled weekend on Friday, but failed to return the child on Sunday evening. Father has turned off his phone, relocated the child to a third-party relative residence, and is refusing to disclose the child\'s whereabouts.'
  },
  {
    title: 'School Records Denial (23 Pa.C.S. § 5336 & FERPA)',
    domain: 'Education & Domestic Relations',
    query: 'Can a school district deny report cards and disciplinary records to a non-custodial parent who does not have primary physical custody?',
    facts: 'Mother has primary physical custody of the 11-year-old student, and Father has partial physical custody on alternate weekends and shared legal custody. Father submitted a written request to the public school district principal requesting copies of the student\'s report cards, attendance logs, and IEP records. The school principal refused, stating that district policy only allows the primary custodial parent to view records.'
  },
  {
    title: 'Compulsory Attendance & Truancy Citation (24 P.S. § 13-1327)',
    domain: 'Education Law & Juvenile Truancy',
    query: 'School district filed a summary citation before the Magisterial District Judge for habitual truancy without convening a School Attendance Improvement Conference (SAIC).',
    facts: 'A 14-year-old student missed 7 days of school during the academic term due to severe chronic asthma documented by doctor\'s notes that were emailed late to the attendance office. The school sent a truancy notice and immediately filed a summary criminal citation against the parents before the local Magisterial District Judge without first holding an attendance improvement conference or creating a SAIP plan.'
  },
  {
    title: 'Educator Misconduct & Reporting (24 P.S. § 2070.9 & 22 Pa. Code § 235)',
    domain: 'Education & Professional Licensure',
    query: 'What are the mandatory reporting deadlines and consequences when a certified educator is accused of boundary violations or resigns amid an investigation?',
    facts: 'A certified high school teacher in Pennsylvania was observed sending private social media messages and late-night text messages of an overly familiar and personal nature to a 16-year-old pupil. When confronted by building administrators, the teacher abruptly submitted an immediate letter of resignation. School leadership is questioning whether they must still report the educator to the Pennsylvania Department of Education (PDE) since the teacher has already resigned.'
  },
  {
    title: 'Two-Year Limitation & Discovery Rule (42 Pa.C.S. § 5524)',
    domain: 'Civil Procedure & Torts',
    query: 'Does the two-year statute of limitations bar a civil injury suit if the latent harm was only diagnosed 2.5 years after the initial incident?',
    facts: 'Plaintiff was exposed to toxic environmental contamination and structural collapse at a workplace in Pennsylvania in March 2024. However, despite diligent medical examinations for respiratory distress, the specific permanent pulmonary fibrosis injury was not definitively identified or linked to the exposure by specialists until September 2026. The defendant claims the 2-year limitation period expired.'
  }
];

export const LegalAIAdvisor: React.FC<LegalAIAdvisorProps> = ({
  initialStatute,
  selectedCounty,
  onDraftPleading,
  onSaveAnalysis,
  onExportToGoogleDoc,
  onSaveToDrive,
  accessToken
}) => {
  const [legalDomain, setLegalDomain] = useState<string>(
    initialStatute?.titleName || 'Child Custody & Domestic Relations (Title 23)'
  );
  const [query, setQuery] = useState<string>(
    initialStatute
      ? `What are the legal elements, defenses, and procedural prerequisites under ${initialStatute.citation} (${initialStatute.heading})?`
      : ''
  );
  const [facts, setFacts] = useState<string>(
    initialStatute
      ? `Analysis regarding statutory application of ${initialStatute.citation} in ${selectedCounty} County.`
      : ''
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('gemini-3.8-flash');
  const [isThinkingActive, setIsThinkingActive] = useState(false);
  const [groundingSources, setGroundingSources] = useState<{ title: string; url: string }[]>([]);

  // Mode configurations
  const [useThinking, setUseThinking] = useState(false);
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [speedTier, setSpeedTier] = useState<'standard' | 'thinking' | 'search' | 'fast'>('standard');

  // Actions
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);

  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setLegalDomain(preset.domain);
    setQuery(preset.query);
    setFacts(preset.facts);
    setAnalysisResult(null);
    setGroundingSources([]);
    stopCurrentAudio();
    setIsNarrating(false);
  };

  const handleRunAnalysis = async () => {
    if (!query.trim() && !facts.trim()) return;
    setIsLoading(true);
    setAnalysisResult(null);
    setGroundingSources([]);
    setSaved(false);
    stopCurrentAudio();
    setIsNarrating(false);

    try {
      const response = await fetch('/api/legal-ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          facts,
          domain: legalDomain,
          county: selectedCounty,
          useThinking: speedTier === 'thinking' || useThinking,
          useSearchGrounding: speedTier === 'search' || useSearchGrounding,
          modelOverride:
            speedTier === 'thinking'
              ? 'gemini-3.1-pro-preview'
              : speedTier === 'search'
              ? 'gemini-3.5-flash'
              : speedTier === 'fast'
              ? 'gemini-3.1-flash-lite'
              : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Analysis request failed.');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis || 'Analysis generated successfully.');
      setModelUsed(data.source || 'gemini-3.8-flash');
      setIsThinkingActive(data.isThinking || false);
      if (Array.isArray(data.groundingSources)) {
        setGroundingSources(data.groundingSources);
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisResult(
        `Error generating analysis: ${err.message || 'Please check network connection.'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTts = async () => {
    if (!analysisResult) return;
    if (isNarrating) {
      stopCurrentAudio();
      setIsNarrating(false);
      return;
    }

    setTtsLoading(true);
    try {
      const res = await fetch('/api/legal-ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: analysisResult,
          voiceName: 'Kore',
          style: 'Formal, deliberate Pennsylvania jurisprudence reviewer'
        })
      });

      if (!res.ok) throw new Error('TTS request failed');
      const data = await res.json();
      if (data.audioData) {
        setIsNarrating(true);
        await playPcmAudio(data.audioData, () => setIsNarrating(false));
      }
    } catch (e) {
      console.warn('TTS error:', e);
      setIsNarrating(false);
    } finally {
      setTtsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!analysisResult) return;
    onSaveAnalysis(`Legal Analysis: ${query.slice(0, 45)}...`, analysisResult);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              Pennsylvania Legal Research & Fact-Pattern Diagnostic
            </h1>
            <p className="text-xs text-slate-500 font-serif-body mt-0.5">
              Input a legal dispute, factual narrative, or statutory question. The legal engine evaluates the fact pattern against Pennsylvania statutory codes, required elements, and applicable time limits.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-amber-100/70 border border-amber-300 text-amber-900 font-semibold self-start sm:self-auto">
            Jurisdiction: {selectedCounty} County, PA
          </span>
        </div>

        {/* Preset Scenarios Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 block mb-2">
            Preset Pennsylvania Case Scenarios:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_SCENARIOS.map((preset, idx) => (
              <button
                key={idx}
                id={`preset-btn-${idx}`}
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap transition"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Box & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-600" />
            Case Query & Reasoning Settings
          </h2>

          {/* Model Reasoning Mode Tabs */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Reasoning Engine & Grounding Mode
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setSpeedTier('standard')}
                className={`py-1 rounded text-center transition ${
                  speedTier === 'standard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setSpeedTier('thinking')}
                className={`py-1 rounded text-center transition flex items-center justify-center gap-1 ${
                  speedTier === 'thinking' ? 'bg-purple-900 text-white shadow-xs' : 'text-purple-700'
                }`}
                title="Deep Thinking with gemini-3.1-pro-preview"
              >
                <Brain className="w-3 h-3" />
                <span>Thinking</span>
              </button>
              <button
                type="button"
                onClick={() => setSpeedTier('search')}
                className={`py-1 rounded text-center transition flex items-center justify-center gap-1 ${
                  speedTier === 'search' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-700'
                }`}
                title="Grounded Search with gemini-3.5-flash"
              >
                <Globe className="w-3 h-3" />
                <span>Search</span>
              </button>
              <button
                type="button"
                onClick={() => setSpeedTier('fast')}
                className={`py-1 rounded text-center transition flex items-center justify-center gap-1 ${
                  speedTier === 'fast' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'
                }`}
                title="Fast Procedural with gemini-3.1-flash-lite"
              >
                <Zap className="w-3 h-3" />
                <span>Fast</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="legal-domain-select" className="block text-xs font-semibold text-slate-700">
              Governing Legal Domain / Code
            </label>
            <select
              id="legal-domain-select"
              aria-label="Select Governing Legal Domain or Code"
              value={legalDomain}
              onChange={(e) => setLegalDomain(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            >
              <option value="Child Custody & Domestic Relations (Title 23)">
                Child Custody & Domestic Relations (Title 23)
              </option>
              <option value="Criminal Crimes Code & Custody Interference (Title 18)">
                Criminal Crimes Code & Custody Interference (Title 18)
              </option>
              <option value="Public School Code, Truancy & Attendance (Title 24)">
                Public School Code, Truancy & Attendance (Title 24)
              </option>
              <option value="Educator Conduct & Mandatory Misconduct Reporting (22 Pa. Code & 24 P.S.)">
                Educator Conduct & Misconduct Reporting (22 Pa. Code & 24 P.S.)
              </option>
              <option value="FERPA Student Educational Records Privacy (34 CFR Part 99)">
                FERPA Student Educational Records Privacy (34 CFR Part 99)
              </option>
              <option value="Statutes of Limitations & Civil Procedure (Title 42 & Pa.R.C.P.)">
                Statutes of Limitations & Civil Procedure (Title 42 & Pa.R.C.P.)
              </option>
              <option value="Child Protective Services & Mandated Reporting (Chapter 63)">
                Child Protective Services & Mandated Reporting (Chapter 63)
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="primary-legal-question-input" className="block text-xs font-semibold text-slate-700">
              Primary Legal Question
            </label>
            <input
              id="primary-legal-question-input"
              type="text"
              placeholder="e.g., Can school withhold report cards from non-custodial parent under § 5336?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="factual-narrative-input" className="block text-xs font-semibold text-slate-700">
              Factual Narrative & Timeline
            </label>
            <textarea
              id="factual-narrative-input"
              rows={6}
              placeholder="Describe the parties, dates of incident, existing court orders, school district responses, or timeline..."
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-serif-body leading-relaxed"
            />
          </div>

          <button
            id="run-legal-analysis-btn"
            onClick={handleRunAnalysis}
            disabled={isLoading || (!query.trim() && !facts.trim())}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition ${
              isLoading || (!query.trim() && !facts.trim())
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {speedTier === 'thinking'
                    ? 'Engaging High Thinking Deep Reasoning...'
                    : speedTier === 'search'
                    ? 'Consulting Google Search Grounded Authorities...'
                    : 'Analyzing Pennsylvania Statutes & Case Law...'}
                </span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Run Pennsylvania Legal Assessment</span>
              </>
            )}
          </button>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-3.5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="font-display font-bold text-sm tracking-wide">
                Analysis & Legal Reasoning Report
              </span>
              {analysisResult && modelUsed && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {modelUsed}
                </span>
              )}
            </div>

            {analysisResult && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* TTS Listen Button */}
                <button
                  onClick={handleToggleTts}
                  disabled={ttsLoading}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 border transition ${
                    isNarrating
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                  title="Listen to legal analysis using Gemini 3.8 Flash TTS"
                >
                  {ttsLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : isNarrating ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span>{ttsLoading ? 'Synthesizing...' : isNarrating ? 'Stop' : 'Listen'}</span>
                </button>

                {/* Export to Google Docs */}
                {onExportToGoogleDoc && (
                  <button
                    onClick={() => onExportToGoogleDoc(`PA Legal Report: ${query.slice(0, 40)}`, analysisResult)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-blue-300 flex items-center gap-1 transition"
                    title="Export to Google Docs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Doc</span>
                  </button>
                )}

                {/* Save to Google Drive */}
                {onSaveToDrive && (
                  <button
                    onClick={() => onSaveToDrive(`PA_Legal_Report_${Date.now()}`, analysisResult)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-blue-300 flex items-center gap-1 transition"
                    title="Save to Google Drive"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Drive</span>
                  </button>
                )}

                <button
                  id="copy-analysis-btn"
                  onClick={handleCopy}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1 transition"
                  title="Copy analysis to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  id="save-analysis-btn"
                  onClick={handleSave}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1 transition"
                  title="Save analysis to research bookmarks"
                >
                  {saved ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  {speedTier === 'thinking'
                    ? 'Engaging High Thinking Deep Reasoning Mode...'
                    : 'Examining Pennsylvania Consolidated Statutes & Local Court Rules...'}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-serif-body">
                  Parsing Title 18, Title 23 § 5328 factors, compulsory attendance BECs, and 42 Pa.C.S. limitations.
                </p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-5">
                {/* Search Grounding Sources */}
                {groundingSources.length > 0 && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-600" />
                      Google Search Grounded Citations & Legal Sources:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {groundingSources.map((source, sIdx) => (
                        <a
                          key={sIdx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-blue-200 text-blue-800 hover:text-blue-950 font-sans text-xs hover:underline shadow-2xs"
                        >
                          <span className="truncate max-w-[200px]">{source.title}</span>
                          <ExternalLink className="w-3 h-3 text-blue-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="prose prose-slate max-w-none text-xs sm:text-sm font-serif-body leading-relaxed whitespace-pre-wrap text-slate-800 bg-slate-50/60 p-5 rounded-lg border border-slate-200">
                  {analysisResult}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Always verify local county prothonotary filing hours & administrative orders.</span>
                  </div>
                  <button
                    id="draft-pleading-from-analysis-btn"
                    onClick={() => onDraftPleading(query || 'Custody Action', facts || analysisResult)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Generate Court Pleading / Notice</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 text-slate-400">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-600">
                  No analysis active. Enter your legal query on the left or select a preset scenario.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  The system generates statutory citations, element checks, statute of limitations calculations, and actionable procedural steps.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
