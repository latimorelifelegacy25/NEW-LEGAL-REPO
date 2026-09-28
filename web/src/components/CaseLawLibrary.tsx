import React, { useState } from 'react';
import { PA_CASE_GUIDANCE } from '../data/paLawData';
import { CaseGuidance } from '../types';
import {
  Scale,
  BookOpen,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  RefreshCw
} from 'lucide-react';
import { playPcmAudio, stopCurrentAudio } from '../utils/audioPlayer';

interface CaseLawLibraryProps {
  onToggleBookmark: (caseItem: CaseGuidance) => void;
  isBookmarked: (id: string) => boolean;
  onAnalyzeTopic: (topic: string, citation: string) => void;
}

export const CaseLawLibrary: React.FC<CaseLawLibraryProps> = ({
  onToggleBookmark,
  isBookmarked,
  onAnalyzeTopic
}) => {
  const [selectedCase, setSelectedCase] = useState<CaseGuidance>(PA_CASE_GUIDANCE[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);

  const handleCopyCitation = (citation: string, id: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleTts = async () => {
    if (!selectedCase) return;
    if (isNarrating) {
      stopCurrentAudio();
      setIsNarrating(false);
      return;
    }

    setTtsLoading(true);
    try {
      const textToRead = `${selectedCase.caseOrDocumentName}. Citation: ${selectedCase.officialCitation}. Decided by ${selectedCase.issuingAuthority}, ${selectedCase.dateOrYear}. Topic: ${selectedCase.topic}. Core Holding: ${selectedCase.holdingOrPrinciple}. Practical Application: ${selectedCase.practicalApplication}`;
      const res = await fetch('/api/legal-ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToRead,
          voiceName: 'Kore',
          style: 'Authoritative appellate law analyst'
        })
      });

      if (!res.ok) throw new Error('TTS failed');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              Pennsylvania Precedents, Case Law & PDE Regulatory Guidance
            </h1>
            <p className="text-xs text-slate-500 font-serif-body mt-0.5">
              Landmark decisions from the Pennsylvania Supreme Court and Superior Court, along with Pennsylvania Department of Education (PDE) Basic Education Circulars with Text-to-Speech narration.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Case List Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-semibold text-slate-500 block px-1">
            Landmark Authorities & Circulars:
          </span>
          <div className="space-y-2.5">
            {PA_CASE_GUIDANCE.map((item) => {
              const isSelected = selectedCase.id === item.id;
              const bookmarked = isBookmarked(item.id);
              return (
                <div
                  key={item.id}
                  id={`case-card-${item.id}`}
                  onClick={() => {
                    stopCurrentAudio();
                    setIsNarrating(false);
                    setSelectedCase(item);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-amber-50/60 border-amber-500/80 ring-1 ring-amber-500/30 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200 block truncate">
                        {item.officialCitation}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.caseOrDocumentName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {item.issuingAuthority} ({item.dateOrYear})
                      </p>
                    </div>
                    <button
                      id={`case-bookmark-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(item);
                      }}
                      className={`p-1.5 rounded-md text-xs transition shrink-0 ${
                        bookmarked
                          ? 'text-amber-600 bg-amber-100/70 hover:bg-amber-200'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Bookmark Precedent"
                    >
                      {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 font-serif-body mt-2 line-clamp-2 leading-relaxed">
                    {item.topic}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Case Deep Dive Column */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden sticky top-4">
          <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded shadow-xs">
                    {selectedCase.officialCitation}
                  </span>
                  <span className="text-xs text-slate-300">
                    {selectedCase.issuingAuthority} &bull; {selectedCase.dateOrYear}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-white mt-2 leading-snug">
                  {selectedCase.caseOrDocumentName}
                </h2>
                <p className="text-xs text-amber-300/90 font-serif-body mt-1">
                  Topic: {selectedCase.topic}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                {/* TTS Listen Button */}
                <button
                  onClick={handleToggleTts}
                  disabled={ttsLoading}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition ${
                    isNarrating
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                  }`}
                  title="Listen with Gemini 3.8 Flash TTS"
                >
                  {ttsLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : isNarrating ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span>{ttsLoading ? 'Synthesizing...' : isNarrating ? 'Stop' : 'Listen (TTS)'}</span>
                </button>

                <button
                  id="case-copy-citation-btn"
                  onClick={() => handleCopyCitation(selectedCase.officialCitation, selectedCase.id)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
                >
                  {copiedId === selectedCase.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>

                <button
                  id="case-analyze-btn"
                  onClick={() => onAnalyzeTopic(selectedCase.caseOrDocumentName, selectedCase.officialCitation)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-md text-xs font-semibold text-white transition flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Analyze Case</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[640px] overflow-y-auto">
            {/* Holding & Legal Rule */}
            <div className="space-y-1.5">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                Core Holding & Controlling Legal Principle
              </h4>
              <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200 text-xs sm:text-sm font-serif-body leading-relaxed text-slate-900 font-medium">
                {selectedCase.holdingOrPrinciple}
              </div>
            </div>

            {/* Detailed Case Background & Summary */}
            <div className="space-y-1.5">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Factual Narrative & Jurisprudential Context
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 font-serif-body leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                {selectedCase.fullSummary}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Key Takeaways for Practitioners & Litigants
              </h4>
              <div className="space-y-2">
                {selectedCase.keyTakeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/70 text-xs text-slate-800 font-serif-body"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Application */}
            <div className="p-4 bg-blue-50/70 rounded-lg border border-blue-200/70 space-y-1 text-xs text-blue-950">
              <span className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Courtroom & Practical Strategy Application:
              </span>
              <p className="font-serif-body leading-relaxed text-slate-800">
                {selectedCase.practicalApplication}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
