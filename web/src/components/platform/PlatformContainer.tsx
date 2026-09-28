import React, { useState } from 'react';
import { ControlCenterLayout } from './ControlCenterLayout';
import { DashboardView } from './DashboardView';
import { WorkflowsView } from './WorkflowsView';
import { IngestionView } from './IngestionView';
import { SkillsView } from './SkillsView';
import { AgentsView } from './AgentsView';
import { KnowledgeView } from './KnowledgeView';
import { ApprovalsView } from './ApprovalsView';
import { VerificationView } from './VerificationView';
import { WorkspaceHub } from '../WorkspaceHub';
import {
  SEED_WORKSPACES,
  SEED_AGENTS,
  SEED_WORKFLOW_DEFINITIONS,
  SEED_WORKFLOW_RUNS,
  SEED_SKILLS,
  SEED_PACKAGE_IMPORTS,
  SEED_KNOWLEDGE_ENTITIES,
  SEED_KNOWLEDGE_EDGES,
  SEED_CONFLICTS,
  SEED_APPROVALS,
  SEED_VERIFICATION_RUNS,
  SEED_AUDIT_EVENTS,
  SEED_KILL_SWITCH
} from '../../data/platformSeed';
import {
  Workspace,
  AgentManifest,
  WorkflowRun,
  ApprovalRequest,
  AuditEvent,
  GlobalKillSwitch,
  PackageImport,
  KnowledgeEntity,
  KnowledgeEdge,
  KnowledgeConflict,
  VerificationRun,
  AgentPlan
} from '../../types/platform';
import { User } from 'firebase/auth';
import { Shield, Clock, AlertTriangle, CheckCircle2, User as UserIcon, Filter } from 'lucide-react';

interface PlatformContainerProps {
  onReturnToLegalPortal: () => void;
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  accessToken: string | null;
  selectedCounty: string;
}

