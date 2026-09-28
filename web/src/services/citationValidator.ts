import { PA_STATUTES } from '../data/paLawData';
import { StatuteItem } from '../types';
import { SACParagraph } from '../types/matter';

export type CitationValidationStatus =
  | 'VERIFIED'
  | 'FORMAT_WARNING'
  | 'MISSING_CITATION'
  | 'UNRESOLVED';

export interface CitationValidationItem {
  id: string;
  paragraphNumber: number;
  rawCitation: string;
  normalizedCitation: string;
  status: CitationValidationStatus;
  matchedStatuteId?: string;
  statuteHeading?: string;
  formatIssueDescription?: string;
  recommendedOfficialFormat?: string;
  suggestedCorrection?: string;
  governingCategory?: string;
  contextSnippet?: string;
}

export interface CitationAuditSummary {
  totalParagraphsAudited: number;
  totalCitationsFound: number;
  verifiedCount: number;
  formatWarningCount: number;
  missingCitationCount: number;
  unresolvedCount: number;
  complianceScorePercent: number;
  results: CitationValidationItem[];
}

/**
 * Cross-references document citations found in text or parsed paragraphs
 * against the loaded PA Legal reference database (PA_STATUTES).
 */
export class CitationValidator {
  private static statuteDatabase: StatuteItem[] = PA_STATUTES;

  /**
   * Find official statute by citation string
   */
  public static findStatute(citationText: string): StatuteItem | undefined {
    const cleanSearch = citationText
      .replace(/[§\s\.\(\)]/g, '')
      .toLowerCase();

    return this.statuteDatabase.find((statute) => {
      const cleanOfficial = statute.citation
        .replace(/[§\s\.\(\)]/g, '')
        .toLowerCase();
      if (cleanOfficial === cleanSearch) return true;

      // Match section number + title
      const secNum = statute.sectionNumber.replace(/[§\s]/g, '');
      const titNum = statute.titleNumber.replace(/[^\d]/g, '');
      if (cleanSearch.includes(titNum) && cleanSearch.includes(secNum)) return true;

      return false;
    });
  }

  /**
   * Normalize and validate a citation string under Pennsylvania appellate citation rules (Pa.R.A.P. 124 / Bluebook)
   */
  public static validateCitationString(raw: string): {
    normalized: string;
    isOfficialFormat: boolean;
    formatIssue?: string;
    matchedStatute?: StatuteItem;
  } {
    const trimmed = raw.trim();

    // Check for common PA Consolidated Statutes: e.g. "23 Pa.C.S. § 5328"
    const pacsMatch = trimmed.match(
      /(\d+)\s*(?:Pa\.?\s*C\.?\s*S\.?|PACS|PaCS)\s*§?\s*([0-9A-Za-z\.\-]+(?:\([a-z0-9]+\))*)/i
    );

    if (pacsMatch) {
      const title = pacsMatch[1];
      const section = pacsMatch[2];
      const normalized = `${title} Pa.C.S. § ${section}`;
      const matched = this.statuteDatabase.find(
        (s) =>
          s.citation.toLowerCase().includes(`${title} pa.c.s.`) &&
          s.citation.toLowerCase().includes(section.toLowerCase())
      );

      const hasPeriodAndSpace = /^\d+\sPa\.C\.S\.\s§\s[0-9A-Za-z\.\-]+/.test(trimmed);

      if (!hasPeriodAndSpace) {
        return {
          normalized,
          isOfficialFormat: false,
          formatIssue: `Improper abbreviation or spacing in "${trimmed}". Pennsylvania appellate standard requires periods and section symbol (e.g. "${normalized}").`,
          matchedStatute: matched
        };
      }

      return {
        normalized,
        isOfficialFormat: true,
        matchedStatute: matched
      };
    }

    // Check for Purdon's Statutes: e.g. "24 P.S. § 13-1327"
    const psMatch = trimmed.match(
      /(\d+)\s*(?:P\.?\s*S\.?|PS)\s*§?\s*([0-9A-Za-z\.\-]+(?:\([a-z0-9]+\))*)/i
    );

    if (psMatch) {
      const title = psMatch[1];
      const section = psMatch[2];
      const normalized = `${title} P.S. § ${section}`;
      const matched = this.statuteDatabase.find(
        (s) =>
          s.citation.toLowerCase().includes(`${title} p.s.`) &&
          s.citation.toLowerCase().includes(section.toLowerCase())
      );

      const hasPeriodAndSpace = /^\d+\sP\.S\.\s§\s[0-9A-Za-z\.\-]+/.test(trimmed);
      if (!hasPeriodAndSpace) {
        return {
          normalized,
          isOfficialFormat: false,
          formatIssue: `Improper abbreviation in "${trimmed}". Official PA Purdon's format is "${normalized}".`,
          matchedStatute: matched
        };
      }

      return {
        normalized,
        isOfficialFormat: true,
        matchedStatute: matched
      };
    }

    // Check for Rules of Civil Procedure: e.g. "Pa.R.C.P. 1019"
    const paRcpMatch = trimmed.match(
      /(?:Pa\.?\s*R\.?\s*C\.?\s*P\.?|PaRCP)\s*(?:No\.?\s*)?([0-9\.]+)/i
    );

    if (paRcpMatch) {
      const ruleNum = paRcpMatch[1];
      const normalized = `Pa.R.C.P. ${ruleNum}`;
      const isOfficial = trimmed.startsWith('Pa.R.C.P. ');
      const matched = this.statuteDatabase.find((s) => s.citation.includes(ruleNum));

      return {
        normalized,
        isOfficialFormat: isOfficial,
        formatIssue: isOfficial
          ? undefined
          : `Non-standard Civil Procedure rule citation. Correct format is "${normalized}".`,
        matchedStatute: matched
      };
    }

    // Check for PA Code regulations: e.g. "22 Pa. Code § 235.4"
    const paCodeMatch = trimmed.match(
      /(\d+)\s*(?:Pa\.?\s*Code)\s*§?\s*([0-9A-Za-z\.\-]+)/i
    );

    if (paCodeMatch) {
      const title = paCodeMatch[1];
      const section = paCodeMatch[2];
      const normalized = `${title} Pa. Code § ${section}`;
      return {
        normalized,
        isOfficialFormat: trimmed.includes('Pa. Code §'),
        formatIssue: trimmed.includes('Pa. Code §')
          ? undefined
          : `PA Code citation must include title and section symbol: "${normalized}".`
      };
    }

    return {
      normalized: trimmed,
      isOfficialFormat: false,
      formatIssue: 'Citation does not match recognized Pennsylvania statutory, procedural, or regulatory format.'
    };
  }

