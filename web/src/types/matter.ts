export type MatterStage = 'INTAKE' | 'EVIDENCE' | 'PLEADINGS' | 'DISCOVERY' | 'MOTIONS' | 'HEARING_PREP';

export interface Matter {
  id: string;
  docketNumber: string;
  caption: string;
  court: string;
  county: string;
  assignedJudge: string;
  filingDate: string;
  stage: MatterStage;
  parties: {
    plaintiffs: string[];
    defendants: string[];
  };
  privacyStatus: 'SESSION_ONLY' | 'FIRESTORE_ISOLATED';
  summary: string;
  claimsCount: number;
}

export type DocumentType = 'PLEADING' | 'EXHIBIT' | 'DISCOVERY' | 'ORDER' | 'EVIDENCE';
export type DocumentStatus = 'ORIGINAL_SOURCE_IMMUTABLE' | 'VERIFIED_WORKING_DRAFT' | 'APPROVED_FOR_FILING';

export interface MatterDocument {
  id: string;
  title: string;
  type: DocumentType;
  exhibitLetter?: string; // 'A', 'B', 'C', 'D', 'E'
  date: string;
  status: DocumentStatus;
  content: string;
  fileSizeBytes: number;
  isOriginalSAC?: boolean;
  notes?: string;
}

export interface ChronologyEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  sourceDocumentId: string;
  sourceExhibit?: string;
  supportingParagraphs: number[];
  actors: string[];
  category: 'AGENCY_ACTION' | 'HEARING' | 'FILING' | 'COMMUNICATION' | 'MEDICAL_EVAL';
}

export interface MatterTask {
  id: string;
  title: string;
  ruleReference: string;
  deadline: string;
  daysRemaining: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  assignedTo: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SACParagraph {
  number: number;
  section:
    | 'CAPTION'
    | 'PARTIES'
    | 'JURISDICTION'
    | 'FACTS'
    | 'COUNT_I'
    | 'COUNT_II'
    | 'COUNT_III'
    | 'COUNT_IV'
    | 'COUNT_V'
    | 'PRAYER'
    | 'VERIFICATION';
  text: string;
  originalText: string;
  citedExhibits: {
    exhibitLetter: string;
    page?: number;
    quotedText?: string;
  }[];
  citedStatutes: string[];
  hasIssues?: boolean;
  approvedFixId?: string;
}

export interface SACCountElement {
  id: string;
  name: string;
  description: string;
  supportingParagraphs: number[];
  satisfied: boolean;
  notes: string;
}

export interface SACCount {
  id: string;
  numberRoman: string; // 'COUNT I', 'COUNT II', etc.
  title: string;
  legalBasis: string;
  elements: SACCountElement[];
  prayerText: string;
}

export type IssueCategory =
  | 'NUMBERING'
  | 'EXHIBIT_LABEL'
  | 'NAMES_AND_DATES'
  | 'QUOTATION'
  | 'LEGAL_CITATION'
  | 'COUNT_ELEMENT';

export type IssueSeverity = 'CRITICAL' | 'WARNING' | 'ADVISORY';

export interface VerificationIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  paragraphNumber?: number;
  locationDescription: string;
  sourceUsedToFlag: string;
  detectedIssue: string;
  proposedCorrection: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
