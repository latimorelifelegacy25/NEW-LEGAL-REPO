import {
  Workspace,
  AgentManifest,
  WorkflowDefinition,
  WorkflowRun,
  CanonicalSkill,
  PackageImport,
  KnowledgeEntity,
  KnowledgeEdge,
  KnowledgeConflict,
  IntegrationConnector,
  ApprovalRequest,
  VerificationRun,
  AuditEvent,
  GlobalKillSwitch,
  ToolDefinition
} from '../types/platform';

export const SEED_WORKSPACES: Workspace[] = [
  {
    id: 'ws-legal',
    name: 'Pennsylvania Legal & Litigation',
    type: 'legal',
    description: 'Pennsylvania Court of Common Pleas, UCCJEA child custody, domestic relations, compulsory school attendance, and tort claims.',
    ownerId: 'usr-jackson',
    membersCount: 4,
    activeAgents: ['agent-legal', 'agent-verification'],
    activeWorkflows: ['wf-legal-draft', 'wf-skill-import'],
    dataSources: ['pa-statutes-repository', 'schuylkill-local-rules', 'google-drive-filings'],
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'ws-business',
    name: 'Executive Operations & Business',
    type: 'business',
    description: 'Corporate governance, contracts, client accounts, operational task queues, and executive reporting.',
    ownerId: 'usr-jackson',
    membersCount: 6,
    activeAgents: ['agent-business', 'agent-verification'],
    activeWorkflows: ['wf-ai-exchange'],
    dataSources: ['notion-business-hub', 'supabase-accounts'],
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'ws-marketing',
    name: 'Brand & Marketing Strategy',
    type: 'marketing',
    description: 'Campaign briefs, social assets, brand review pipelines, multi-channel creative generation and Canva integrations.',
    ownerId: 'usr-jackson',
    membersCount: 5,
    activeAgents: ['agent-marketing', 'agent-verification'],
    activeWorkflows: ['wf-marketing-campaign'],
    dataSources: ['canva-brand-kit', 'notion-editorial-calendar'],
    createdAt: '2026-09-03T11:00:00Z'
  },
  {
    id: 'ws-engineering',
    name: 'Core AI Systems & Engineering',
    type: 'engineering',
    description: 'FastAPI gateway, Celery background workers, Docker runtimes, Supabase migrations, and git CI/CD pipelines.',
    ownerId: 'usr-jackson',
    membersCount: 3,
    activeAgents: ['agent-engineering', 'agent-verification'],
    activeWorkflows: ['wf-engineering-change'],
    dataSources: ['github-platform-repo', 'supabase-schema'],
    createdAt: '2026-09-04T09:00:00Z'
  },
  {
    id: 'ws-research',
    name: 'Deep Research & Intelligence',
    type: 'research',
    description: 'Evidence synthesis, statutory cross-examinations, academic jurisprudence, grounding verification, and claim citation checks.',
    ownerId: 'usr-jackson',
    membersCount: 3,
    activeAgents: ['agent-research', 'agent-verification'],
    activeWorkflows: ['wf-ai-exchange'],
    dataSources: ['pa-appellate-reporters', 'academic-jurisprudence'],
    createdAt: '2026-09-05T14:00:00Z'
  },
  {
    id: 'ws-personal',
    name: 'Personal Sandbox',
    type: 'personal',
    description: 'Isolated test bench for trying new prompt techniques, custom skills, and private notes.',
    ownerId: 'usr-jackson',
    membersCount: 1,
    activeAgents: ['agent-verification'],
    activeWorkflows: ['wf-skill-import'],
    dataSources: ['local-notes'],
    createdAt: '2026-09-06T16:00:00Z'
  }
];

