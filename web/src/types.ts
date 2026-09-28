export type LegalCategory =
  | 'all'
  | 'crimes'
  | 'domestic_relations'
  | 'education'
  | 'civil_procedure'
  | 'juvenile_matters'
  | 'constitutional'
  | 'local_rules'
  | 'ferpa';

export interface RelatedAuthority {
  title: string;
  citation: string;
  note: string;
}

export interface StatuteItem {
  id: string;
  titleNumber: string;
  titleName: string;
  chapterNumber?: string;
  chapterName?: string;
  sectionNumber: string;
  heading: string;
  citation: string;
  summary: string;
  fullText: string;
  elements: string[];
  defensesOrExceptions?: string[];
  gradeOrSeverity?: string;
  statuteOfLimitations?: string;
  relatedAuthorities?: RelatedAuthority[];
  category: LegalCategory;
  tags: string[];
}

export interface CaseGuidance {
  id: string;
  caseOrDocumentName: string;
  officialCitation: string;
  issuingAuthority: string;
  dateOrYear: string;
  topic: string;
  holdingOrPrinciple: string;
  fullSummary: string;
  keyTakeaways: string[];
  practicalApplication: string;
  category: LegalCategory;
}

export interface PleadingTemplate {
  id: string;
  title: string;
  subtitle: string;
  courtVenue: string;
  description: string;
  category: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    type: 'text' | 'textarea' | 'date' | 'select';
    defaultValue?: string;
    options?: string[];
    required?: boolean;
    helpText?: string;
  }[];
  generateText: (data: Record<string, string>) => string;
}

export interface SolItem {
  id: string;
  claimCategory: string;
  causeOfAction: string;
  statutoryBasis: string;
  limitationPeriod: string;
  periodInYears: number;
  accrualRule: string;
  tollingRules: string[];
  keyCases: string;
}

export interface SavedResearchItem {
  id: string;
  userId?: string;
  type: 'statute' | 'case' | 'analysis' | 'pleading' | 'citation';
  title: string;
  citation?: string;
  savedAt: string;
  notes?: string;
  payload: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  isThinking?: boolean;
  groundingSources?: {
    title: string;
    url: string;
  }[];
}

export interface WorkspaceExportItem {
  id: string;
  service: 'drive' | 'docs' | 'tasks' | 'chat' | 'forms' | 'meet';
  title: string;
  externalId?: string;
  externalUrl?: string;
  timestamp: string;
  details?: string;
}

export interface RecentSearchItem {
  id: string;
  userId?: string;
  query: string;
  statuteId?: string;
  statuteCitation?: string;
  statuteHeading?: string;
  category?: string;
  searchedAt: string;
  resultsCount?: number;
}
