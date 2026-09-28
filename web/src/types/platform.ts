/**
 * Unified AI Operating Platform (SPEC-001 through SPEC-007)
 * Core Type Definitions & Object Models
 */

// SPEC-001: Identity & Workspaces
export type WorkspaceType = 'legal' | 'business' | 'marketing' | 'engineering' | 'research' | 'personal';

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  description: string;
  ownerId: string;
  membersCount: number;
  activeAgents: string[];
  activeWorkflows: string[];
  dataSources: string[];
  createdAt: string;
}

export type UserRole = 'owner' | 'admin' | 'operator' | 'analyst' | 'viewer';

export interface PlatformUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  mfaEnabled: boolean;
  activeWorkspaceId: string;
}

// SPEC-002: Ingestion & Canonical Registry
export type IngestionStatus = 'inspecting' | 'deduped' | 'validated' | 'registered' | 'quarantined' | 'failed';
export type DuplicateCase = 'none' | 'exact_archive' | 'exact_file' | 'runtime_mirror' | 'semantic_overlap';

export interface PackageImport {
  id: string;
  filename: string;
  fileSizeBytes: number;
  mimeType: string;
  detectedType: string;
  sha256: string;
  status: IngestionStatus;
  duplicateHandling: DuplicateCase;
  canonicalPackageId?: string;
  extractedFilesCount: number;
  discoveredSkills: string[];
  discoveredRuntimes: string[];
  securityScan: {
    safe: boolean;
    pathTraversalDetected: boolean;
    vbaMacroDetected: boolean;
    excessiveNesting: boolean;
    quarantineReason?: string;
  };
  importedAt: string;
  auditEventId: string;
}

export type RuntimeBinding = 'claude' | 'gemini' | 'openai' | 'hermes' | 'universal';
export type SkillStatus = 'draft' | 'active' | 'deprecated' | 'quarantined';

export interface CanonicalSkill {
  id: string;
  name: string;
  version: string;
  category: 'legal' | 'engineering' | 'marketing' | 'business' | 'research' | 'verification';
  description: string;
  author: string;
  runtimeBindings: RuntimeBinding[];
  dependencies: string[];
  toolsRequired: string[];
  status: SkillStatus;
  files: {
    path: string;
    sha256: string;
    sizeBytes: number;
  }[];
  testsPassing: boolean;
  updatedAt: string;
}

// SPEC-003: Workflows, Permission Engine & Tool Gateway
export type WorkflowState =
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING_FOR_INPUT'
  | 'WAITING_FOR_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'QUARANTINED';

export type ToolClass = 'Read Only' | 'Controlled Mutation' | 'External Action';
export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  toolClass: ToolClass;
  policy: PolicyDecision;
  schema: Record<string, any>;
  mutationRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  provider: 'local' | 'notion' | 'drive' | 'github' | 'supabase' | 'canva' | 'gemini';
}

export interface WorkflowStepDefinition {
  id: string;
  name: string;
  type: 'model' | 'tool' | 'verification' | 'approval' | 'human_input';
  toolId?: string;
  skillId?: string;
  requiresApproval: boolean;
  inputTemplate?: Record<string, any>;
  outputArtifactType?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  triggers: string[];
  steps: WorkflowStepDefinition[];
}

export interface Artifact {
  id: string;
  title: string;
  type: string;
  status: 'DRAFT' | 'UNVERIFIED' | 'VERIFIED' | 'APPROVED' | 'FINAL';
  content: string;
  sha256: string;
  provenance: {
    runId: string;
    stepId: string;
    modelOrTool: string;
    timestamp: string;
  };
}

export interface WorkflowRunStep {
  id: string;
  stepDefinitionId: string;
  name: string;
  type: 'model' | 'tool' | 'verification' | 'approval' | 'human_input';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval';
  toolClass?: ToolClass;
  input: any;
  output: any;
  approvalRequestId?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  workspaceId: string;
  status: WorkflowState;
  currentStepIndex: number;
  steps: WorkflowRunStep[];
  artifacts: Artifact[];
  startedAt: string;
  completedAt?: string;
  triggeredBy: string;
  error?: string;
}

export interface ApprovalRequest {
  id: string;
  workflowRunId?: string;
  stepId?: string;
  agentId?: string;
  actionName: string;
  description: string;
  toolClass: ToolClass;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requestedBy: string;
  beforeState: any;
  proposedState: any;
  sourceEntities: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  decidedAt?: string;
  decisionNote?: string;
}

// SPEC-004: Bounded Agent Runtime + Domain Agents
export type AutonomyLevel = 0 | 1 | 2 | 3 | 4;
export type AgentDomain = 'Verification' | 'Legal' | 'Engineering' | 'Marketing' | 'Business' | 'Research';