export const SEED_AGENTS: AgentManifest[] = [
  {
    id: 'agent-verification',
    name: 'Verification Agent',
    domain: 'Verification',
    version: '1.2.0',
    autonomyLevel: 1,
    workspaceTypes: ['legal', 'business', 'marketing', 'engineering', 'research', 'personal'],
    allowedSkills: ['accuracy-verification-pass', 'skills-qa'],
    allowedTools: ['knowledge.search', 'verification.run', 'audit.log'],
    budget: { maxSteps: 25, maxModelCalls: 15, maxToolCalls: 40, maxRuntimeSeconds: 600 },
    hardBoundary: 'Cannot approve its own verification outputs or execute external actions.',
    description: 'Performs independent adversarial audits, verifies factual citations against primary evidence, and calculates unsupported assertion scores.',
    status: 'idle',
    currentUsage: { steps: 8, modelCalls: 4, toolCalls: 12, runtimeSeconds: 42 }
  },
  {
    id: 'agent-legal',
    name: 'Legal Agent',
    domain: 'Legal',
    version: '2.0.1',
    autonomyLevel: 2,
    workspaceTypes: ['legal', 'research'],
    allowedSkills: ['matter-intake', 'pleading-fact-paragraphs', 'pa-law-reference', 'claim-chart', 'chronology', 'legal-hold', 'subpoena-triage'],
    allowedTools: ['filesystem.read', 'knowledge.search', 'legal.lookup', 'google_docs.create', 'google_tasks.create', 'verification.run'],
    budget: { maxSteps: 30, maxModelCalls: 20, maxToolCalls: 50, maxRuntimeSeconds: 900 },
    hardBoundary: 'Strictly prohibited from automatic court filing, issuing subpoenas, or sending external communications without explicit human approval.',
    description: 'Specializes in Pennsylvania statutory jurisprudence, child custody petitions, compulsory attendance SAIC defenses, and Discovery Rule tolling.',
    status: 'idle',
    currentUsage: { steps: 14, modelCalls: 9, toolCalls: 22, runtimeSeconds: 110 }
  },
  {
    id: 'agent-engineering',
    name: 'Engineering Agent',
    domain: 'Engineering',
    version: '1.4.0',
    autonomyLevel: 2,
    workspaceTypes: ['engineering'],
    allowedSkills: ['git-worktree-change', 'unit-test-runner', 'schema-migrator'],
    allowedTools: ['git.inspect', 'git.create_branch', 'filesystem.read', 'filesystem.write', 'tests.run'],
    budget: { maxSteps: 40, maxModelCalls: 25, maxToolCalls: 60, maxRuntimeSeconds: 1200 },
    hardBoundary: 'Prohibited from direct production deployments or pushing to protected main branches.',
    description: 'Conducts repository inspection, structured refactoring, unit test suites, database migration validation, and prepares pull request diffs.',
    status: 'idle',
    currentUsage: { steps: 20, modelCalls: 11, toolCalls: 28, runtimeSeconds: 185 }
  },
  {
    id: 'agent-marketing',
    name: 'Marketing Agent',
    domain: 'Marketing',
    version: '1.1.0',
    autonomyLevel: 2,
    workspaceTypes: ['marketing', 'business'],
    allowedSkills: ['campaign-planner', 'brand-voice-review', 'canva-design-generator'],
    allowedTools: ['canva.create_design', 'notion.update_page', 'image.generate', 'knowledge.search'],
    budget: { maxSteps: 20, maxModelCalls: 12, maxToolCalls: 30, maxRuntimeSeconds: 600 },
    hardBoundary: 'Publishing campaigns or spending ad budget requires mandatory marketing policy sign-off.',
    description: 'Designs multi-channel campaign architectures, aligns content with brand guidelines, and synthesizes creative briefs.',
    status: 'idle',
    currentUsage: { steps: 5, modelCalls: 3, toolCalls: 7, runtimeSeconds: 30 }
  },
  {
    id: 'agent-business',
    name: 'Business Operations Agent',
    domain: 'Business',
    version: '1.0.4',
    autonomyLevel: 2,
    workspaceTypes: ['business', 'personal'],
    allowedSkills: ['executive-briefing', 'task-reconciler', 'budget-tracker'],
    allowedTools: ['google_tasks.create', 'google_chat.post', 'notion.query', 'supabase.query'],
    budget: { maxSteps: 25, maxModelCalls: 14, maxToolCalls: 35, maxRuntimeSeconds: 750 },
    hardBoundary: 'Consequential financial transactions and external client dispatch require dual-key human approval.',
    description: 'Monitors operational KPIs, reconciles task queues across Notion and Google Workspace, and compiles executive summaries.',
    status: 'idle',
    currentUsage: { steps: 11, modelCalls: 6, toolCalls: 15, runtimeSeconds: 65 }
  },
  {
    id: 'agent-research',
    name: 'Deep Research Agent',
    domain: 'Research',
    version: '1.3.0',
    autonomyLevel: 1,
    workspaceTypes: ['research', 'legal'],
    allowedSkills: ['evidence-synthesizer', 'citation-indexer', 'conflict-detector'],
    allowedTools: ['knowledge.search', 'web.grounded_search', 'filesystem.read', 'verification.run'],
    budget: { maxSteps: 35, maxModelCalls: 22, maxToolCalls: 55, maxRuntimeSeconds: 1000 },
    hardBoundary: 'Read-first policy; all asserted claims require primary source hash and citation provenance.',
    description: 'Gathers multi-source intelligence, checks historical Pennsylvania case reporters, and maps semantic relationships in the knowledge graph.',
    status: 'idle',
    currentUsage: { steps: 18, modelCalls: 12, toolCalls: 25, runtimeSeconds: 140 }
  }
];