  /**
   * Scan paragraphs for legal citations and missing mandatory citations
   */
  public static auditParagraphs(paragraphs: SACParagraph[]): CitationAuditSummary {
    const results: CitationValidationItem[] = [];
    let totalCitations = 0;
    let verifiedCount = 0;
    let formatWarningCount = 0;
    let missingCitationCount = 0;
    let unresolvedCount = 0;

    paragraphs.forEach((para) => {
      const text = para.text;

      // 1. Detect citations in text using regex
      const citationRegex =
        /(?:\d+\s*(?:Pa\.?\s*C\.?\s*S\.?|PACS|PaCS|P\.?\s*S\.?|PS)\s*§?\s*[0-9A-Za-z\.\-]+)|(?:Pa\.?\s*R\.?\s*C\.?\s*P\.?\s*(?:No\.?\s*)?[0-9\.]+)|(?:(?:23|42|18|24)\s*Pa\.C\.S\.\s*§?\s*\d+)/gi;

      const matchedStrings = Array.from(text.matchAll(citationRegex)).map((m) => m[0]);
      const uniqueRaw = Array.from(new Set(matchedStrings));

      uniqueRaw.forEach((rawCitation) => {
        totalCitations++;
        const validation = this.validateCitationString(rawCitation);

        if (validation.isOfficialFormat && validation.matchedStatute) {
          verifiedCount++;
          results.push({
            id: `cit-${para.number}-${totalCitations}`,
            paragraphNumber: para.number,
            rawCitation,
            normalizedCitation: validation.normalized,
            status: 'VERIFIED',
            matchedStatuteId: validation.matchedStatute.id,
            statuteHeading: validation.matchedStatute.heading,
            governingCategory: validation.matchedStatute.category,
            contextSnippet: text.slice(0, 140) + '...'
          });
        } else if (!validation.isOfficialFormat && validation.matchedStatute) {
          formatWarningCount++;
          results.push({
            id: `cit-${para.number}-${totalCitations}`,
            paragraphNumber: para.number,
            rawCitation,
            normalizedCitation: validation.normalized,
            status: 'FORMAT_WARNING',
            matchedStatuteId: validation.matchedStatute.id,
            statuteHeading: validation.matchedStatute.heading,
            formatIssueDescription: validation.formatIssue,
            recommendedOfficialFormat: validation.normalized,
            suggestedCorrection: text.replace(rawCitation, validation.normalized),
            governingCategory: validation.matchedStatute.category,
            contextSnippet: text.slice(0, 140) + '...'
          });
        } else if (validation.matchedStatute) {
          verifiedCount++;
          results.push({
            id: `cit-${para.number}-${totalCitations}`,
            paragraphNumber: para.number,
            rawCitation,
            normalizedCitation: validation.normalized,
            status: 'VERIFIED',
            matchedStatuteId: validation.matchedStatute.id,
            statuteHeading: validation.matchedStatute.heading,
            contextSnippet: text.slice(0, 140) + '...'
          });
        } else {
          unresolvedCount++;
          results.push({
            id: `cit-${para.number}-${totalCitations}`,
            paragraphNumber: para.number,
            rawCitation,
            normalizedCitation: validation.normalized,
            status: 'UNRESOLVED',
            formatIssueDescription: `Citation "${rawCitation}" was not located in the Pennsylvania statutory database.`,
            recommendedOfficialFormat: validation.normalized,
            contextSnippet: text.slice(0, 140) + '...'
          });
        }
      });

      // 2. Detect missing mandatory legal citations based on substantive factual allegations
      const lower = text.toLowerCase();

      // Check for ungrounded custody factor allegations
      if (
        (lower.includes('custody factor') || lower.includes('best interests of the child') || lower.includes('parental fitness factor')) &&
        !lower.includes('5328')
      ) {
        missingCitationCount++;
        results.push({
          id: `missing-cit-5328-${para.number}`,
          paragraphNumber: para.number,
          rawCitation: '[Missing Citation]',
          normalizedCitation: '23 Pa.C.S. § 5328',
          status: 'MISSING_CITATION',
          matchedStatuteId: 'pa-23-5328',
          statuteHeading: 'Factors in awarding custody (The 16 Statutory Factors)',
          formatIssueDescription: 'Paragraph alleges statutory custody factor evaluation but omits mandatory citation to 23 Pa.C.S. § 5328.',
          recommendedOfficialFormat: '23 Pa.C.S. § 5328',
          suggestedCorrection: `${text.trim()} pursuant to 23 Pa.C.S. § 5328.`,
          governingCategory: 'domestic-relations',
          contextSnippet: text.slice(0, 140) + '...'
        });
      }

      // Check for ungrounded governmental immunity exception
      if (
        (lower.includes('governmental immunity') || lower.includes('political subdivision') || lower.includes('tort claims act')) &&
        !lower.includes('8542') &&
        !lower.includes('8541')
      ) {
        missingCitationCount++;
        results.push({
          id: `missing-cit-8542-${para.number}`,
          paragraphNumber: para.number,
          rawCitation: '[Missing Citation]',
          normalizedCitation: '42 Pa.C.S. § 8542',
          status: 'MISSING_CITATION',
          matchedStatuteId: 'pa-42-8542',
          statuteHeading: 'Exceptions to governmental immunity',
          formatIssueDescription: 'Paragraph asserts municipal agency liability but omits mandatory waiver authority under 42 Pa.C.S. § 8542.',
          recommendedOfficialFormat: '42 Pa.C.S. § 8542',
          suggestedCorrection: `${text.trim()} under 42 Pa.C.S. § 8542.`,
          governingCategory: 'civil-procedure',
          contextSnippet: text.slice(0, 140) + '...'
        });
      }

      // Check for procedural verification requirements (Pa.R.C.P. 1024)
      if (
        (lower.includes('verified by plaintiff') || lower.includes('under penalty of perjury') || lower.includes('verification clause')) &&
        !lower.includes('1024')
      ) {
        missingCitationCount++;
        results.push({
          id: `missing-cit-1024-${para.number}`,
          paragraphNumber: para.number,
          rawCitation: '[Missing Citation]',
          normalizedCitation: 'Pa.R.C.P. 1024',
          status: 'MISSING_CITATION',
          statuteHeading: 'Verification of Pleadings',
          formatIssueDescription: 'Verification clause must reference Pa.R.C.P. 1024 compliance.',
          recommendedOfficialFormat: 'Pa.R.C.P. 1024',
          suggestedCorrection: `${text.trim()} pursuant to Pa.R.C.P. 1024.`,
          governingCategory: 'civil-procedure',
          contextSnippet: text.slice(0, 140) + '...'
        });
      }
    });

    const totalAuditedItems = verifiedCount + formatWarningCount + missingCitationCount + unresolvedCount;
    const complianceScorePercent =
      totalAuditedItems > 0 ? Math.round((verifiedCount / totalAuditedItems) * 100) : 100;

    return {
      totalParagraphsAudited: paragraphs.length,
      totalCitationsFound: totalCitations,
      verifiedCount,
      formatWarningCount,
      missingCitationCount,
      unresolvedCount,
      complianceScorePercent,
      results
    };
  }

  /**
   * Search database for matching statute by keyword or citation
   */
  public static searchReferenceDatabase(query: string): StatuteItem[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.statuteDatabase;

    return this.statuteDatabase.filter(
      (s) =>
        s.citation.toLowerCase().includes(q) ||
        s.heading.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
}