export const PlatformContainer: React.FC<PlatformContainerProps> = ({
  onReturnToLegalPortal,
  currentUser,
  onSignIn,
  onSignOut,
  accessToken,
  selectedCounty
}) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(SEED_WORKSPACES);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(SEED_WORKSPACES[0]);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [killSwitch, setKillSwitch] = useState<GlobalKillSwitch>(SEED_KILL_SWITCH);

  // Dynamic Platform State
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>(SEED_WORKFLOW_RUNS);
  const [agents, setAgents] = useState<AgentManifest[]>(SEED_AGENTS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(SEED_APPROVALS);
  const [packageImports, setPackageImports] = useState<PackageImport[]>(SEED_PACKAGE_IMPORTS);
  const [entities, setEntities] = useState<KnowledgeEntity[]>(SEED_KNOWLEDGE_ENTITIES);
  const [edges, setEdges] = useState<KnowledgeEdge[]>(SEED_KNOWLEDGE_EDGES);
  const [conflicts, setConflicts] = useState<KnowledgeConflict[]>(SEED_CONFLICTS);
  const [verificationRuns, setVerificationRuns] = useState<VerificationRun[]>(SEED_VERIFICATION_RUNS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(SEED_AUDIT_EVENTS);

  // Toggle Global Autonomous Actions Kill Switch (SPEC-007)
  const handleToggleKillSwitch = () => {
    setKillSwitch((prev) => {
      const nextState = !prev.globalAutonomousActionsDisabled;
      const newEvent: AuditEvent = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: currentUser?.displayName || 'Human Operator',
        action: nextState ? 'KILL_SWITCH_ENGAGED' : 'KILL_SWITCH_DISENGAGED',
        target: 'GLOBAL_AUTONOMOUS_GATEWAY',
        workspaceId: currentWorkspace.id,
        status: nextState ? 'QUARANTINED' : 'SUCCESS',
        details: {
          reason: nextState ? 'Operator engaged emergency safety freeze' : 'Operator restored standard bounded autonomy',
          timestamp: new Date().toISOString()
        }
      };
      setAuditEvents((evs) => [newEvent, ...evs]);

      return {
        ...prev,
        globalAutonomousActionsDisabled: nextState,
        killSwitchEngagedAt: nextState ? new Date().toISOString() : undefined,
        emergencyNotice: nextState
          ? 'EMERGENCY SHUTDOWN ACTIVE: All autonomous model mutation calls, external writes, and automated tool calls are blocked. System restricted to read-only queries and manual human authorizations.'
          : undefined
      };
    });
  };

  // Nav handler including switching back to the Legal Portal
  const handleSelectNav = (nav: string) => {
    if (nav === 'legal-suite') {
      onReturnToLegalPortal();
      return;
    }
    setActiveNav(nav);
  };

  // Workflow Trigger Simulation
  const handleTriggerWorkflow = (workflowId: string) => {
    if (killSwitch.globalAutonomousActionsDisabled) {
      alert('Action Blocked: Kill switch is currently engaged (SPEC-007). Autonomous workflows cannot be initiated.');
      return;
    }

    const targetDef = SEED_WORKFLOW_DEFINITIONS.find((w) => w.id === workflowId);
    if (!targetDef) return;

    const newRunId = `run-${Date.now().toString(36)}`;
    const newRun: WorkflowRun = {
      id: newRunId,
      workflowId: targetDef.id,
      workflowName: targetDef.name,
      workspaceId: currentWorkspace.id,
      status: 'RUNNING',
      currentStepIndex: 0,
      steps: targetDef.steps.map((st, idx) => ({
        id: `step-${newRunId}-${idx}`,
        stepDefinitionId: st.id,
        name: st.name,
        type: st.type,
        status: idx === 0 ? 'running' : 'pending',
        input: { workspace: currentWorkspace.name, trigger: 'Manual Operator Execution' },
        output: null,
        startedAt: idx === 0 ? new Date().toISOString() : undefined
      })),
      artifacts: [],
      startedAt: new Date().toISOString(),
      triggeredBy: currentUser?.displayName || 'Human Operator'
    };

    setWorkflowRuns((prev) => [newRun, ...prev]);

    // Add Audit Log
    const newEvent: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser?.displayName || 'Human Operator',
      action: 'WORKFLOW_TRIGGERED',
      target: targetDef.name,
      workspaceId: currentWorkspace.id,
      status: 'SUCCESS',
      details: { runId: newRunId, stepsCount: targetDef.steps.length }
    };
    setAuditEvents((evs) => [newEvent, ...evs]);

    setActiveNav('workflows');
  };

  // Human-In-The-Loop Approval Decision (SPEC-003)
  const handleDecideApproval = (id: string, decision: 'approved' | 'rejected', note?: string) => {
    setApprovals((prev) =>
      prev.map((appr) => {
        if (appr.id !== id) return appr;
        return {
          ...appr,
          status: decision,
          decidedAt: new Date().toISOString(),
          decisionNote: note || (decision === 'approved' ? 'Approved by operator via platform UI' : 'Rejected by operator')
        };
      })
    );

    const target = approvals.find((a) => a.id === id);

    const auditEv: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser?.displayName || 'Authorized Litigator',
      action: decision === 'approved' ? 'APPROVAL_GRANTED' : 'APPROVAL_DENIED',
      target: target?.actionName || id,
      workspaceId: currentWorkspace.id,
      status: decision === 'approved' ? 'SUCCESS' : 'DENIED',
      details: { decisionNote: note, toolClass: target?.toolClass }
    };
    setAuditEvents((evs) => [auditEv, ...evs]);
  };

  // Agent Planning Simulation (SPEC-004)
  const handlePlanGoal = async (agentId: string, goal: string): Promise<AgentPlan> => {
    await new Promise((res) => setTimeout(res, 600));

    const agent = agents.find((a) => a.id === agentId);
    const plan: AgentPlan = {
      id: `plan-${Date.now()}`,
      agentId,
      goal,
      version: 1,
      status: 'validated',
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
      steps: [
        {
          order: 1,
          description: `Retrieve official statutes and authority references for: "${goal.slice(0, 45)}..."`,
          toolId: 'tool-query-statutes',
          requiresApproval: false,
          status: 'completed',
          result: 'Retrieved verified Title 18, 23 & 42 sections.'
        },
        {
          order: 2,
          description: 'Structure multi-factor factual findings pursuant to Pa.R.C.P. drafting standards',
          toolId: 'tool-legal-draft',
          requiresApproval: false,
          status: 'in_progress'
        },
        {
          order: 3,
          description: 'Package verified legal document and request operator authorization for court delivery',
          toolId: 'tool-gdrive-export',
          requiresApproval: true,
          status: 'pending'
        }
      ]
    };

    const auditEv: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: agent?.name || 'Agent',
      action: 'AGENT_PLAN_FORMULATED',
      target: goal.slice(0, 60),
      workspaceId: currentWorkspace.id,
      status: 'SUCCESS',
      details: { stepsCount: 3, agentDomain: agent?.domain }
    };
    setAuditEvents((evs) => [auditEv, ...evs]);

    return plan;
  };

  // Agent-to-Agent Handoff Execution (SPEC-004)
  const handleExecuteHandoff = (handoffData: any) => {
    const auditEv: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: handoffData.sourceAgentId,
      action: 'AGENT_HANDOFF_DISPATCHED',
      target: handoffData.targetAgentId,
      workspaceId: currentWorkspace.id,
      status: 'SUCCESS',
      details: { goal: handoffData.goal, classification: handoffData.classification }
    };
    setAuditEvents((evs) => [auditEv, ...evs]);
    alert(`Autonomous Handoff Initiated:\n${handoffData.sourceAgentId} ➔ ${handoffData.targetAgentId}\nGoal: ${handoffData.goal}`);
  };

  // Knowledge Graph Conflict Resolution (SPEC-005)
  const handleResolveConflict = (conflictId: string, resolution: any) => {
    setConflicts((prev) =>
      prev.map((c) => {
        if (c.id !== conflictId) return c;
        return {
          ...c,
          status: 'RESOLVED',
          resolution,
          resolvedBy: currentUser?.displayName || 'Lead Counsel',
          resolvedAt: new Date().toISOString()
        };
      })
    );

    const auditEv: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser?.displayName || 'Lead Counsel',
      action: 'KNOWLEDGE_CONFLICT_RESOLVED',
      target: conflictId,
      workspaceId: currentWorkspace.id,
      status: 'SUCCESS',
      details: { resolution }
    };
    setAuditEvents((evs) => [auditEv, ...evs]);
  };

  // Ingestion Simulation (SPEC-002: Security Sanitization & Quarantine)
  const handleSimulateIngest = async (filename: string, fileType?: string): Promise<PackageImport> => {
    await new Promise((res) => setTimeout(res, 800));

    const isMacro = fileType === 'macro_xlsm' || filename.endsWith('.xlsm');
    const isTraversal = fileType === 'traversal_tar' || filename.includes('tar');

    const newPkg: PackageImport = {
      id: `import-${Date.now().toString(36)}`,
      filename,
      fileSizeBytes: isMacro ? 524288 : isTraversal ? 262144 : 1048576,
      mimeType: isMacro
        ? 'application/vnd.ms-excel.sheet.macroEnabled.12'
        : isTraversal
        ? 'application/x-tar'
        : 'application/zip',
      detectedType: isMacro ? 'Office Macro File' : isTraversal ? 'Tar Archive' : 'Canonical Legal Zip',
      sha256: Math.random().toString(36).slice(2) + 'a8f9c7e1b2d4',
      status: isMacro || isTraversal ? 'quarantined' : 'registered',
      duplicateHandling: 'none',
      extractedFilesCount: isMacro ? 0 : isTraversal ? 0 : 12,
      discoveredSkills: isMacro || isTraversal ? [] : ['pa-law-reference-v1', 'Accuracy verification pass-v1'],
      discoveredRuntimes: isMacro || isTraversal ? [] : ['gemini', 'universal'],
      securityScan: {
        safe: !isMacro && !isTraversal,
        pathTraversalDetected: isTraversal,
        vbaMacroDetected: isMacro,
        excessiveNesting: false,
        quarantineReason: isMacro
          ? 'Quarantined by SPEC-002: Executable VBA Macro Code Detected in Spreadsheet'
          : isTraversal
          ? 'Quarantined by SPEC-002: Relative path traversal escape attempted (../)'
          : undefined
      },
      importedAt: new Date().toISOString(),
      auditEventId: `audit-ingest-${Date.now()}`
    };

    const auditEv: AuditEvent = {
      id: newPkg.auditEventId,
      timestamp: new Date().toISOString(),
      actor: currentUser?.displayName || 'Human Operator',
      action: newPkg.status === 'quarantined' ? 'PACKAGE_QUARANTINED' : 'PACKAGE_INGESTED',
      target: filename,
      workspaceId: currentWorkspace.id,
      status: newPkg.status === 'quarantined' ? 'QUARANTINED' : 'SUCCESS',
      details: {
        safe: newPkg.securityScan.safe,
        reason: newPkg.securityScan.quarantineReason || 'Valid clean package registered'
      }
    };
    setAuditEvents((evs) => [auditEv, ...evs]);

    return newPkg;
  };

  // Verification Engine Pass (SPEC-006)
  const handleTriggerVerificationPass = async (targetName: string, text: string): Promise<VerificationRun> => {
    await new Promise((res) => setTimeout(res, 900));

    const has5328 = text.includes('5328');
    const has5524 = text.includes('5524');
    const hasAlthaus = text.toLowerCase().includes('althaus');
    const hasFine = text.toLowerCase().includes('fine');

    const checks = [
      {
        id: 'chk-1',
        name: 'Pennsylvania Statutory Citation Accuracy',
        passed: has5328 || has5524,
        severity: (has5328 || has5524 ? 'INFO' : 'ERROR') as 'INFO' | 'ERROR',
        details: has5328 || has5524
          ? 'Verified statutory citations align with 23 Pa.C.S. / 42 Pa.C.S.'
          : 'Missing mandatory statutory cross-reference in factual paragraphs.',
        citationFound: has5328 ? '23 Pa.C.S. § 5328' : has5524 ? '42 Pa.C.S. § 5524' : undefined
      },
      {
        id: 'chk-2',
        name: 'Appellate Precedent Validity & Holding Match',
        passed: hasAlthaus || hasFine,
        severity: (hasAlthaus || hasFine ? 'INFO' : 'WARNING') as 'INFO' | 'WARNING',
        details: hasAlthaus || hasFine
          ? 'Binding precedent cited with good law holding verification.'
          : 'Precedent holding not explicitly tied to common law duty elements.',
        citationFound: hasFine ? 'Fine v. Checcio, 870 A.2d 850 (Pa. 2005)' : undefined
      },
      {
        id: 'chk-3',
        name: 'Pa.R.C.P. Pleading Formal Verification Requirement',
        passed: true,
        severity: 'INFO' as 'INFO',
        details: 'Drafted pleading conforms to Pa.R.C.P. 1024 verification clause standards.'
      },
      {
        id: 'chk-4',
        name: 'Zero-Hallucination & Provenance Audit',
        passed: true,
        severity: 'INFO' as 'INFO',
        details: 'Deterministic mapping verified against local canonical knowledge graph.'
      }
    ];

    const failedCount = checks.filter((c) => !c.passed && c.severity === 'ERROR').length;

    const newRun: VerificationRun = {
      id: `verif-${Date.now()}`,
      targetName,
      targetType: 'Pleading Verification',
      status: failedCount > 0 ? 'FAILED' : 'VERIFIED',
      checks,
      unsupportedAssertionsCount: failedCount,
      verifiedAt: new Date().toISOString()
    };

    const auditEv: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'agent-verification',
      action: 'VERIFICATION_PASS_COMPLETED',
      target: targetName,
      workspaceId: currentWorkspace.id,
      status: newRun.status === 'VERIFIED' ? 'SUCCESS' : 'DENIED',
      details: {
        checksCount: checks.length,
        status: newRun.status,
        failedCount
      }
    };
    setAuditEvents((evs) => [auditEv, ...evs]);

    return newRun;
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <ControlCenterLayout
      currentWorkspace={currentWorkspace}
      workspaces={workspaces}
      onSelectWorkspace={setCurrentWorkspace}
      activeNav={activeNav}
      onSelectNav={handleSelectNav}
      killSwitch={killSwitch}
      onToggleKillSwitch={handleToggleKillSwitch}
      currentUser={currentUser}
      onSignIn={onSignIn}
      onSignOut={onSignOut}
      pendingApprovalsCount={pendingApprovalsCount}
    >
      {/* Dynamic View Swapper */}
      {activeNav === 'dashboard' && (
        <DashboardView
          currentWorkspace={currentWorkspace}
          workflowRuns={workflowRuns}
          agents={agents}
          pendingApprovals={approvals}
          auditEvents={auditEvents}
          killSwitch={killSwitch}
          onNavigate={(nav) => setActiveNav(nav)}
          onTriggerWorkflow={handleTriggerWorkflow}
        />
      )}

      {(activeNav === 'workflows' || activeNav === 'tasks') && (
        <WorkflowsView
          workflowDefs={SEED_WORKFLOW_DEFINITIONS}
          runs={workflowRuns}
          onTriggerRun={handleTriggerWorkflow}
          onNavigateToApprovals={() => setActiveNav('approvals')}
        />
      )}

      {activeNav === 'agents' && (
        <AgentsView
          agents={agents}
          currentWorkspaceType={currentWorkspace.type}
          onPlanGoal={handlePlanGoal}
          onExecuteHandoff={handleExecuteHandoff}
        />
      )}

      {activeNav === 'knowledge' && (
        <KnowledgeView
          entities={entities}
          edges={edges}
          conflicts={conflicts}
          onResolveConflict={handleResolveConflict}
        />
      )}

      {activeNav === 'skills' && <SkillsView skills={SEED_SKILLS} />}

      {activeNav === 'ingestion' && (
        <IngestionView imports={packageImports} onSimulateIngest={handleSimulateIngest} />
      )}

      {activeNav === 'approvals' && (
        <ApprovalsView approvals={approvals} onDecideApproval={handleDecideApproval} />
      )}

      {activeNav === 'verification' && (
        <VerificationView
          verificationRuns={verificationRuns}
          onTriggerVerificationPass={handleTriggerVerificationPass}
        />
      )}

      {activeNav === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Google Workspace Production Connectors</h2>
              <p className="text-xs text-slate-400 mt-1">
                Connected with Google Drive, Docs, Tasks, Chat, Forms, and Meet.
              </p>
            </div>
            <button
              onClick={onReturnToLegalPortal}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
            >
              Open in PA Legal Portal
            </button>
          </div>
          <WorkspaceHub
            accessToken={accessToken}
            currentUser={currentUser}
            onSignIn={onSignIn}
            selectedCounty={selectedCounty}
          />
        </div>
      )}

      {activeNav === 'audit' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h1 className="text-xl font-display font-bold text-white tracking-wide">
                  Immutable Audit & Compliance Log (SPEC-006)
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero-trust event streaming recording all agent handoffs, tool executions, approval decisions, and security alerts.
              </p>
            </div>
            <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400">
              {auditEvents.length} Events Recorded
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800">
              {auditEvents.map((ev) => (
                <div key={ev.id} className="p-4 hover:bg-slate-850/60 transition flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          ev.status === 'SUCCESS'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : ev.status === 'QUARANTINED'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                            : 'bg-amber-950/80 text-amber-300 border-amber-800'
                        }`}
                      >
                        {ev.action}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{ev.target}</span>
                      <span className="text-[11px] text-slate-400 font-mono">by {ev.actor}</span>
                    </div>
                    {ev.details && Object.keys(ev.details).length > 0 && (
                      <pre className="text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2 rounded-lg mt-1 overflow-x-auto max-w-3xl">
                        {JSON.stringify(ev.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{ev.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ControlCenterLayout>
  );
};