export const SEED_WORKFLOW_DEFINITIONS: WorkflowDefinition[] = [
  {
    id: 'wf-skill-import',
    name: 'Skill Import & Registration Pipeline',
    version: '1.0',
    category: 'Governance & Ingestion',
    description: 'Full SPEC-002 pipeline: Upload package -> SHA-256 fingerprint -> inspect structure -> detect duplicates -> safety scan -> canonical registration -> approval -> activation.',
    triggers: ['User file upload', 'Archive drop in /imports/originals'],
    steps: [
      { id: 's1', name: 'Upload & Store Immutable Original', type: 'tool', requiresApproval: false },
      { id: 's2', name: 'SHA-256 Fingerprint & Exact Duplicate Check', type: 'tool', requiresApproval: false },
      { id: 's3', name: 'Safe Extraction & MIME Type Detection', type: 'tool', requiresApproval: false },
      { id: 's4', name: 'Discover Skills & Runtime Bindings', type: 'tool', requiresApproval: false },
      { id: 's5', name: 'Security Scan & Dependency Validation', type: 'verification', requiresApproval: false },
      { id: 's6', name: 'Canonical Registration or Quarantine', type: 'tool', requiresApproval: false },
      { id: 's7', name: 'Human Approval for Platform Activation', type: 'approval', requiresApproval: true },
      { id: 's8', name: 'Audit Event Logged', type: 'tool', requiresApproval: false }
    ]
  },
  {
    id: 'wf-legal-draft',
    name: 'Verified Legal Pleading Drafting',
    version: '1.1',
    category: 'Legal Litigation',
    description: 'Evidence extraction -> Draft verified complaint under Pa.R.C.P. 1915 -> Independent accuracy verification -> Authority lookup -> Human review -> Final court-ready artifact.',
    triggers: ['Custody complaint request', 'Records demand under 23 Pa.C.S. § 5336'],
    steps: [
      { id: 'l1', name: 'Extract Evidence & Fact Timeline', type: 'model', requiresApproval: false },
      { id: 'l2', name: 'Draft Pleading pursuant to Pa.R.C.P.', type: 'model', requiresApproval: false },
      { id: 'l3', name: 'Accuracy & Citation Verification Pass', type: 'verification', requiresApproval: false },
      { id: 'l4', name: 'Statutory Authority Cross-Check (§ 5328/§ 5524)', type: 'tool', requiresApproval: false },
      { id: 'l5', name: 'Human Attorney / Litigant Approval', type: 'approval', requiresApproval: true },
      { id: 'l6', name: 'Finalize Court Artifact & Workspace Export', type: 'tool', requiresApproval: false }
    ]
  },
  {
    id: 'wf-engineering-change',
    name: 'Controlled Engineering Change',
    version: '1.0',
    category: 'Software Engineering',
    description: 'Inspect task -> Plan change -> Create isolated git worktree -> Apply code edit -> Run test suite -> Generate diff -> Human approval -> Create PR.',
    triggers: ['Feature ticket', 'Bug fix request'],
    steps: [
      { id: 'e1', name: 'Inspect Codebase & Analyze Scope', type: 'tool', requiresApproval: false },
      { id: 'e2', name: 'Formulate Structured Implementation Plan', type: 'model', requiresApproval: false },
      { id: 'e3', name: 'Create Isolated Git Branch & Worktree', type: 'tool', requiresApproval: false },
      { id: 'e4', name: 'Apply Code Changes with Static Verification', type: 'tool', requiresApproval: false },
      { id: 'e5', name: 'Run Unit, Integration & Security Tests', type: 'verification', requiresApproval: false },
      { id: 'e6', name: 'Review Diff & Human PR Approval', type: 'approval', requiresApproval: true },
      { id: 'e7', name: 'Open GitHub Pull Request', type: 'tool', requiresApproval: false }
    ]
  },
  {
    id: 'wf-marketing-campaign',
    name: 'Marketing Campaign & Creative Synthesis',
    version: '1.0',
    category: 'Marketing',
    description: 'Objective formulation -> Campaign architecture -> Content drafting -> Brand compliance review -> Creative generation -> Final stakeholder approval.',
    triggers: ['Campaign brief', 'Product announcement'],
    steps: [
      { id: 'm1', name: 'Define Target Audience & KPI Objectives', type: 'model', requiresApproval: false },
      { id: 'm2', name: 'Synthesize Multi-Channel Copy & Narrative', type: 'model', requiresApproval: false },
      { id: 'm3', name: 'Brand Voice & Tone Compliance Review', type: 'verification', requiresApproval: false },
      { id: 'm4', name: 'Generate Design Assets via Canva Connector', type: 'tool', requiresApproval: false },
      { id: 'm5', name: 'Stakeholder Approval Before Publishing', type: 'approval', requiresApproval: true }
    ]
  },
  {
    id: 'wf-ai-exchange',
    name: 'Multi-Model AI Exchange Review',
    version: '1.0',
    category: 'Reasoning & Synthesis',
    description: 'Task routing -> Primary model generation -> Peer model critique -> Independent accuracy pass -> Final consolidated artifact.',
    triggers: ['High-stakes analysis', 'Complex factual synthesis'],
    steps: [
      { id: 'x1', name: 'Primary Model Hypothesis (Gemini Pro Thinking)', type: 'model', requiresApproval: false },
      { id: 'x2', name: 'Generate Initial Artifact', type: 'tool', requiresApproval: false },
      { id: 'x3', name: 'Peer Model Counter-Analysis & Critique', type: 'model', requiresApproval: false },
      { id: 'x4', name: 'Independent Verification Pass', type: 'verification', requiresApproval: false },
      { id: 'x5', name: 'Final Approved Knowledge Synthesis', type: 'approval', requiresApproval: true }
    ]
  }
];