export interface AgentManifest {
  id: string;
  name: string;
  domain: AgentDomain;
  version: string;
  autonomyLevel: AutonomyLevel;
  workspaceTypes: WorkspaceType[];
  allowedSkills: string[];
  allowedTools: string[];
  budget: {
    maxSteps: number;
    maxModelCalls: number;
    maxToolCalls: number;
    maxRuntimeSeconds: number;
  };
  hardBoundary: string;
  description: string;
  status: 'idle' | 'planning' | 'executing' | 'waiting_approval' | 'paused';
  currentUsage: {
    steps: number;
    modelCalls: number;
    toolCalls: number;
    runtimeSeconds: number;
  };
}

export interface AgentPlanStep {
  order: number;
  description: string;
  skillId?: string;
  toolId?: string;
  requiresApproval: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
}

export interface AgentPlan {
  id: string;
  agentId: string;
  goal: string;
  version: number;
  status: 'draft' | 'validated' | 'executing' | 'completed' | 're-planned';
  steps: AgentPlanStep[];
  verificationStatus: 'unverified' | 'verified' | 'failed';
  createdAt: string;
}

export interface AgentHandoff {
  id: string;
  goal: string;
  sourceAgentId: string;
  targetAgentId: string;
  allowedContext: string[];
  classification: string;
  requestedOutput: string;
  verificationRequired: boolean;
  status: 'pending' | 'accepted' | 'completed';
  timestamp: string;
}

// SPEC-005: Knowledge Graph, Integrations & Synchronization
export type EvidenceClass = 'DETERMINISTIC' | 'SOURCE_DECLARED' | 'AI_EXTRACTED' | 'HUMAN_CONFIRMED';

export interface KnowledgeEntity {
  id: string;
  title: string;
  type: 'Case' | 'Exhibit' | 'DiscoveryItem' | 'Filing' | 'Authority' | 'Repository' | 'File' | 'Campaign' | 'Asset' | 'Person' | 'Project';
  sourceSystem: 'Notion' | 'Google Drive' | 'Google Docs' | 'GitHub' | 'Supabase' | 'Canva' | 'Local' | 'Applet';
  sourceId: string;
  properties: Record<string, any>;
  version: string;
  lastSyncedAt: string;
  provenance: {
    author: string;
    hash: string;
    evidenceClass: EvidenceClass;
  };
}

export interface KnowledgeEdge {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: 'HAS_EXHIBIT' | 'HAS_DISCOVERY' | 'CITES' | 'CONTAINS' | 'USES' | 'REFERENCES' | 'ASSIGNED_TO';
  evidenceClass: EvidenceClass;
  weight: number;
  verified: boolean;
}

export interface KnowledgeConflict {
  id: string;
  entityId: string;
  propertyName: string;
  sourceA: { system: string; value: any; timestamp: string };
  sourceB: { system: string; value: any; timestamp: string };
  status: 'OPEN' | 'RESOLVED';
  resolution?: any;
  resolvedBy?: string;
  resolvedAt?: string;
}

export type SyncMode = 'MANUAL' | 'SCHEDULED' | 'EVENT' | 'EVENT_PLUS_RECONCILIATION';

export interface IntegrationConnector {
  id: string;
  name: 'Google Drive' | 'Google Docs' | 'Google Tasks' | 'Google Chat' | 'Google Forms' | 'Google Meet' | 'Notion' | 'GitHub' | 'Supabase' | 'Canva';
  serviceCategory: 'workspace' | 'productivity' | 'engineering' | 'database' | 'design';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  syncMode: SyncMode;
  lastCheckpoint: string;
  health: 'healthy' | 'degraded' | 'offline';
  eventsProcessed: number;
  rateLimitUsagePercent: number;
  killSwitchEnabled: boolean;
  scopes: string[];
}

// SPEC-006 & SPEC-007: Safety, Audit & Production Operations
export interface GlobalKillSwitch {
  globalAutonomousActionsDisabled: boolean;
  allowedActions: string[];
  blockedActions: string[];
  killSwitchEngagedAt?: string;
  engagedBy?: string;
  emergencyNotice?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  workspaceId: string;
  status: 'SUCCESS' | 'DENIED' | 'QUARANTINED' | 'APPROVAL_REQUIRED';
  ipAddress?: string;
  details: Record<string, any>;
}

export interface VerificationCheck {
  id: string;
  name: string;
  passed: boolean;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  details: string;
  citationFound?: string;
}

export interface VerificationRun {
  id: string;
  targetName: string;
  targetType: string;
  status: 'VERIFIED' | 'UNVERIFIED' | 'FAILED';
  checks: VerificationCheck[];
  unsupportedAssertionsCount: number;
  verifiedAt: string;
}
