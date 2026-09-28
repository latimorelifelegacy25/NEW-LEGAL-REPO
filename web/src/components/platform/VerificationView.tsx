import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  Search,
  RotateCw,
  Scale
} from 'lucide-react';
import { VerificationRun, VerificationCheck } from '../../types/platform';

interface VerificationViewProps {
  verificationRuns: VerificationRun[];
  onTriggerVerificationPass: (targetName: string, text: string) => Promise<VerificationRun>;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  verificationRuns,
  onTriggerVerificationPass
}) => {
  const [runs, setRuns] = useState<VerificationRun[]>(verificationRuns);
  const [selectedRun, setSelectedRun] = useState<VerificationRun>(verificationRuns[0] || null);
  const [testText, setTestText] = useState(
    'Under Pennsylvania law 23 Pa.C.S. § 5328, the court must evaluate 16 statutory factors with weighted consideration for child safety. Furthermore, under 42 Pa.C.S. § 5524, tort and negligence lawsuits are subject to a 2-year limitation period subject to the Discovery Rule under Fine v. Checcio.'
  );
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRunPass = async () => {
    if (!testText.trim() || isVerifying) return;
    setIsVerifying(true);
    try {
      const newRun = await onTriggerVerificationPass('Custom Legal Draft', testText);
      setRuns((prev) => [newRun, ...prev]);
      setSelectedRun(newRun);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                Independent Verification Center (SPEC-004 & SPEC-006)
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-serif-body mt-1">
              Verification Agent conducts adversarial citation checks, validates every factual assertion against primary evidence, and blocks finalization if unsupported assertions exist.
            </p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 self-start sm:self-auto font-bold">
            Hard Boundary: Cannot Approve Itself
          </span>
        </div>
      </div>

      {/* Interactive Verification Pass Trigger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Execute Adversarial Accuracy Verification Pass
        </h2>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-400">
            Target Text / Pleading Averment for Factual & Citation Validation:
          </label>
          <textarea
            rows={3}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500 font-serif-body leading-relaxed"
          />
        </div>

        <button
          type="button"
          onClick={handleRunPass}
          disabled={isVerifying}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
        >
          {isVerifying ? <RotateCw className="w-4 h-4 animate-spin" /> : <FileCheck2 className="w-4 h-4" />}
          <span>Run Adversarial Verification Pass</span>
        </button>
      </div>

      {/* Runs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Verification Runs History */}
        <div className="lg:col-span-5 space-y-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Verification Run Reports:
          </span>

          <div className="space-y-2.5">
            {runs.map((r) => {
              const isSelected = selectedRun?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRun(r)}
                  className={`p-4 rounded-xl border cursor-pointer transition text-xs space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/80 ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{r.targetName}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        r.status === 'VERIFIED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Type: {r.targetType} &bull; Unsupported Assertions: <strong className="text-amber-400">{r.unsupportedAssertionsCount}</strong>
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{r.checks.length} Assertion Checks</span>
                    <span>{new Date(r.verifiedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Check Inspector */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          {selectedRun ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">
                    Target: {selectedRun.targetType}
                  </span>
                  <h3 className="text-base font-bold text-white">{selectedRun.targetName}</h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Verified at {new Date(selectedRun.verifiedAt).toLocaleString()}
                  </span>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                    selectedRun.status === 'VERIFIED'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}
                >
                  {selectedRun.status}
                </span>
              </div>

              {/* Checks Detailed List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                  Individual Assertion Audits ({selectedRun.checks.length}):
                </span>

                <div className="space-y-2">
                  {selectedRun.checks.map((chk) => (
                    <div
                      key={chk.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {chk.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-200">{chk.name}</span>
                        </div>

                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {chk.severity}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 pl-6 font-serif-body leading-relaxed">
                        {chk.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Select a verification run to view assertion audits.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