export const SEED_WORKFLOW_RUNS: WorkflowRun[] = [
  {
    id: 'run-leg-101',
    workflowId: 'wf-legal-draft',
    workflowName: 'Verified Legal Pleading Drafting',
    workspaceId: 'ws-legal',
    status: 'WAITING_FOR_APPROVAL',
    currentStepIndex: 4,
    startedAt: '2026-09-27T10:15:00Z',
    triggeredBy: 'User (Jackson Latimore)',
    steps: [
      {
        id: 'step-1',
        stepDefinitionId: 'l1',
        name: 'Extract Evidence & Fact Timeline',
        type: 'model',
        status: 'completed',
        input: { client: 'Father', county: 'Schuylkill', issue: 'Child custody weekend withholding' },
        output: { factsCount: 6, datesIdentified: ['2026-09-11', '2026-09-13', '2026-09-25'] },
        completedAt: '2026-09-27T10:15:20Z'
      },
      {
        id: 'step-2',
        stepDefinitionId: 'l2',
        name: 'Draft Pleading pursuant to Pa.R.C.P.',
        type: 'model',
        status: 'completed',
        input: { template: 'Complaint for Custody (Pa.R.C.P. 1915.15)' },
        output: { lines: 68, words: 540, pleadingCaption: 'Doe v. Smith, Schuylkill C.P.' },
        completedAt: '2026-09-27T10:16:05Z'
      },
      {
        id: 'step-3',
        stepDefinitionId: 'l3',
        name: 'Accuracy & Citation Verification Pass',
        type: 'verification',
        status: 'completed',
        input: { targetTextLength: 3200 },
        output: { verifiedCitations: ['23 Pa.C.S. § 5328', '23 Pa.C.S. § 5336', 'Pa.R.C.P. 1915.3-2'], score: '100% Citation Accuracy' },
        completedAt: '2026-09-27T10:16:30Z'
      },
      {
        id: 'step-4',
        stepDefinitionId: 'l4',
        name: 'Statutory Authority Cross-Check (§ 5328/§ 5524)',
        type: 'tool',
        status: 'completed',
        toolClass: 'Read Only',
        input: { statute: '23 Pa.C.S. § 5328' },
        output: { matchedFactors: 16, weightedSafetyPriorityConfirmed: true },
        completedAt: '2026-09-27T10:16:45Z'
      },
      {
        id: 'step-5',
        stepDefinitionId: 'l5',
        name: 'Human Attorney / Litigant Approval',
        type: 'approval',
        status: 'waiting_approval',
        approvalRequestId: 'appr-leg-01',
        input: { summary: 'Ready to export to Google Docs and schedule 20-day conciliation deadline in Google Tasks.' },
        output: null,
        startedAt: '2026-09-27T10:16:46Z'
      }
    ],
    artifacts: [
      {
        id: 'art-101',
        title: 'Verified Complaint for Child Custody (Schuylkill County)',
        type: 'Pleading Document',
        status: 'VERIFIED',
        content: 'IN THE COURT OF COMMON PLEAS OF SCHUYLKILL COUNTY, PENNSYLVANIA\nCIVIL DIVISION - FAMILY\n\nCOMPLAINT FOR CUSTODY (23 Pa.C.S. § 5328 & Pa.R.C.P. 1915.15)\n\n1. Plaintiff is an individual residing in Schuylkill County...\n[Full Verified Pleading Draft Ready for Prothonotary]',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        provenance: {
          runId: 'run-leg-101',
          stepId: 'step-2',
          modelOrTool: 'gemini-3.1-pro-preview',
          timestamp: '2026-09-27T10:16:05Z'
        }
      }
    ]
  },
  {
    id: 'run-eng-201',
    workflowId: 'wf-engineering-change',
    workflowName: 'Controlled Engineering Change',
    workspaceId: 'ws-engineering',
    status: 'COMPLETED',
    currentStepIndex: 6,
    startedAt: '2026-09-27T08:00:00Z',
    completedAt: '2026-09-27T08:12:30Z',
    triggeredBy: 'CI Webhook',
    steps: [
      { id: 'es-1', stepDefinitionId: 'e1', name: 'Inspect Codebase & Scope', type: 'tool', status: 'completed', input: {}, output: { targetFiles: 3 }, completedAt: '2026-09-27T08:01:00Z' },
      { id: 'es-2', stepDefinitionId: 'e2', name: 'Formulate Plan', type: 'model', status: 'completed', input: {}, output: { planVersion: 1 }, completedAt: '2026-09-27T08:02:10Z' },
      { id: 'es-3', stepDefinitionId: 'e3', name: 'Create Branch & Worktree', type: 'tool', status: 'completed', input: {}, output: { branch: 'feat/kill-switch-controls' }, completedAt: '2026-09-27T08:03:00Z' },
      { id: 'es-4', stepDefinitionId: 'e4', name: 'Apply Code Changes', type: 'tool', status: 'completed', input: {}, output: { filesChanged: 2 }, completedAt: '2026-09-27T08:06:00Z' },
      { id: 'es-5', stepDefinitionId: 'e5', name: 'Run Test Suite', type: 'verification', status: 'completed', input: {}, output: { passed: 18, failed: 0 }, completedAt: '2026-09-27T08:09:00Z' },
      { id: 'es-6', stepDefinitionId: 'e6', name: 'Review Diff & Human PR Approval', type: 'approval', status: 'completed', input: {}, output: { approvedBy: 'Jackson Latimore' }, completedAt: '2026-09-27T08:11:00Z' },
      { id: 'es-7', stepDefinitionId: 'e7', name: 'Open GitHub Pull Request', type: 'tool', status: 'completed', input: {}, output: { prUrl: 'https://github.com/jackson1989/ai-platform/pull/42' }, completedAt: '2026-09-27T08:12:30Z' }
    ],
    artifacts: []
  }
];

