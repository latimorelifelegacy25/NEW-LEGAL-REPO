import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileDiff,
  Shield,
  Clock,
  ArrowRight,
  User,
  Check
} from 'lucide-react';
import { ApprovalRequest } from '../../types/platform';

interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  onDecideApproval: (id: string, decision: 'approved' | 'rejected', note?: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ approvals, onDecideApproval }) => {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest>(approvals[0] || null);
  const [decisionNote, setDecisionNote] = useState('');

  const pendingList = approvals.filter((a) => a.status === 'pending');
  const historyList = approvals.filter((a) => a.status !== 'pending');

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'HIGH':
        return 'bg-orange-950 text-orange-300 border-orange-800';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-blue-950 text-blue-300 border-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" />
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                Human-in-the-Loop Approval Center (SPEC-003 & SPEC-006)
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-serif-body mt-1">
              Safety UI requirement: Inspect proposed consequential mutations, reviews before/proposed diffs, assess risk level, and authorize or reject actions before execution.
            </p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 self-start sm:self-auto font-bold">
            Pending Gates: {pendingList.length}
          </span>
        </div>
      </div>

      {/* Grid: Pending Queue vs Diff Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Approvals Queue */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Pending Action Authorization Queue:
          </span>

          {pendingList.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-200">No Pending Approvals</p>
              <p className="text-xs text-slate-500 font-serif-body">
                All autonomous workflow steps have passed verification or been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingList.map((appr) => {
                const isSelected = selectedApproval?.id === appr.id;
                return (
                  <div
                    key={appr.id}
                    onClick={() => setSelectedApproval(appr)}
                    className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                      isSelected
                        ? 'bg-slate-900 border-rose-500/80 ring-1 ring-rose-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{appr.actionName}</span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${getRiskBadge(appr.riskLevel)}`}>
                        {appr.riskLevel}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-serif-body line-clamp-2">
                      {appr.description}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Requested by: {appr.requestedBy}</span>
                      <span className="font-mono">{new Date(appr.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Diff Inspector & Decision Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          {selectedApproval ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedApproval.actionName}</h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${getRiskBadge(selectedApproval.riskLevel)}`}>
                      {selectedApproval.riskLevel} RISK
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Tool Class: <strong className="text-amber-400">{selectedApproval.toolClass}</strong> &bull; Requested: {new Date(selectedApproval.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-serif-body leading-relaxed">
                {selectedApproval.description}
              </div>

              {/* Before vs Proposed State Diff (SPEC-006 Safety UI Requirement) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <FileDiff className="w-4 h-4 text-amber-500" />
                  State Mutation Comparison (Before vs Proposed):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-rose-400 font-bold block text-[10px] uppercase">Current / Before State</span>
                    <pre className="text-[11px] text-slate-400 overflow-x-auto max-h-36">
                      {JSON.stringify(selectedApproval.beforeState, null, 2)}
                    </pre>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold block text-[10px] uppercase">Proposed Mutation State</span>
                    <pre className="text-[11px] text-emerald-300 overflow-x-auto max-h-36">
                      {JSON.stringify(selectedApproval.proposedState, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Decision Action Form */}
              {selectedApproval.status === 'pending' ? (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">
                      Authorization Note / Reason:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Verified with client retainer; custody averments verified under § 5328."
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => onDecideApproval(selectedApproval.id, 'rejected', decisionNote)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Reject Action</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDecideApproval(selectedApproval.id, 'approved', decisionNote)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Execute</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    Decision: <strong className="uppercase text-amber-400">{selectedApproval.status}</strong>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Decided at {selectedApproval.decidedAt && new Date(selectedApproval.decidedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Select an approval request to inspect proposed mutation diffs and risk metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
