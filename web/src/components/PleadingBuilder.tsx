import React, { useState } from 'react';
import { PLEADING_TEMPLATES } from '../data/pleadingTemplates';
import { PleadingTemplate } from '../types';
import {
  FileText,
  Copy,
  Check,
  Download,
  Printer,
  Sparkles,
  RefreshCw,
  Bookmark,
  Shield,
  Volume2,
  VolumeX,
  HardDrive
} from 'lucide-react';
import { playPcmAudio, stopCurrentAudio } from '../utils/audioPlayer';

interface PleadingBuilderProps {
  selectedCounty: string;
  onSavePleading: (title: string, content: string) => void;
  prefillQuery?: string;
  prefillFacts?: string;
  onExportToGoogleDoc?: (title: string, content: string) => void;
  onSaveToDrive?: (title: string, content: string) => void;
  accessToken: string | null;
}

export const PleadingBuilder: React.FC<PleadingBuilderProps> = ({
  selectedCounty,
  onSavePleading,
  prefillQuery,
  prefillFacts,
  onExportToGoogleDoc,
  onSaveToDrive,
  accessToken
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PleadingTemplate>(
    PLEADING_TEMPLATES[1] // Default: Complaint for Custody
  );

  const [formValues, setFormValues] = useState<Record<string, string>>({
    county: selectedCounty,
    bestInterestGrounds: prefillFacts || '',
    plaintiff: '',
    defendant: ''
  });

  const [generatedDraft, setGeneratedDraft] = useState<string>(() =>
    selectedTemplate.generateText({
      county: selectedCounty,
      bestInterestGrounds: prefillFacts || ''
    })
  );

  const [aiRefining, setAiRefining] = useState<boolean>(false);
  const [customAiInstruction, setCustomAiInstruction] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);

  const handleSelectTemplate = (template: PleadingTemplate) => {
    setSelectedTemplate(template);
    const initialVals: Record<string, string> = {
      county: selectedCounty
    };
    template.fields.forEach((f) => {
      initialVals[f.key] = f.defaultValue || '';
    });
    setFormValues(initialVals);
    setGeneratedDraft(template.generateText(initialVals));
    stopCurrentAudio();
    setIsNarrating(false);
  };

  const handleFieldChange = (key: string, value: string) => {
    const updated = { ...formValues, [key]: value };
    setFormValues(updated);
    setGeneratedDraft(selectedTemplate.generateText(updated));
  };

  const handleAiRefine = async () => {
    setAiRefining(true);
    try {
      const response = await fetch('/api/legal-ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateTitle: selectedTemplate.title,
          rawDraft: generatedDraft,
          customInstructions:
            customAiInstruction ||
            'Enhance legal averments and ensure strict compliance with Pennsylvania civil rules.'
        })
      });
      if (!response.ok) throw new Error('Refinement failed.');
      const data = await response.json();
      if (data.draft) {
        setGeneratedDraft(data.draft);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAiRefining(false);
    }
  };

  const handleToggleTts = async () => {
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
          text: generatedDraft.slice(0, 2500),
          voiceName: 'Kore',
          style: 'Official court clerk and formal legal document narrator'
        })
      });

      if (!res.ok) throw new Error('TTS failed');
      const data = await res.json();
      if (data.audioData) {
        setIsNarrating(true);
        await playPcmAudio(data.audioData, () => setIsNarrating(false));
      }
    } catch (e) {
      console.warn(e);
      setIsNarrating(false);
    } finally {
      setTtsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSavePleading(selectedTemplate.title, generatedDraft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedTemplate.title}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; padding: 1in; color: #000; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: inherit; }
          </style>
        </head>
        <body>
          <pre>${generatedDraft.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.id}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Pennsylvania Pleading & Motion Document Drafter
            </h1>
            <p className="text-xs text-slate-500 font-serif-body mt-0.5">
              Generates court-ready Pennsylvania pleadings, custody complaints, notices to defend, verification affidavits, and record demand letters with direct Google Docs export.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold self-start md:self-auto">
            Venue: {selectedCounty} County Court of Common Pleas
          </span>
        </div>

        {/* Template Selection Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PLEADING_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              id={`select-template-${tmpl.id}`}
              onClick={() => handleSelectTemplate(tmpl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                selectedTemplate.id === tmpl.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Inputs */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-600">
              {selectedTemplate.category}
            </span>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {selectedTemplate.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-serif-body">
              {selectedTemplate.description}
            </p>
          </div>

          <div className="space-y-3.5 pt-2 border-t border-slate-100">
            {selectedTemplate.fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <label
                  htmlFor={`pleading-field-${field.key}`}
                  className="block text-xs font-semibold text-slate-700"
                >
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    id={`pleading-field-${field.key}`}
                    rows={4}
                    placeholder={field.placeholder}
                    value={formValues[field.key] ?? field.defaultValue ?? ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-serif-body"
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={`pleading-field-${field.key}`}
                    value={formValues[field.key] ?? field.defaultValue ?? ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`pleading-field-${field.key}`}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formValues[field.key] ?? field.defaultValue ?? ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                )}
              </div>
            ))}
          </div>

          {/* AI Polishing Sub-panel */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <label
              htmlFor="custom-ai-instruction-input"
              className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Polish / Specific Fact Incorporation</span>
            </label>
            <div className="flex gap-2">
              <input
                id="custom-ai-instruction-input"
                type="text"
                placeholder="e.g., Emphasize Father's active school involvement under Factor 10..."
                value={customAiInstruction}
                onChange={(e) => setCustomAiInstruction(e.target.value)}
                className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
              <button
                id="ai-refine-pleading-btn"
                onClick={handleAiRefine}
                disabled={aiRefining}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition disabled:opacity-50"
              >
                {aiRefining ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Refine</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Formatted Legal Preview Column */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Action Ribbon */}
          <div className="bg-slate-900 text-white px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="font-display font-bold text-sm tracking-wide">
                Live Legal Pleading Preview
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Google Docs Export */}
              {onExportToGoogleDoc && (
                <button
                  onClick={() => onExportToGoogleDoc(selectedTemplate.title, generatedDraft)}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                  title="Export court pleading directly to Google Docs with user confirmation"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Google Doc</span>
                </button>
              )}

              {/* Google Drive Save */}
              {onSaveToDrive && (
                <button
                  onClick={() => onSaveToDrive(selectedTemplate.id, generatedDraft)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-300 rounded-md text-xs font-medium flex items-center gap-1 transition"
                  title="Save pleading file to Google Drive"
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Drive</span>
                </button>
              )}

              {/* TTS Listen */}
              <button
                onClick={handleToggleTts}
                disabled={ttsLoading}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1 transition ${
                  isNarrating
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
                title="Listen to pleading text via Gemini 3.8 Flash TTS"
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

              <button
                id="pleading-copy-btn"
                onClick={handleCopy}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-medium text-slate-200 flex items-center gap-1 transition"
                title="Copy full text to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                id="pleading-save-btn"
                onClick={handleSave}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-medium text-slate-200 flex items-center gap-1 transition"
                title="Save pleading to research briefcase"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                id="pleading-print-btn"
                onClick={handlePrint}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-medium text-slate-200 flex items-center gap-1 transition"
                title="Print court pleading"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                id="pleading-download-btn"
                onClick={handleDownload}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-medium text-slate-200 flex items-center gap-1 transition"
                title="Download .txt"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Document Content Box */}
          <div className="p-6 bg-slate-50 min-h-[580px]">
            <div className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 shadow-xs max-h-[640px] overflow-y-auto">
              <pre className="font-mono text-xs sm:text-[13px] leading-relaxed text-slate-900 whitespace-pre-wrap selection:bg-amber-200">
                {generatedDraft}
              </pre>
            </div>
            <p className="text-[11px] text-slate-400 font-serif-body mt-3 text-center">
              Formatted pursuant to Pennsylvania Rules of Civil Procedure 1018, 1024, and local court guidelines. Verify local filing fees with the County Prothonotary or Clerk of Judicial Records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