export const SEED_SKILLS: CanonicalSkill[] = [
  {
    id: 'skill-pa-law-reference',
    name: 'pa-law-reference',
    version: '2.1.0',
    category: 'legal',
    description: 'Comprehensive Pennsylvania statutory reference authority covering Title 18 (Crimes), Title 23 (Domestic Relations), Title 24 (Public School Code), and Title 42 (Judicial Code).',
    author: 'Commonwealth Law Knowledge Engine',
    runtimeBindings: ['gemini', 'claude', 'universal'],
    dependencies: [],
    toolsRequired: ['legal.lookup', 'knowledge.search'],
    status: 'active',
    files: [
      { path: 'SKILL.md', sha256: 'a1b2c3d4e5f601', sizeBytes: 3420 },
      { path: 'references/title-18-crimes.txt', sha256: 'b2c3d4e5f601a2', sizeBytes: 18450 },
      { path: 'references/title-23-domestic.txt', sha256: 'c3d4e5f601a2b3', sizeBytes: 24500 }
    ],
    testsPassing: true,
    updatedAt: '2026-09-27T09:00:00Z'
  },
  {
    id: 'skill-accuracy-verification-pass',
    name: 'accuracy-verification-pass',
    version: '1.4.0',
    category: 'verification',
    description: 'Independent adversarial fact-checking pass that validates every substantive statement against primary source evidence and computes assertion credibility.',
    author: 'AI Operating Platform Security Team',
    runtimeBindings: ['claude', 'gemini', 'universal'],
    dependencies: ['skills-qa'],
    toolsRequired: ['verification.run', 'knowledge.search'],
    status: 'active',
    files: [
      { path: 'SKILL.md', sha256: 'd4e5f6a1b2c304', sizeBytes: 4120 },
      { path: 'references/legal-case-reference.md', sha256: 'e5f6a1b2c304d5', sizeBytes: 6200 }
    ],
    testsPassing: true,
    updatedAt: '2026-09-26T18:00:00Z'
  },
  {
    id: 'skill-pleading-fact-paragraphs',
    name: 'pleading-fact-paragraphs',
    version: '1.2.0',
    category: 'legal',
    description: 'Structures complex narratives into numbered averments adhering strictly to Pennsylvania Rule of Civil Procedure 1019.',
    author: 'Legal OS Team',
    runtimeBindings: ['claude', 'gemini'],
    dependencies: ['pa-law-reference'],
    toolsRequired: ['filesystem.write'],
    status: 'active',
    files: [
      { path: 'SKILL.md', sha256: 'f6a1b2c304d5e6', sizeBytes: 2980 }
    ],
    testsPassing: true,
    updatedAt: '2026-09-25T14:30:00Z'
  },
  {
    id: 'skill-matter-intake',
    name: 'matter-intake',
    version: '1.0.0',
    category: 'legal',
    description: 'Cold-start matter interview, UCCJEA jurisdiction verification, adverse party screening, and dossier establishment.',
    author: 'Legal OS Team',
    runtimeBindings: ['gemini', 'claude', 'openai'],
    dependencies: [],
    toolsRequired: ['google_forms.create', 'knowledge.search'],
    status: 'active',
    files: [
      { path: 'SKILL.md', sha256: 'a1b204d5e6f7a8', sizeBytes: 3150 }
    ],
    testsPassing: true,
    updatedAt: '2026-09-24T11:00:00Z'
  },
  {
    id: 'skill-claim-chart',
    name: 'claim-chart',
    version: '1.3.0',
    category: 'legal',
    description: 'Constructs two-column element-to-evidence claim charts for trial preparation and summary judgment motions.',
    author: 'Legal OS Team',
    runtimeBindings: ['claude', 'gemini'],
    dependencies: ['accuracy-verification-pass'],
    toolsRequired: ['filesystem.write'],
    status: 'active',
    files: [
      { path: 'SKILL.md', sha256: 'b2c304d5e6f7a9', sizeBytes: 3890 }
    ],
    testsPassing: true,
    updatedAt: '2026-09-23T16:00:00Z'
  }
];

export const SEED_PACKAGE_IMPORTS: PackageImport[] = [
  {
    id: 'pkg-imp-001',
    filename: 'legal_os_skills_bundle.zip',
    fileSizeBytes: 482104,
    mimeType: 'application/zip',
    detectedType: 'ZIP Archive (Safe)',
    sha256: '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d',
    status: 'registered',
    duplicateHandling: 'none',
    extractedFilesCount: 28,
    discoveredSkills: ['matter-intake', 'pleading-fact-paragraphs', 'pa-law-reference', 'claim-chart', 'chronology'],
    discoveredRuntimes: ['gemini', 'claude'],
    securityScan: {
      safe: true,
      pathTraversalDetected: false,
      vbaMacroDetected: false,
      excessiveNesting: false
    },
    importedAt: '2026-09-27T08:30:00Z',
    auditEventId: 'audit-001'
  },
  {
    id: 'pkg-imp-002',
    filename: 'financial_tracker_v3.xlsm',
    fileSizeBytes: 124500,
    mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12',
    detectedType: 'Microsoft Excel Macro-Enabled (XLSM)',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'validated',
    duplicateHandling: 'none',
    extractedFilesCount: 14,
    discoveredSkills: ['budget-tracker'],
    discoveredRuntimes: ['universal'],
    securityScan: {
      safe: true,
      pathTraversalDetected: false,
      vbaMacroDetected: true, // SPEC-002 Requirement: XLSM preservation with macro execution disabled
      excessiveNesting: false,
      quarantineReason: 'VBA macros preserved in immutable storage but auto-execution permanently disabled.'
    },
    importedAt: '2026-09-27T09:12:00Z',
    auditEventId: 'audit-002'
  },
  {
    id: 'pkg-imp-003',
    filename: 'suspicious_payload_escape.tar.gz',
    fileSizeBytes: 8920,
    mimeType: 'application/gzip',
    detectedType: 'POSIX tar archive (Malicious)',
    sha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    status: 'quarantined',
    duplicateHandling: 'none',
    extractedFilesCount: 0,
    discoveredSkills: [],
    discoveredRuntimes: [],
    securityScan: {
      safe: false,
      pathTraversalDetected: true,
      vbaMacroDetected: false,
      excessiveNesting: false,
      quarantineReason: 'Security Policy Violation: Absolute path traversal attempt "../../../../etc/shadow" detected in tar header.'
    },
    importedAt: '2026-09-26T22:45:00Z',
    auditEventId: 'audit-003'
  }
];

