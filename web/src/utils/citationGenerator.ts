/**
 * Bluebook & Pennsylvania Court Citation Generator Utility
 * Pursuant to The Bluebook: A Uniform System of Citation (Rule 12 & Table T.1.3)
 * and Pennsylvania Appellate Practice (Pa.R.A.P. 124 / PA Superior & Supreme Court Standards).
 */

export interface CitationOptions {
  subsection?: string; // e.g., "(a)(1)"
  year?: string; // e.g., "2024"
  publisher?: string; // e.g., "West"
  parenthetical?: string; // e.g., "mandating judicial consideration of 16 custody factors"
}

export interface GeneratedCitations {
  bluebookStandard: string;
  paCourtPractice: string;
  purdonsAnnotated: string;
  shortFormId: string;
  shortFormSection: string;
  explanatoryParenthetical: string;
  fullWithHeading: string;
  citationType: 'Pa.C.S.' | 'P.S.' | 'Pa. Code' | 'Pa.R.C.P.' | 'Local Rule' | 'C.F.R.' | 'General';
}

/**
 * Parses a citation string and creates standardized Bluebook & PA Court citations
 */
export function generateBluebookCitations(
  citation: string,
  heading: string = '',
  summary: string = '',
  options: CitationOptions = {}
): GeneratedCitations {
  const currentYear = options.year || '2024';
  const sub = options.subsection ? options.subsection.trim().replace(/^([^(])/, '($1').replace(/([^)])$/, '$1)') : '';
  const publisher = options.publisher || 'West';

  // Extract parenthetical note from options or summary
  let parenText = options.parenthetical;
  if (!parenText && summary) {
    const cleanSummary = summary.replace(/\.$/, '');
    if (cleanSummary.length > 80) {
      parenText = cleanSummary.substring(0, 77) + '...';
    } else {
      parenText = cleanSummary;
    }
    parenText = parenText.charAt(0).toLowerCase() + parenText.slice(1);
  }

  const cleanCit = citation.trim();

  // 1. Pennsylvania Consolidated Statutes (e.g., "18 Pa.C.S. § 2904" or "23 Pa.C.S. § 5328")
  const pacsMatch = cleanCit.match(/^(\d+)\s*Pa\.C\.S\.?\s*(?:§|sec\.)?\s*([0-9a-zA-Z\.\-]+)/i);
  if (pacsMatch) {
    const title = pacsMatch[1];
    const section = pacsMatch[2];
    const fullSec = `${section}${sub}`;

    return {
      citationType: 'Pa.C.S.',
      bluebookStandard: `${title} Pa. Cons. Stat. § ${fullSec} (${currentYear})`,
      paCourtPractice: `${title} Pa.C.S. § ${fullSec}`,
      purdonsAnnotated: `${title} Pa.C.S.A. § ${fullSec} (${publisher} ${currentYear})`,
      shortFormId: `Id. § ${fullSec}`,
      shortFormSection: `${title} Pa.C.S. § ${fullSec}`,
      explanatoryParenthetical: `${title} Pa.C.S. § ${fullSec}${parenText ? ` (${parenText})` : ''}`,
      fullWithHeading: heading ? `${title} Pa.C.S. § ${fullSec} ("${heading}")` : `${title} Pa.C.S. § ${fullSec}`
    };
  }

  // 2. Purdon's Unconsolidated Statutes (e.g., "24 P.S. § 13-1327")
  const psMatch = cleanCit.match(/^(\d+)\s*P\.S\.?\s*(?:§|sec\.)?\s*([0-9a-zA-Z\.\-]+)/i);
  if (psMatch) {
    const title = psMatch[1];
    const section = psMatch[2];
    const fullSec = `${section}${sub}`;

    return {
      citationType: 'P.S.',
      bluebookStandard: `${title} Pa. Stat. Ann. § ${fullSec} (${publisher} ${currentYear})`,
      paCourtPractice: `${title} P.S. § ${fullSec}`,
      purdonsAnnotated: `${title} P.S. § ${fullSec} (${publisher} ${currentYear})`,
      shortFormId: `Id. § ${fullSec}`,
      shortFormSection: `${title} P.S. § ${fullSec}`,
      explanatoryParenthetical: `${title} P.S. § ${fullSec}${parenText ? ` (${parenText})` : ''}`,
      fullWithHeading: heading ? `${title} P.S. § ${fullSec} ("${heading}")` : `${title} P.S. § ${fullSec}`
    };
  }

  // 3. Pennsylvania Code Administrative Regulations (e.g., "22 Pa. Code § 235.4")
  const paCodeMatch = cleanCit.match(/^(\d+)\s*Pa\.\s*Code\s*(?:§|sec\.)?\s*([0-9a-zA-Z\.\-]+)/i);
  if (paCodeMatch) {
    const title = paCodeMatch[1];
    const section = paCodeMatch[2];
    const fullSec = `${section}${sub}`;

    return {
      citationType: 'Pa. Code',
      bluebookStandard: `${title} Pa. Code § ${fullSec} (${currentYear})`,
      paCourtPractice: `${title} Pa. Code § ${fullSec}`,
      purdonsAnnotated: `${title} Pa. Code § ${fullSec}`,
      shortFormId: `Id. § ${fullSec}`,
      shortFormSection: `${title} Pa. Code § ${fullSec}`,
      explanatoryParenthetical: `${title} Pa. Code § ${fullSec}${parenText ? ` (${parenText})` : ''}`,
      fullWithHeading: heading ? `${title} Pa. Code § ${fullSec} ("${heading}")` : `${title} Pa. Code § ${fullSec}`
    };
  }

  // 4. Pennsylvania Rules of Civil Procedure (e.g., "Pa.R.C.P. 1018.1" or "Pa.R.C.P. No. 1915.15")
  const paRcpMatch = cleanCit.match(/Pa\.R\.C\.P\.?(?:\s*No\.?)?\s*([0-9a-zA-Z\.\-]+)/i);
  if (paRcpMatch) {
    const ruleNum = paRcpMatch[1];
    const fullRule = `${ruleNum}${sub}`;

    return {
      citationType: 'Pa.R.C.P.',
      bluebookStandard: `Pa. R. Civ. P. ${fullRule}`,
      paCourtPractice: `Pa.R.C.P. ${fullRule}`,
      purdonsAnnotated: `Pa.R.C.P. No. ${fullRule}`,
      shortFormId: `Id. ${fullRule}`,
      shortFormSection: `Rule ${fullRule}`,
      explanatoryParenthetical: `Pa.R.C.P. ${fullRule}${parenText ? ` (${parenText})` : ''}`,
      fullWithHeading: heading ? `Pa.R.C.P. ${fullRule} ("${heading}")` : `Pa.R.C.P. ${fullRule}`
    };
  }

  // 5. County Local Rules (e.g., "Schuylkill Cnty. L.R.C.P. 1915.3")
  const localRuleMatch = cleanCit.match(/([a-zA-Z]+)(?:\s+Cnty\.?)?\s*L\.?R\.?C\.?P\.?\s*([0-9a-zA-Z\.\-]+)/i);
  if (localRuleMatch) {
    const county = localRuleMatch[1];
    const ruleNum = localRuleMatch[2];
    const fullRule = `${ruleNum}${sub}`;

    return {
      citationType: 'Local Rule',
      bluebookStandard: `${county} Cnty. Local R. Civ. P. ${fullRule}`,
      paCourtPractice: `${county} Cnty. L.R.C.P. ${fullRule}`,
      purdonsAnnotated: `${county} County Court Rules: ${fullRule}`,
      shortFormId: `Id. ${fullRule}`,
      shortFormSection: `Local Rule ${fullRule}`,
      explanatoryParenthetical: `${county} Cnty. L.R.C.P. ${fullRule}${parenText ? ` (${parenText})` : ''}`,
      fullWithHeading: heading ? `${county} Cnty. L.R.C.P. ${fullRule} ("${heading}")` : `${county} Cnty. L.R.C.P. ${fullRule}`
    };
  }

  // 6. Code of Federal Regulations (e.g., "34 CFR § 99.30")
  const cfrMatch = cleanCit.match(/^(\d+)\s*C\.?F\.?R\.?\s*(?:§|sec\.)?\s*([0-9a-zA-Z\.\-]+)/i);
  if (cfrMatch) {
    const title = cfrMatch[1];
    const section = cfrMatch[2];
    const fullSec = `${section}${sub}`;

    return {
      citationType: 'C.F.R.',
      bluebookStandard: `${title} C.F.R. § ${fullSec} (${currentYear})`,
      paCourtPractice: `${title} C.F.R. § ${fullSec}`,
      purdonsAnnotated: `${title} C.F.R. § ${fullSec}`,
      shortFormId: `Id. § ${fullSec}`,
      shortFormSection: `${title} C.F.R. § ${fullSec}`,
      explanatoryParenthetical: `${title} C.F.R. § ${fullSec}${parenText ? ` (${parenText})` : ''}`,
      fullWithHeading: heading ? `${title} C.F.R. § ${fullSec} ("${heading}")` : `${title} C.F.R. § ${fullSec}`
    };
  }

  // Fallback / General format
  const fullCit = `${cleanCit}${sub}`;
  return {
    citationType: 'General',
    bluebookStandard: `${fullCit} (${currentYear})`,
    paCourtPractice: fullCit,
    purdonsAnnotated: `${fullCit} (${publisher} ${currentYear})`,
    shortFormId: `Id.`,
    shortFormSection: fullCit,
    explanatoryParenthetical: `${fullCit}${parenText ? ` (${parenText})` : ''}`,
    fullWithHeading: heading ? `${fullCit} ("${heading}")` : fullCit
  };
}
