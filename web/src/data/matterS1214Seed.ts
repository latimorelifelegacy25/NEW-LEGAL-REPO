import { Matter, MatterDocument, ChronologyEvent, MatterTask, SACParagraph, SACCount, VerificationIssue } from '../types/matter';

export const SEED_MATTER_S1214: Matter = {
  id: 'matter-s-1214-2026',
  docketNumber: 'S-1214-2026',
  caption: 'Latimore v. Assumption BVM School, Diocese of Allentown, and Carol Boyer',
  court: 'Court of Common Pleas of Schuylkill County, Pennsylvania',
  county: 'Schuylkill County',
  assignedJudge: 'Not set in public application seed',
  filingDate: '2026-07-01',
  stage: 'PLEADINGS',
  parties: {
    plaintiffs: ['Jackson M. Latimore Sr., Plaintiff, Pro Se'],
    defendants: ['Assumption BVM School', 'Diocese of Allentown', 'Carol Boyer']
  },
  privacyStatus: 'SESSION_ONLY',
  summary: 'Private matter shell. Source documents and exhibits are intentionally excluded from the public application bundle. Load the SAC and exhibits through the private matter workspace.',
  claimsCount: 5
};

export const SEED_MATTER_DOCUMENTS: MatterDocument[] = [{
  id: 'private-materials-readme',
  title: 'Private matter materials not loaded',
  type: 'EVIDENCE',
  date: '2026-09-27',
  status: 'ORIGINAL_SOURCE_IMMUTABLE',
  fileSizeBytes: 0,
  content: 'No confidential pleading or exhibit text is bundled with the public application. Upload or paste the Second Amended Complaint and exhibits in this workspace to begin source-grounded review.',
  notes: 'Privacy boundary marker; not a case exhibit.'
}];

export const SEED_CHRONOLOGY_EVENTS: ChronologyEvent[] = [];
export const SEED_MATTER_TASKS: MatterTask[] = [{
  id: 'task-load-sac',
  title: 'Load Second Amended Complaint as immutable source document',
  ruleReference: 'Legal OS acceptance workflow',
  deadline: '',
  daysRemaining: 0,
  status: 'IN_PROGRESS',
  assignedTo: 'Plaintiff, Pro Se',
  priority: 'HIGH'
}];
export const SEED_SAC_PARAGRAPHS: SACParagraph[] = [];
export const SEED_SAC_COUNTS: SACCount[] = [];
export const SEED_VERIFICATION_ISSUES: VerificationIssue[] = [];