export const SEED_KNOWLEDGE_ENTITIES: KnowledgeEntity[] = [
  {
    id: 'ent-case-001',
    title: 'Doe v. Smith Custody Proceeding',
    type: 'Case',
    sourceSystem: 'Local',
    sourceId: 'docket-s-2026-0814',
    properties: { county: 'Schuylkill', judge: 'Family Division', filingDate: '2026-09-15' },
    version: 'v2',
    lastSyncedAt: '2026-09-27T10:00:00Z',
    provenance: { author: 'Jackson Latimore', hash: '5f4dcc3b5aa765d61d8327deb882cf99', evidenceClass: 'SOURCE_DECLARED' }
  },
  {
    id: 'ent-statute-5328',
    title: '23 Pa.C.S. § 5328 (The 16 Custody Factors)',
    type: 'Authority',
    sourceSystem: 'Applet',
    sourceId: 'pa-23-5328',
    properties: { title: 'Title 23', code: 'Domestic Relations', mandatory: true },
    version: '2024-Supp',
    lastSyncedAt: '2026-09-27T08:00:00Z',
    provenance: { author: 'Commonwealth Statutes', hash: '7c6a5400e1e52cadac7f73c52e694abf', evidenceClass: 'DETERMINISTIC' }
  },
  {
    id: 'ent-statute-2904',
    title: '18 Pa.C.S. § 2904 (Custody Interference)',
    type: 'Authority',
    sourceSystem: 'Applet',
    sourceId: 'pa-18-2904',
    properties: { grade: 'F3', title: 'Title 18', crimesCode: true },
    version: '2024-Supp',
    lastSyncedAt: '2026-09-27T08:00:00Z',
    provenance: { author: 'Commonwealth Statutes', hash: '6a204bd89f3c8348afd5c77c717a097a', evidenceClass: 'DETERMINISTIC' }
  },
  {
    id: 'ent-exhibit-a',
    title: 'School Attendance Improvement Conference (SAIC) Notice',
    type: 'Exhibit',
    sourceSystem: 'Google Drive',
    sourceId: 'drive-file-saic-notice-01',
    properties: { date: '2026-09-10', issuer: 'Pottsville Area School District' },
    version: 'v1',
    lastSyncedAt: '2026-09-27T09:30:00Z',
    provenance: { author: 'School Administrator', hash: '8b1a9953c4611296a827abf8c47804d7', evidenceClass: 'SOURCE_DECLARED' }
  },
  {
    id: 'ent-filing-complaint',
    title: 'Formal Verified Complaint for Custody',
    type: 'Filing',
    sourceSystem: 'Google Docs',
    sourceId: 'doc-complaint-draft-v3',
    properties: { relief: 'Shared Legal, Primary Physical', verified: true },
    version: 'v3',
    lastSyncedAt: '2026-09-27T10:15:00Z',
    provenance: { author: 'AI Legal Drafter', hash: '9f86d081884c7d659a2feaa0c55ad015', evidenceClass: 'AI_EXTRACTED' }
  }
];

export const SEED_KNOWLEDGE_EDGES: KnowledgeEdge[] = [
  {
    id: 'edge-1',
    sourceEntityId: 'ent-case-001',
    targetEntityId: 'ent-exhibit-a',
    relationshipType: 'HAS_EXHIBIT',
    evidenceClass: 'DETERMINISTIC',
    weight: 1.0,
    verified: true
  },
  {
    id: 'edge-2',
    sourceEntityId: 'ent-case-001',
    targetEntityId: 'ent-filing-complaint',
    relationshipType: 'HAS_DISCOVERY',
    evidenceClass: 'SOURCE_DECLARED',
    weight: 1.0,
    verified: true
  },
  {
    id: 'edge-3',
    sourceEntityId: 'ent-filing-complaint',
    targetEntityId: 'ent-statute-5328',
    relationshipType: 'CITES',
    evidenceClass: 'DETERMINISTIC',
    weight: 1.0,
    verified: true
  },
  {
    id: 'edge-4',
    sourceEntityId: 'ent-filing-complaint',
    targetEntityId: 'ent-statute-2904',
    relationshipType: 'CITES',
    evidenceClass: 'AI_EXTRACTED',
    weight: 0.95,
    verified: true
  }
];

export const SEED_CONFLICTS: KnowledgeConflict[] = [
  {
    id: 'conflict-001',
    entityId: 'ent-case-001',
    propertyName: 'primaryPhysicalResidence',
    sourceA: { system: 'Google Drive Intake Form', value: '123 Pine St, Pottsville PA', timestamp: '2026-09-20T12:00:00Z' },
    sourceB: { system: 'Notion Case Notes', value: '456 Elm St, Tamaqua PA', timestamp: '2026-09-26T15:30:00Z' },
    status: 'OPEN'
  }
];

