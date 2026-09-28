import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Clipboard,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Eye,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Maximize2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { SACParagraph, MatterDocument } from '../types/matter';

interface DocumentCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSAC: (
    paragraphs: SACParagraph[],
    sourceDoc: MatterDocument,
    detectedTitle?: string
  ) => void;
  onAddExhibit: (newExhibit: MatterDocument) => void;
  docketNumber: string;
}

export const DocumentCaptureModal: React.FC<DocumentCaptureModalProps> = ({
  isOpen,
  onClose,
  onImportSAC,
  onAddExhibit,
  docketNumber
}) => {
  const [captureMode, setCaptureMode] = useState<'camera' | 'paste'>('paste');
  const [pastedText, setPastedText] = useState<string>('');
  const [capturedImageBase64, setCapturedImageBase64] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Parsing result state
  const [parsedParagraphs, setParsedParagraphs] = useState<SACParagraph[]>([]);
  const [detectedTitle, setDetectedTitle] = useState<string>('Second Amended Complaint (Pleading)');
  const [detectedDocket, setDetectedDocket] = useState<string>(docketNumber || 'S-1214-2026');
  const [detectedCourt, setDetectedCourt] = useState<string>('Court of Common Pleas of Schuylkill County, Pennsylvania');
  const [citedExhibitsFound, setCitedExhibitsFound] = useState<string[]>([]);
  const [detectedIssues, setDetectedIssues] = useState<{ category: string; text: string }[]>([]);
  const [hasParsed, setHasParsed] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when closing or switching mode
  useEffect(() => {
    if (!isOpen || captureMode !== 'camera') {
      stopCamera();
    }
  }, [isOpen, captureMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access not available or blocked by browser permissions. You can paste the document text directly or select an image file below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImageBase64(base64);
      stopCamera();
    }
  };

  const retakeSnapshot = () => {
    setCapturedImageBase64(null);
    setHasParsed(false);
    startCamera();
  };

  // Perform initial parsing via API or client-side fallback
  const handleParseDocument = async () => {
    if (!pastedText.trim() && !capturedImageBase64) {
      alert('Please paste document text or capture a photo first.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/legal-ai/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pastedText,
          imageBase64: capturedImageBase64,
          documentTitle: detectedTitle
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.paragraphs && data.paragraphs.length > 0) {
          setParsedParagraphs(data.paragraphs);
          setDetectedDocket(data.metadata?.detectedDocket || docketNumber);
          setDetectedCourt(data.metadata?.detectedCourt || 'Court of Common Pleas of Schuylkill County');
          setCitedExhibitsFound(data.metadata?.citedExhibits || []);
          if (data.immediateIssues) {
            setDetectedIssues(
              data.immediateIssues.map((iss: any) => ({
                category: iss.category,
                text: iss.detectedIssue
              }))
            );
          }
          if (data.rawText && !pastedText) {
            setPastedText(data.rawText);
          }
          setHasParsed(true);
          return;
        }
      }
    } catch (apiErr) {
      console.warn('API parsing unavailable, using client-side parser:', apiErr);
    } finally {
      setIsProcessing(false);
    }

    // Client-side fallback regex parser
    parseClientSide(pastedText);
    setIsProcessing(false);
  };

  const parseClientSide = (raw: string) => {
    if (!raw.trim()) return;
    const rawChunks = raw.split(/\n(?=\s*(?:¶\s*)?\d+[\.\)]\s+)/g);
    const parsed: SACParagraph[] = [];
    const exhibits = new Set<string>();

    let currentSec: any = 'FACTS';

    rawChunks.forEach((chunk, idx) => {
      const text = chunk.trim();
      if (!text) return;
      const numMatch = text.match(/^(?:¶\s*)?(\d+)[\.\)]\s*([\s\S]*)$/);
      const num = numMatch ? parseInt(numMatch[1], 10) : idx + 1;
      const content = numMatch ? numMatch[2].trim() : text;

      if (content.match(/COUNT\s+[IVXLCDM]+/i)) {
        currentSec = 'COUNT_I';
      } else if (content.toLowerCase().includes('plaintiff') && num <= 5) {
        currentSec = 'PARTIES';
      }

      const exMatches = Array.from(content.matchAll(/(?:Exhibit|Ex\.)\s+([A-Z])/gi));
      const citedExhibits = exMatches.map((m) => {
        const letter = m[1].toUpperCase();
        exhibits.add(letter);
        return { exhibitLetter: letter };
      });

      parsed.push({
        number: num,
        section: currentSec,
        text: content,
        originalText: content,
        citedExhibits,
        citedStatutes: []
      });
    });

    setParsedParagraphs(parsed);
    setCitedExhibitsFound(Array.from(exhibits));
    setHasParsed(true);
  };

  const handleConfirmImportAsSAC = () => {
    if (parsedParagraphs.length === 0) {
      alert('No parsed paragraphs found. Please click "Parse Document & Audit Structure" first.');
      return;
    }

    const sourceDoc: MatterDocument = {
      id: `doc-sac-imported-${Date.now()}`,
      title: detectedTitle || 'Second Amended Complaint (Parsed Intake)',
      type: 'PLEADING',
      date: new Date().toISOString().split('T')[0],
      status: 'ORIGINAL_SOURCE_IMMUTABLE',
      isOriginalSAC: true,
      fileSizeBytes: (pastedText.length || 50000),
      content: pastedText,
      notes: 'Imported via Document Camera & Paste Capture. Ready for side-by-side verification review.'
    };

    onImportSAC(parsedParagraphs, sourceDoc, detectedTitle);
    onClose();
  };

  const handleConfirmImportAsExhibit = () => {
    const nextLetter = String.fromCharCode(65 + citedExhibitsFound.length);
    const newExhibit: MatterDocument = {
      id: `doc-exhibit-${nextLetter.toLowerCase()}-${Date.now()}`,
      title: detectedTitle.includes('Exhibit') ? detectedTitle : `Exhibit ${nextLetter} - Supplemental Captured Record`,
      type: 'EXHIBIT',
      exhibitLetter: nextLetter,
      date: new Date().toISOString().split('T')[0],
      status: 'ORIGINAL_SOURCE_IMMUTABLE',
      fileSizeBytes: (pastedText.length || 20000),
      content: pastedText,
      notes: 'Captured via camera/paste and held in the current browser session.'
    };

    onAddExhibit(newExhibit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-bold text-white tracking-wide">
                  Document Capture & Initial Parser
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 border border-emerald-700 text-emerald-300">
                  Private Client Vault
                </span>
              </div>
              <p className="text-xs text-slate-400 font-serif-body">
                Capture legal pleadings or exhibits via device camera or paste text for structured paragraph parsing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCaptureMode('paste');
                stopCamera();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                captureMode === 'paste'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste Text / Pleading</span>
            </button>

            <button
              onClick={() => {
                setCaptureMode('camera');
                startCamera();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                captureMode === 'camera'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Capture</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Target Docket: <strong className="text-slate-800">{docketNumber}</strong>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* CAMERA CAPTURE MODE */}
          {captureMode === 'camera' && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-xl overflow-hidden relative min-h-[340px] flex items-center justify-center border border-slate-800">
                {capturedImageBase64 ? (
                  <div className="relative w-full flex flex-col items-center">
                    <img
                      src={capturedImageBase64}
                      alt="Captured Document"
                      className="max-h-[380px] object-contain rounded-lg shadow-md"
                    />
                    <div className="absolute bottom-3 flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-full backdrop-blur-xs">
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Photo Captured
                      </span>
                      <button
                        onClick={retakeSnapshot}
                        className="text-xs text-white hover:text-amber-400 underline font-medium flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Retake
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full flex flex-col items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      className={`w-full max-h-[380px] object-contain bg-black ${cameraActive ? 'block' : 'hidden'}`}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {!cameraActive && (
                      <div className="p-8 text-center text-slate-400 space-y-3">
                        <Camera className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                        <p className="text-xs max-w-sm">
                          {cameraError || 'Click below to activate device camera and scan legal documents.'}
                        </p>
                        <button
                          onClick={startCamera}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-xs"
                        >
                          Enable Device Camera
                        </button>
                      </div>
                    )}

                    {cameraActive && (
                      <div className="absolute inset-x-0 bottom-4 flex justify-center">
                        <button
                          onClick={takeSnapshot}
                          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full text-xs shadow-lg flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Capture Page Snapshot</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASTE TEXT MODE */}
          {captureMode === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Paste Legal Complaint or Exhibit Text
                </label>
                
              </div>

              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={10}
                placeholder="Paste verbatim legal text, numbered paragraphs (¶ 1, ¶ 2...), case caption, or exhibit text..."
                className="w-full p-4 text-xs font-mono leading-relaxed bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          )}

          {/* Document Title & Parsing Action */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Document Classification Title:
              </label>
              <input
                type="text"
                value={detectedTitle}
                onChange={(e) => setDetectedTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={handleParseDocument}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs transition shrink-0 self-end sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Transcribing & Parsing...' : 'Parse Document & Audit Structure'}</span>
            </button>
          </div>

          {/* PARSING RESULTS PREVIEW */}
          {hasParsed && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Initial Parsing Completed ({parsedParagraphs.length} Paragraphs Extracted)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 font-mono font-bold border border-blue-200">
                    Docket: {detectedDocket}
                  </span>
                </div>
              </div>

              {/* Detected Metadata Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Extracted Allegations</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{parsedParagraphs.length} Paragraphs</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Cited Exhibits</span>
                  <span className="text-sm font-bold text-blue-900 font-mono">
                    {citedExhibitsFound.length > 0 ? citedExhibitsFound.map((e) => `Ex. ${e}`).join(', ') : 'None detected'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Structural Anomalies</span>
                  <span className={`text-sm font-bold font-mono ${detectedIssues.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {detectedIssues.length} Anomaly Flags
                  </span>
                </div>
              </div>

              {/* Parsed Paragraph Preview List */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50">
                {parsedParagraphs.slice(0, 10).map((p, idx) => (
                  <div key={`parsed-para-${p.number}-${idx}`} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded">
                        ¶ {p.number}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{p.section}</span>
                    </div>
                    <p className="text-slate-700 font-serif-body leading-relaxed">{p.text}</p>
                  </div>
                ))}
                {parsedParagraphs.length > 10 && (
                  <div className="p-2 text-center text-xs text-slate-400 italic">
                    ...and {parsedParagraphs.length - 10} more parsed paragraphs ready for import
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-serif-body">
            Private client data remains secured within local browser storage / Firestore container.
          </span>

          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-lg text-xs transition"
            >
              Cancel
            </button>

            {hasParsed && (
              <>
                <button
                  onClick={handleConfirmImportAsExhibit}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs transition"
                  title="Attach this document as a matter exhibit"
                >
                  Save as Case Exhibit
                </button>

                <button
                  id="btn-confirm-import-sac"
                  onClick={handleConfirmImportAsSAC}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition"
                  title="Import into S-1214-2026 to launch side-by-side verification and review report"
                >
                  <span>Import as Active Second Amended Complaint (SAC)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
