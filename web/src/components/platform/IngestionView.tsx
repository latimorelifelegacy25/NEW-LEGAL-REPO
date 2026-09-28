import React, { useState } from 'react';
import {
  FileCode,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Lock,
  FileSpreadsheet,
  Package,
  Layers,
  RotateCw,
  Clock
} from 'lucide-react';
import { PackageImport } from '../../types/platform';

interface IngestionViewProps {
  imports: PackageImport[];
  onSimulateIngest: (filename: string, fileType?: string) => Promise<PackageImport>;
}

export const IngestionView: React.FC<IngestionViewProps> = ({ imports, onSimulateIngest }) => {
  const [selectedFilename, setSelectedFilename] = useState('pennsylvania_custody_v4.zip');
  const [fileTypePreset, setFileTypePreset] = useState<'safe_zip' | 'macro_xlsm' | 'traversal_tar'>('safe_zip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestedPackages, setIngestedPackages] = useState<PackageImport[]>(imports);

  const handleTestIngestion = async () => {
    setIsProcessing(true);
    let nameToTest = selectedFilename;
    if (fileTypePreset === 'macro_xlsm') nameToTest = 'case_settlement_ledger.xlsm';
    if (fileTypePreset === 'traversal_tar') nameToTest = 'malicious_tar_escape.tar.gz';

    try {
      const result = await onSimulateIngest(nameToTest, fileTypePreset);
      setIngestedPackages((prev) => [result, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                Safe Ingestion Pipeline & Quarantine Vault (SPEC-002)
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-serif-body mt-1">
              Preserves immutable originals by SHA-256 fingerprint, performs deep MIME extraction, detects path traversal attempts, and preserves XLSM files with macro execution permanently disabled.
            </p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-blue-400 self-start sm:self-auto">
            Zero-Trust Ingestion Engine
          </span>
        </div>
      </div>

      {/* Interactive Ingestion Pipeline Tester */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-400" />
          Simulate Incoming Package Ingestion (SPEC-002 Pipeline)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setFileTypePreset('safe_zip');
              setSelectedFilename('pennsylvania_custody_v4.zip');
            }}
            className={`p-3 rounded-xl border text-left text-xs space-y-1 transition ${
              fileTypePreset === 'safe_zip'
                ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="font-bold block text-white">1. Safe ZIP Archive</span>
            <span className="text-[11px]">Normal skills archive with SKILL.md and text references.</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFileTypePreset('macro_xlsm');
              setSelectedFilename('case_settlement_ledger.xlsm');
            }}
            className={`p-3 rounded-xl border text-left text-xs space-y-1 transition ${
              fileTypePreset === 'macro_xlsm'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="font-bold block text-white">2. XLSM Macro Spreadsheet</span>
            <span className="text-[11px]">Macro execution permanently disabled while preserving binary.</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFileTypePreset('traversal_tar');
              setSelectedFilename('malicious_tar_escape.tar.gz');
            }}
            className={`p-3 rounded-xl border text-left text-xs space-y-1 transition ${
              fileTypePreset === 'traversal_tar'
                ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="font-bold block text-white">3. Path Traversal Threat</span>
            <span className="text-[11px]">Relative traversal (../) automatically isolated to Quarantine Vault.</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={selectedFilename}
            onChange={(e) => setSelectedFilename(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleTestIngestion}
            disabled={isProcessing}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition disabled:opacity-50 shrink-0"
          >
            {isProcessing ? <RotateCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Execute Ingestion Pipeline</span>
          </button>
        </div>
      </div>

      {/* Package History & Quarantine Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Ingested Package Records & Quarantine Vault:
        </h3>

        <div className="space-y-3">
          {ingestedPackages.map((pkg) => {
            const isQuarantined = pkg.status === 'quarantined';
            const isVba = pkg.securityScan.vbaMacroDetected;

            return (
              <div
                key={pkg.id}
                className={`p-4 rounded-xl border text-xs space-y-3 ${
                  isQuarantined
                    ? 'bg-rose-950/20 border-rose-900/60'
                    : isVba
                    ? 'bg-amber-950/20 border-amber-900/60'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm font-mono">{pkg.filename}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          isQuarantined
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {pkg.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {(pkg.fileSizeBytes / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Type: {pkg.detectedType} &bull; Extracted Files: {pkg.extractedFilesCount}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono self-start sm:self-auto">
                    {new Date(pkg.importedAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Quarantine reason if present */}
                {pkg.securityScan.quarantineReason && (
                  <div
                    className={`p-2.5 rounded-lg border text-[11px] flex items-start gap-2 ${
                      isQuarantined
                        ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                        : 'bg-amber-950/40 border-amber-800 text-amber-300'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{pkg.securityScan.quarantineReason}</span>
                  </div>
                )}

                {/* SHA-256 Provenance Fingerprint */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono flex-wrap gap-2">
                  <span className="truncate max-w-md">
                    SHA-256: <strong className="text-slate-300">{pkg.sha256}</strong>
                  </span>
                  <span>Audit ID: {pkg.auditEventId}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