export const SEED_APPROVALS: ApprovalRequest[] = [
  {
    id: 'appr-leg-01',
    workflowRunId: 'run-leg-101',
    stepId: 'step-5',
    agentId: 'agent-legal',
    actionName: 'Export Legal Pleading to Google Docs & Tasks',
    description: 'Export Verified Complaint for Child Custody to client Google Docs and schedule 20-day exceptions deadline in Google Tasks.',
    toolClass: 'Controlled Mutation',
    riskLevel: 'MEDIUM',
    requestedBy: 'Legal Agent (gemini-3.1-pro-preview)',
    beforeState: { docExists: false, tasksScheduled: 0 },
    proposedState: {
      docTitle: 'Complaint for Child Custody - Doe v. Smith',
      tasks: ['Schuylkill Cnty. L.R.C.P. 1915.3 20-day exceptions window'],
      destinationDrivePath: '/Google Drive/Cases/Doe_v_Smith/'
    },
    sourceEntities: ['ent-case-001', 'ent-statute-5328', 'ent-filing-complaint'],
    status: 'pending',
    createdAt: '2026-09-27T10:16:46Z'
  },
  {
    id: 'appr-mkt-02',
    actionName: 'Publish Social Media Campaign',
    description: 'Broadcast Q4 Family Law Educational Campaign to LinkedIn and Facebook Pages.',
    toolClass: 'External Action',
    riskLevel: 'HIGH',
    requestedBy: 'Marketing Agent',
    beforeState: { liveCampaigns: 2 },
    proposedState: { liveCampaigns: 3, budgetAllocated: '$250/wk' },
    sourceEntities: ['canva-brand-kit'],
    status: 'pending',
    createdAt: '2026-09-27T09:40:00Z'
  }
];

export const SEED_VERIFICATION_RUNS: VerificationRun[] = [
  {
    id: 'ver-run-001',
    targetName: 'Custody Complaint Pleadings Averments',
    targetType: 'Court Pleading',
    status: 'VERIFIED',
    unsupportedAssertionsCount: 0,
    verifiedAt: '2026-09-27T10:16:30Z',
    checks: [
      { id: 'vc-1', name: 'Primary Statutory Section Citations', passed: true, severity: 'INFO', details: 'All citations (23 Pa.C.S. § 5328, 23 Pa.C.S. § 5336) match official PA Consolidated Statutes.' },
      { id: 'vc-2', name: 'Verification Affidavit Compliance (Pa.R.C.P. 1024)', passed: true, severity: 'INFO', details: 'Standard verification clause includes 18 Pa.C.S. § 4904 criminal unsworn falsification notice.' },
      { id: 'vc-3', name: '5-Year Child Residence Accounting', passed: true, severity: 'INFO', details: 'Continuous residence history documented pursuant to Pa.R.C.P. 1915.15 § 4.' },
      { id: 'vc-4', name: 'Statute of Limitations Exemption Validation', passed: true, severity: 'INFO', details: 'Child custody action confirmed statutorily exempt from procedural time bar under 23 Pa.C.S. § 5338.' }
    ]
  },
  {
    id: 'ver-run-002',
    targetName: 'Discovery Rule Injury Accrual Argument',
    targetType: 'Legal Diagnostic Memorandum',
    status: 'VERIFIED',
    unsupportedAssertionsCount: 0,
    verifiedAt: '2026-09-27T08:50:00Z',
    checks: [
      { id: 'vc-201', name: 'Fine v. Checcio Standard Adherence', passed: true, severity: 'INFO', details: 'Supreme Court standard 582 Pa. 253 correctly articulated regarding reasonable diligence.' },
      { id: 'vc-202', name: '42 Pa.C.S. § 5524(2) 2-Year Limitation Baseline', passed: true, severity: 'INFO', details: 'Accrual trigger and discovery tolling correctly separated.' }
    ]
  }
];

