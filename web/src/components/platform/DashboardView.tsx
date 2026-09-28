import React from 'react';
import {
  Activity,
  Workflow,
  Bot,
  Package,
  Lock,
  FileCheck2,
  Shield,
  Layers,
  Play,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Globe,
  Database
} from 'lucide-react';
import {
  Workspace,
  AgentManifest,
  WorkflowRun,
  ApprovalRequest,
  AuditEvent,
  GlobalKillSwitch
} from '../../types/platform';

interface DashboardViewProps {
  currentWorkspace: Workspace;
  workflowRuns: WorkflowRun[];
  agents: AgentManifest[];
  pendingApprovals: ApprovalRequest[];
  auditEvents: AuditEvent[];
  killSwitch: GlobalKillSwitch;
  onNavigate: (tab: string) => void;
  onTriggerWorkflow: (workflowId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentWorkspace,
  workflowRuns,
  agents,
  pendingApprovals,
  auditEvents,
  killSwitch,
  onNavigate,
  onTriggerWorkflow
}) => {
  const activeRunsCount = workflowRuns.filter((r) => r.status === 'RUNNING' || r.status === 'WAITING_FOR_APPROVAL').length;
  const completedRunsCount = workflowRuns.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Hero: Operating Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Operating Context: {currentWorkspace.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Workspace ID: {currentWorkspace.id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              Unified AI Operating Platform Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-serif-body leading-relaxed">
              Deterministic substrate for autonomous agent execution, immutable SHA-256 provenance, verification gates, and Google Workspace integrations under zero-trust authorization.
            </p>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => onTriggerWorkflow('wf-legal-draft')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Legal Workflow</span>
            </button>
            <button
              onClick={() => onNavigate('ingestion')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>Ingest Package</span>
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Runs</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-amber-400">{activeRunsCount}</span>
              <span className="text-[10px] text-slate-400">/ {workflowRuns.length} total</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Bounded Agents</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-cyan-400">{agents.length}</span>
              <span className="text-[10px] text-slate-400">domains</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Approvals Queue</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-rose-400">{pendingApprovals.length}</span>
              <span className="text-[10px] text-slate-400">action gates</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-emerald-400">{completedRunsCount}</span>
              <span className="text-[10px] text-slate-400">artifacts</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Log</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-purple-400">{auditEvents.length}</span>
              <span className="text-[10px] text-slate-400">immutable</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Autonomy Mode</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-xs font-bold font-mono ${killSwitch.globalAutonomousActionsDisabled ? 'text-amber-400' : 'text-emerald-400'}`}>
                {killSwitch.globalAutonomousActionsDisabled ? 'Supervised' : 'Autonomous'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Workflows In-Progress vs Approvals & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Controlled Workflows (SPEC-003) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Controlled Workflow Execution Queue (SPEC-003)
                </h2>
              </div>
              <button
                onClick={() => onNavigate('workflows')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <span>View All Workflows</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {workflowRuns.map((run) => (
                <div
                  key={run.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{run.workflowName}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            run.status === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : run.status === 'WAITING_FOR_APPROVAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {run.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Triggered by: {run.triggeredBy} &bull; Started {new Date(run.startedAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('workflows')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                    >
                      Details
                    </button>
                  </div>

                  {/* Step Timeline Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Step {run.currentStepIndex + 1} of {run.steps.length}</span>
                      <span>{run.steps[run.currentStepIndex]?.name}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${((run.currentStepIndex + 1) / run.steps.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SPEC-001 End-to-End Control Flow Architecture Diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Platform Control Flow Architecture (SPEC-001)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-amber-400 block text-[11px]">1. User & Workspace Boundary</span>
                <p className="text-[11px] text-slate-400">Strict ABAC permission enforcement before any knowledge retrieval or tool execution.</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-cyan-400 block text-[11px]">2. Bounded Agent Runtime</span>
                <p className="text-[11px] text-slate-400">Agents plan deterministically over approved skills with strict step and token budgets.</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-purple-400 block text-[11px]">3. Model & Tool Gateways</span>
                <p className="text-[11px] text-slate-400">Multi-model routing (Gemini 3 Pro Thinking / Flash) with typed tool schemas and mutation policies.</p>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400 block text-[11px]">4. Verification & Immutable Audit</span>
                <p className="text-[11px] text-slate-400">Independent adversarial checks, human-in-the-loop approvals, and append-only SHA-256 logs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Approvals (SPEC-003) & Bounded Agents (SPEC-004) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pending Approvals Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                  Pending Human Approvals ({pendingApprovals.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('approvals')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Inspect
              </button>
            </div>

            {pendingApprovals.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No pending approval gates.</p>
            ) : (
              <div className="space-y-2.5">
                {pendingApprovals.map((appr) => (
                  <div key={appr.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{appr.actionName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        {appr.riskLevel} RISK
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{appr.description}</p>
                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-850">
                      <span>By: {appr.requestedBy}</span>
                      <button
                        onClick={() => onNavigate('approvals')}
                        className="text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        Review Diff &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bounded Domain Agents Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                  Bounded Domain Agents (SPEC-004)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('agents')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Catalog
              </button>
            </div>

            <div className="space-y-2">
              {agents.slice(0, 4).map((ag) => (
                <div key={ag.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block">{ag.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Autonomy L{ag.autonomyLevel} &bull; {ag.domain}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {ag.currentUsage.steps}/{ag.budget.maxSteps} steps
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Events Feed (SPEC-001/SPEC-006) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                  Immutable Audit Feed (SPEC-006)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium"
              >
                Log
              </button>
            </div>

            <div className="space-y-2">
              {auditEvents.slice(0, 3).map((aud) => (
                <div key={aud.id} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-mono text-[10px] text-amber-400 font-bold">{aud.action}</span>
                    <span>{new Date(aud.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 truncate">{aud.target}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
