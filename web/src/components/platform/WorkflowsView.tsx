import React, { useState } from 'react';
import {
  Workflow,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  FileText,
  Layers,
  ArrowRight,
  Shield,
  RotateCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  WorkflowDefinition,
  WorkflowRun,
  WorkflowRunStep
} from '../../types/platform';

interface WorkflowsViewProps {
  workflowDefs: WorkflowDefinition[];
  runs: WorkflowRun[];
  onTriggerRun: (workflowId: string) => void;
  onNavigateToApprovals: (approvalId?: string) => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  workflowDefs,
  runs,
  onTriggerRun,
  onNavigateToApprovals
}) => {
  const [selectedRun, setSelectedRun] = useState<WorkflowRun>(runs[0] || null);
  const [selectedStep, setSelectedStep] = useState<WorkflowRunStep | null>(
    runs[0]?.steps[runs[0]?.currentStepIndex] || null
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-amber-500" />
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                Controlled Workflow Engine (SPEC-003)
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-serif-body mt-1">
              Deterministic, typed workflow execution state machine. Models cannot mutate systems directly—all actions traverse policy validation, verification gates, and human approval steps.
            </p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 self-start sm:self-auto">
            Execution States: 8 Formally Verified
          </span>
        </div>
      </div>

      {/* Available Workflow Definitions Catalog */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Registered Canonical Workflows:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {workflowDefs.map((def) => (
            <div
              key={def.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {def.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">v{def.version}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">{def.name}</h3>
                <p className="text-xs text-slate-400 font-serif-body line-clamp-2 leading-relaxed">
                  {def.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">{def.steps.length} Bounded Steps</span>
                <button
                  type="button"
                  onClick={() => onTriggerRun(def.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Execute</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Runs and Step Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Runs List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Active Runs & Historical Execution:
          </span>
          <div className="space-y-2.5">
            {runs.map((r) => {
              const isSelected = selectedRun?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRun(r);
                    setSelectedStep(r.steps[r.currentStepIndex] || r.steps[0] || null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/80 ring-1 ring-amber-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{r.workflowName}</span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            r.status === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : r.status === 'WAITING_FOR_APPROVAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Run ID: {r.id} &bull; Started {new Date(r.startedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>

                  {/* Progress info */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Current: <strong>{r.steps[r.currentStepIndex]?.name || 'Finished'}</strong>
                    </span>
                    <span>
                      {r.currentStepIndex + 1}/{r.steps.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Step Timeline & Artifact Viewer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          {selectedRun ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedRun.workflowName}</span>
                    <span className="text-xs font-mono text-slate-400">({selectedRun.id})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Workspace: <span className="font-semibold text-amber-400">{selectedRun.workspaceId}</span>
                  </p>
                </div>
                <span
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg font-bold ${
                    selectedRun.status === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : selectedRun.status === 'WAITING_FOR_APPROVAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-blue-950 text-blue-300 border border-blue-700'
                  }`}
                >
                  {selectedRun.status}
                </span>
              </div>

              {/* Step Timeline */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                  Deterministic Step Execution Graph:
                </span>
                <div className="space-y-2">
                  {selectedRun.steps.map((st, idx) => {
                    const isStepSelected = selectedStep?.id === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStep(st)}
                        className={`p-3 rounded-xl border cursor-pointer transition text-xs flex items-center justify-between gap-3 ${
                          isStepSelected
                            ? 'bg-slate-800 border-amber-500/80 text-white'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-[10px] font-mono">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold block">{st.name}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-mono">
                              Type: {st.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {st.status === 'completed' && (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Done</span>
                            </span>
                          )}
                          {st.status === 'waiting_approval' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToApprovals(st.approvalRequestId);
                              }}
                              className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold flex items-center gap-1 animate-pulse"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Requires Approval</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Step Inspector */}
              {selectedStep && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 uppercase tracking-wide text-[11px]">
                      Step Inspector: {selectedStep.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{selectedStep.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Input Payload</span>
                      <pre className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto text-slate-300 max-h-32">
                        {JSON.stringify(selectedStep.input, null, 2)}
                      </pre>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Output Payload</span>
                      <pre className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto text-slate-300 max-h-32">
                        {JSON.stringify(selectedStep.output, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Artifacts Section */}
              {selectedRun.artifacts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                    Generated Verified Artifacts ({selectedRun.artifacts.length}):
                  </span>
                  {selectedRun.artifacts.map((art) => (
                    <div
                      key={art.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{art.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                          {art.status}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-slate-400 line-clamp-3 bg-slate-900 p-2 rounded">
                        {art.content}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="truncate max-w-xs">SHA-256: {art.sha256}</span>
                        <span>Model: {art.provenance.modelOrTool}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Select a workflow run from the queue to view real-time state machine execution.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