export const SEED_CONNECTORS: IntegrationConnector[] = [
  {
    id: 'conn-drive',
    name: 'Google Drive',
    serviceCategory: 'workspace',
    status: 'connected',
    syncMode: 'EVENT_PLUS_RECONCILIATION',
    lastCheckpoint: '2026-09-27T11:45:00Z',
    health: 'healthy',
    eventsProcessed: 142,
    rateLimitUsagePercent: 12,
    killSwitchEnabled: false,
    scopes: ['https://www.googleapis.com/auth/drive.file']
  },
  {
    id: 'conn-docs',
    name: 'Google Docs',
    serviceCategory: 'workspace',
    status: 'connected',
    syncMode: 'EVENT',
    lastCheckpoint: '2026-09-27T11:45:00Z',
    health: 'healthy',
    eventsProcessed: 68,
    rateLimitUsagePercent: 8,
    killSwitchEnabled: false,
    scopes: ['https://www.googleapis.com/auth/documents']
  },
  {
    id: 'conn-tasks',
    name: 'Google Tasks',
    serviceCategory: 'workspace',
    status: 'connected',
    syncMode: 'SCHEDULED',
    lastCheckpoint: '2026-09-27T11:45:00Z',
    health: 'healthy',
    eventsProcessed: 34,
    rateLimitUsagePercent: 4,
    killSwitchEnabled: false,
    scopes: ['https://www.googleapis.com/auth/tasks']
  },
  {
    id: 'conn-chat',
    name: 'Google Chat',
    serviceCategory: 'workspace',
    status: 'connected',
    syncMode: 'EVENT',
    lastCheckpoint: '2026-09-27T11:45:00Z',
    health: 'healthy',
    eventsProcessed: 19,
    rateLimitUsagePercent: 2,
    killSwitchEnabled: false,
    scopes: ['https://www.googleapis.com/auth/chat.spaces', 'https://www.googleapis.com/auth/chat.messages']
  },
  {
    id: 'conn-forms',
    name: 'Google Forms',
    serviceCategory: 'workspace',
    status: 'connected',
    syncMode: 'EVENT',
    lastCheckpoint: '2026-09-27T11:45:00Z',
    health: 'healthy',
    eventsProcessed: 12,
    rateLimitUsagePercent: 1,
    killSwitchEnabled: false,
    scopes: ['https://www.googleapis.com/auth/forms.body']
  },
  {
    id: 'conn-meet',
    name: 'Google Meet',
    serviceCategory: 'workspace',
    status: 'connected',
    syncMode: 'MANUAL',
    lastCheckpoint: '2026-09-27T11:45:00Z',
    health: 'healthy',
    eventsProcessed: 8,
    rateLimitUsagePercent: 1,
    killSwitchEnabled: false,
    scopes: ['https://www.googleapis.com/auth/meetings.space.created']
  },
  {
    id: 'conn-notion',
    name: 'Notion',
    serviceCategory: 'productivity',
    status: 'connected',
    syncMode: 'SCHEDULED',
    lastCheckpoint: '2026-09-27T11:00:00Z',
    health: 'healthy',
    eventsProcessed: 520,
    rateLimitUsagePercent: 18,
    killSwitchEnabled: false,
    scopes: ['notion.read', 'notion.write']
  },
  {
    id: 'conn-github',
    name: 'GitHub',
    serviceCategory: 'engineering',
    status: 'connected',
    syncMode: 'EVENT',
    lastCheckpoint: '2026-09-27T11:30:00Z',
    health: 'healthy',
    eventsProcessed: 310,
    rateLimitUsagePercent: 14,
    killSwitchEnabled: false,
    scopes: ['repo', 'workflow']
  },
  {
    id: 'conn-supabase',
    name: 'Supabase',
    serviceCategory: 'database',
    status: 'connected',
    syncMode: 'EVENT_PLUS_RECONCILIATION',
    lastCheckpoint: '2026-09-27T11:40:00Z',
    health: 'healthy',
    eventsProcessed: 1840,
    rateLimitUsagePercent: 24,
    killSwitchEnabled: false,
    scopes: ['db.read', 'db.write', 'pgvector']
  },
  {
    id: 'conn-canva',
    name: 'Canva',
    serviceCategory: 'design',
    status: 'connected',
    syncMode: 'MANUAL',
    lastCheckpoint: '2026-09-26T20:00:00Z',
    health: 'healthy',
    eventsProcessed: 45,
    rateLimitUsagePercent: 5,
    killSwitchEnabled: false,
    scopes: ['design:content:read', 'design:content:write']
  }
];

export const SEED_KILL_SWITCH: GlobalKillSwitch = {
  globalAutonomousActionsDisabled: true, // SPEC-007: Default safe state
  allowedActions: ['login', 'read-only search', 'analysis', 'artifact/audit viewing'],
  blockedActions: ['controlled mutations', 'external actions', 'deployments', 'publishing', 'agent operator actions'],
  killSwitchEngagedAt: '2026-09-27T08:00:00Z',
  engagedBy: 'Platform Policy Default (SPEC-007 Safe Mode)',
  emergencyNotice: 'System operates in Zero-Trust bounded supervision. All external mutations and autonomous writes require explicit human verification and confirmation.'
};

export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-09-27T11:46:01Z',
    actor: 'User (Jackson Latimore)',
    action: 'OAUTH_SCOPES_AUTHORIZED',
    target: 'Google Workspace (Drive, Docs, Tasks, Chat, Forms, Meet)',
    workspaceId: 'ws-legal',
    status: 'SUCCESS',
    details: { scopesCount: 7, brandName: "JACKSON LATIMORE's Apps", projectId: 'gen-lang-client-0441531087' }
  },
  {
    id: 'aud-002',
    timestamp: '2026-09-27T11:47:09Z',
    actor: 'Platform Engine',
    action: 'FIREBASE_PROVISIONED',
    target: 'Firestore Database: ai-studio-13e55179-aaaa-40f1-af68-dd3f844e3078',
    workspaceId: 'ws-legal',
    status: 'SUCCESS',
    details: { platform: 'web', rulesVersion: '2' }
  },
  {
    id: 'aud-003',
    timestamp: '2026-09-27T10:16:30Z',
    actor: 'agent-verification',
    action: 'VERIFICATION_PASS_COMPLETED',
    target: 'Draft Pleading: Complaint for Custody',
    workspaceId: 'ws-legal',
    status: 'SUCCESS',
    details: { unsupportedAssertions: 0, verifiedCitations: 3, checkScore: '100%' }
  },
  {
    id: 'aud-004',
    timestamp: '2026-09-27T09:12:00Z',
    actor: 'Safe Ingestion Engine',
    action: 'PACKAGE_INGESTED_MACROS_DISABLED',
    target: 'financial_tracker_v3.xlsm',
    workspaceId: 'ws-business',
    status: 'SUCCESS',
    details: { sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', vbaExecutionLocked: true }
  },
  {
    id: 'aud-005',
    timestamp: '2026-09-26T22:45:00Z',
    actor: 'Security Scan Worker',
    action: 'MALICIOUS_PACKAGE_QUARANTINED',
    target: 'suspicious_payload_escape.tar.gz',
    workspaceId: 'ws-engineering',
    status: 'QUARANTINED',
    details: { reason: 'Path traversal attempt ../../../../etc/shadow in tar header', isolationPath: '/imports/quarantine/' }
  }
];
