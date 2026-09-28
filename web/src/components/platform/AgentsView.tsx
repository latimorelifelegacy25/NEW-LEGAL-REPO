import React, { useState } from 'react';
import {
  Bot,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Brain,
  AlertTriangle,
  Play,
  RotateCw,
  CheckCircle,
  Clock,
  Compass,
  Zap,
  ArrowRightLeft
} from 'lucide-react';
import { AgentManifest, AgentPlan, AgentHandoff, WorkspaceType } from '../../types/platform';

interface AgentsViewProps {
  agents: AgentManifest[];
  currentWorkspaceType: WorkspaceType;
  onPlanGoal: (agentId: string, goal: string) => Promise<AgentPlan>;
  onExecuteHandoff: (handoff: Omit<AgentHandoff, 'id' | 'timestamp' | 'status'>) => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  agents,
  currentWorkspaceType,
  onPlanGoal,
  onExecuteHandoff
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentManifest>(agents[0]);
  const [goalInput, setGoalInput] = useState('Analyze Title 42 personal injury statute of limitations and cross-check discovery rule exceptions for toxic exposure claim.');
  const [isPlanning, setIsPlanning] = useState(false);
  const [activePlan, setActivePlan] = useState<AgentPlan | null>(null);

  // Handoff state
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [handoffTargetAgent, setHandoffTargetAgent] = useState('agent-verification');
  const [handoffGoal, setHandoffGoal] = useState('Verify citation accuracy of drafted custody complaint against 23 Pa.C.S. § 5328 factors.');

  const handleCreatePlan = async () => {
    if (!goalInput.trim() || isPlanning) return;
    setIsPlanning(true);
    try {
      const plan = await onPlanGoal(selectedAgent.id, goalInput);
      setActivePlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleTriggerHandoff = () => {
    onExecuteHandoff({
      goal: handoffGoal,
      sourceAgentId: selectedAgent.id,
      targetAgentId: handoffTargetAgent,
      allowedContext: ['art-101'],
      classification: 'CONFIDENTIAL',
      requestedOutput: 'VERIFICATION_REPORT',
      verificationRequired: true
    });
    setShowHandoffModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                Bounded Agent Runtime & Domain Agents (SPEC-004)
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-serif-body mt-1">
              Agents are bounded planners over approved workflows, tools, and skills. They cannot invent permissions, exceed step/tool budgets, or self-approve mutations.
            </p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 self-start sm:self-auto">
            Autonomy Standard: L0–L3 Governed
          </span>
        </div>
      </div>

      {/* 6 Domain Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((ag) => {
          const isSelected = selectedAgent.id === ag.id;
          return (
            <div
              key={ag.id}
              onClick={() => setSelectedAgent(ag)}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/80 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    {ag.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    Autonomy L{ag.autonomyLevel}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-serif-body line-clamp-2">
                  {ag.description}
                </p>

                {/* Hard Boundary notice (SPEC-004) */}
                <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/40 text-[10px] text-rose-300">
                  <strong>Hard Boundary:</strong> {ag.hardBoundary}
                </div>
              </div>

              {/* Budget Consumption Meters */}
              <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-1.5 text-[10px] text-slate-400">
                <div className="flex justify-between">
                  <span>Step Budget</span>
                  <span>{ag.currentUsage.steps} / {ag.budget.maxSteps}</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${(ag.currentUsage.steps / ag.budget.maxSteps) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Structured Planning & Execution Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Goal Input & Plan Generator */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Structured Planner for {selectedAgent.name}
            </h2>
            <button
              onClick={() => setShowHandoffModal(true)}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Agent Handoff</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">
              Agent Goal / Operational Directive:
            </label>
            <textarea
              rows={4}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-serif-body leading-relaxed"
            />
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-400">
            <span className="font-bold text-slate-200 block text-[11px]">Enforced Constraints:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[10px]">
              <li>Max steps: {selectedAgent.budget.maxSteps} &bull; Max model calls: {selectedAgent.budget.maxModelCalls}</li>
              <li>Allowed tools: {selectedAgent.allowedTools.join(', ')}</li>
              <li>Allowed skills: {selectedAgent.allowedSkills.join(', ')}</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleCreatePlan}
            disabled={isPlanning}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isPlanning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Validating Plan Graph...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Generate & Validate Structured Plan (SPEC-004)</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Validated Plan Tree & Execution */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Immutable Plan Tree</span>
              {activePlan && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                  v{activePlan.version} &bull; {activePlan.status}
                </span>
              )}
            </h3>

            {activePlan && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                {activePlan.verificationStatus.toUpperCase()}
              </span>
            )}
          </div>

          {activePlan ? (
            <div className="space-y-2.5">
              <span className="text-xs text-slate-400 font-serif-body block mb-2">
                <strong>Goal:</strong> {activePlan.goal}
              </span>

              {activePlan.steps.map((st) => (
                <div
                  key={st.order}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {st.order}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-200 block">{st.description}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        {st.toolId && <span>Tool: {st.toolId}</span>}
                        {st.skillId && <span>Skill: {st.skillId}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {st.requiresApproval ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        Approval Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400">
                        Autonomous
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Click "Generate & Validate Structured Plan" to watch the bounded agent formulate an immutable execution tree.
            </div>
          )}
        </div>
      </div>

      {/* Structured Agent Handoff Modal (SPEC-004) */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-500" />
                Structured Agent-to-Agent Handoff Protocol
              </h3>
              <button onClick={() => setShowHandoffModal(false)} className="text-slate-400 hover:text-white text-xs">
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-400 font-semibold">Source Agent</label>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 font-mono text-slate-300">
                  {selectedAgent.name} ({selectedAgent.id})
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 font-semibold">Target Domain Agent</label>
                <select
                  value={handoffTargetAgent}
                  onChange={(e) => setHandoffTargetAgent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.domain})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 font-semibold">Delegated Goal / Deliverable</label>
                <textarea
                  rows={3}
                  value={handoffGoal}
                  onChange={(e) => setHandoffGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300">
                <strong>SPEC-004 Requirement:</strong> Cross-agent handoff re-authorizes context and enforces strict boundary verification before executing target tasks.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowHandoffModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerHandoff}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Execute Handoff Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
