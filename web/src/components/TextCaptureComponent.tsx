import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Clipboard,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  RefreshCw,
  X,
  FileCode,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { SACParagraph, MatterDocument } from '../types/matter';

export interface ParsedDocumentPayload {
  paragraphs: SACParagraph[];
  sourceDoc: MatterDocument;
  rawText: string;
  detectedTitle: string;
  detectedDocket: string;
  detectedCourt: string;
  citedExhibits: string[];
  anomaliesCount: number;
}

interface TextCaptureComponentProps {
  onDocumentParsed: (payload: ParsedDocumentPayload) => void;
  docketNumber: string;
  className?: string;
  isCompact?: boolean;
  onCancel?: () => void;
}

export const TextCaptureComponent: React.FC<TextCaptureComponentProps> = ({
  onDocumentParsed,
  docketNumber,
  className = '',
  isCompact = false,
  onCancel
}) => {
  const [activeMode, setActiveMode] = useState<'paste' | 'camera'>('paste');
  const [pastedText, setPastedText] = useState<string>('');
  const [capturedImageBase64, setCapturedImageBase64] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>('Second Amended Complaint (Pleading)');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stop camera stream when switching away from camera mode
  useEffect(() => {
    if (activeMode !== 'camera') {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeMode]);

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
      console.warn('Camera stream error:', err);
      setCameraError('Camera access unavailable or declined. Please paste text directly or drag in an image file.');
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

  const capturePhotoSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImageBase64(base64);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImageBase64(null);
    startCamera();
  };

  // Clipboard Paste Event Listener (supports clipboard text, pasted files, and pasted images)
  const handleContainerPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    // 1. Check if files or screenshot images were pasted
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (event) => {
          const b64 = event.target?.result as string;
          setCapturedImageBase64(b64);
          setActiveMode('camera');
          setPasteNotice(`Pasted image screenshot "${file.name || 'clipboard-image.png'}" ready for parsing.`);
          setTimeout(() => setPasteNotice(null), 4000);
        };
        reader.readAsDataURL(file);
        return;
      } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setPastedText(content);
          setPasteNotice(`Pasted text file "${file.name}".`);
          setTimeout(() => setPasteNotice(null), 4000);
        };
        reader.readAsText(file);
        return;
      }
    }

    // 2. Fallback to clipboard text
    const textData = e.clipboardData.getData('text');
    if (textData && textData.length > 20) {
      setPasteNotice(`Pasted ${textData.length} characters of legal text.`);
      setTimeout(() => setPasteNotice(null), 3500);
    }
  }, []);

  // Drag and Drop File Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const b64 = event.target?.result as string;
          setCapturedImageBase64(b64);
          setActiveMode('camera');
          setPasteNotice(`Dropped image file "${file.name}".`);
          setTimeout(() => setPasteNotice(null), 4000);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setPastedText(content);
          setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
          setPasteNotice(`Loaded file "${file.name}".`);
          setTimeout(() => setPasteNotice(null), 4000);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const b64 = event.target?.result as string;
        setCapturedImageBase64(b64);
        setActiveMode('camera');
        setPasteNotice(`Selected image "${file.name}".`);
        setTimeout(() => setPasteNotice(null), 4000);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setPastedText(content);
        setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsText(file);
    }
  };

  const handleInitiateParsing = async () => {
    if (!pastedText.trim() && !capturedImageBase64) {
      alert('Please paste document text, drop a file, or capture a photo first.');
      return;
    }

    setIsProcessing(true);
    let extractedText = pastedText;
    let paragraphs: SACParagraph[] = [];
    let detectedCourt = 'Court of Common Pleas of Schuylkill County, Pennsylvania';
    let detectedDocketId = docketNumber || 'S-1214-2026';
    let citedExhibitsList: string[] = [];
    let anomalies = 0;

    try {
      const response = await fetch('/api/legal-ai/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pastedText,
          imageBase64: capturedImageBase64,
          documentTitle
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.paragraphs && data.paragraphs.length > 0) {
          paragraphs = data.paragraphs;
          extractedText = data.rawText || pastedText;
          detectedCourt = data.metadata?.detectedCourt || detectedCourt;
          detectedDocketId = data.metadata?.detectedDocket || detectedDocketId;
          citedExhibitsList = data.metadata?.citedExhibits || [];
          anomalies = data.immediateIssues?.length || 0;
        }
      }
    } catch (err) {
      console.warn('Backend parse route error, using local parsing:', err);
    }

    // Local deterministic parsing fallback if needed
    if (paragraphs.length === 0 && extractedText.trim()) {
      const rawChunks = extractedText.split(/\n(?=\s*(?:¶\s*)?\d+[\.\)]\s+)/g);
      const exhibits = new Set<string>();
      let sec: any = 'FACTS';

      rawChunks.forEach((chunk, idx) => {
        const line = chunk.trim();
        if (!line) return;
        const numMatch = line.match(/^(?:¶\s*)?(\d+)[\.\)]\s*([\s\S]*)$/);
        const pNum = numMatch ? parseInt(numMatch[1], 10) : idx + 1;
        const pText = numMatch ? numMatch[2].trim() : line;

        if (pText.match(/COUNT\s+[IVXLCDM]+/i)) sec = 'COUNT_I';
        else if (pText.toLowerCase().includes('plaintiff') && pNum <= 5) sec = 'PARTIES';

        const exMatches = Array.from(pText.matchAll(/(?:Exhibit|Ex\.)\s+([A-Z])/gi));
        const citedExhibits = exMatches.map((m) => {
          const letter = m[1].toUpperCase();
          exhibits.add(letter);
          return { exhibitLetter: letter };
        });

        paragraphs.push({
          number: pNum,
          section: sec,
          text: pText,
          originalText: pText,
          citedExhibits,
          citedStatutes: []
        });
      });

      citedExhibitsList = Array.from(exhibits);
    }

    setIsProcessing(false);

    if (paragraphs.length === 0) {
      alert('Could not detect numbered paragraphs. Please verify document formatting and try again.');
      return;
    }

    // Construct source document metadata
    const sourceDoc: MatterDocument = {
      id: `doc-sac-captured-${Date.now()}`,
      title: documentTitle || 'Second Amended Complaint (Captured Source)',
      type: 'PLEADING',
      date: new Date().toISOString().split('T')[0],
      status: 'ORIGINAL_SOURCE_IMMUTABLE',
      isOriginalSAC: true,
      fileSizeBytes: extractedText.length || 45000,
      content: extractedText,
      notes: 'Captured via TextCaptureComponent (Camera/Paste). Initial parsing completed.'
    };

    // Dispatch payload to initiate MatterWorkspace SAC review workflow
    onDocumentParsed({
      paragraphs,
      sourceDoc,
      rawText: extractedText,
      detectedTitle: documentTitle,
      detectedDocket: detectedDocketId,
      detectedCourt,
      citedExhibits: citedExhibitsList,
      anomaliesCount: anomalies
    });
  };

  return (
    <div
      ref={containerRef}
      onPaste={handleContainerPaste}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white border rounded-2xl shadow-md transition-all ${
        dragActive ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50/20' : 'border-slate-200'
      } ${className}`}
    >
      {/* Component Header with Mode Tabs */}
      <div className="bg-slate-900 text-white px-5 py-4 rounded-t-2xl border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Clipboard className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-display font-bold text-white tracking-wide">
                TextCaptureComponent
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Pasting & Camera OCR
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-serif-body">
              Supports file pasting (Ctrl+V), drag-and-drop, raw text, and live camera snapshot capture.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('paste')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeMode === 'paste'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>File & Text Pasting</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('camera');
              startCamera();
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeMode === 'camera'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Capture</span>
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {pasteNotice && (
        <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{pasteNotice}</span>
        </div>
      )}

      {/* Main Body */}
      <div className="p-5 space-y-4">
        {/* CAMERA MODE */}
        {activeMode === 'camera' && (
          <div className="space-y-3">
            <div className="bg-slate-950 rounded-xl overflow-hidden relative min-h-[300px] flex items-center justify-center border border-slate-800">
              {capturedImageBase64 ? (
                <div className="relative w-full flex flex-col items-center">
                  <img
                    src={capturedImageBase64}
                    alt="Captured Pleading"
                    className="max-h-[340px] object-contain rounded-lg shadow-md"
                  />
                  <div className="absolute bottom-3 flex items-center gap-3 bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-700 backdrop-blur-xs">
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Snapshot Ready for OCR
                    </span>
                    <button
                      onClick={retakePhoto}
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
                    className={`w-full max-h-[340px] object-contain bg-black ${cameraActive ? 'block' : 'hidden'}`}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {!cameraActive && (
                    <div className="p-8 text-center text-slate-400 space-y-3">
                      <Camera className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                      <p className="text-xs max-w-sm">
                        {cameraError || 'Allow camera access to capture physical pleading pages for parsing.'}
                      </p>
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-xs"
                      >
                        Enable Camera
                      </button>
                    </div>
                  )}

                  {cameraActive && (
                    <div className="absolute inset-x-0 bottom-4 flex justify-center">
                      <button
                        onClick={capturePhotoSnapshot}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full text-xs shadow-lg flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Capture Document Snapshot</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Supports live camera feed or clipboard paste of screenshot (Ctrl+V)</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-amber-700 hover:text-amber-800 underline font-medium"
              >
                Upload image file instead
              </button>
            </div>
          </div>
        )}

        {/* FILE & TEXT PASTING MODE */}
        {activeMode === 'paste' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clipboard className="w-3.5 h-3.5 text-amber-600" />
                <span>Paste Pleading Text or Drop Document Files</span>
              </label>

              <div className="flex items-center gap-2">
                

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 ml-2"
                >
                  <Upload className="w-3 h-3" />
                  <span>Browse File</span>
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".txt,.docx,.pdf,.png,.jpg,.jpeg"
              className="hidden"
            />

            <div className="relative">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={isCompact ? 6 : 9}
                placeholder="Paste pleading text directly here, or press Ctrl+V to paste copied files/screenshots. Text will be parsed into numbered factual allegations (¶ 1 to ¶ 45+) and substantive counts..."
                className="w-full p-4 text-xs font-mono leading-relaxed bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-mono selection:bg-amber-500 selection:text-slate-950"
              />
              {pastedText && (
                <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-400 bg-white/90 px-2 py-0.5 rounded border border-slate-200">
                  {pastedText.length} characters
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document Classification & Parse Action Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-sm">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Document Designation:
            </label>
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pastedText && (
              <button
                type="button"
                onClick={() => setPastedText('')}
                className="px-3 py-2 text-xs text-slate-500 hover:text-rose-600 transition"
                title="Clear text"
              >
                Clear
              </button>
            )}

            <button
              id="btn-initiate-parsing"
              type="button"
              onClick={handleInitiateParsing}
              disabled={isProcessing || (!pastedText.trim() && !capturedImageBase64)}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs transition"
              title="Parse document into numbered paragraphs and initiate SAC review workflow"
            >
              {isProcessing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              <span>{isProcessing ? 'Parsing Pleading...' : 'Initiate SAC Review Workflow'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
