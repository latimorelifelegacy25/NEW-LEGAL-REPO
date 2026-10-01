import type { StoredDocument } from './localVault';

export interface ReviewParagraph { number: number; text: string; exhibits: string[] }
export interface QuoteCheck {
  paragraph: number;
  quote: string;
  status: 'matched' | 'not-found' | 'source-unavailable';
  sources: string[];
  sourceHashes: string[];
}

export function citedExhibits(text: string): string[] {
  return [...text.matchAll(/\bExhibits?\s+([A-Z](?:-\d+[A-Z]?)?)/gi)]
    .map(match => match[1].toUpperCase());
}

export function substantiveQuotes(text: string): string[] {
  return [...text.matchAll(/“([^”]+)”|"([^"]+)"/g)]
    .map(match => (match[1] || match[2]).trim()).filter(quote => quote.length >= 20);
}

const normalize = (value: string) => value.normalize('NFKC').replace(/\s+/g, ' ').trim();

export function reviewQuotes(paragraphs: ReviewParagraph[], documents: StoredDocument[]): QuoteCheck[] {
  const exhibits = documents.filter(doc => doc.kind === 'exhibit');
  return paragraphs.flatMap(para => {
    if (!para.exhibits.length) return [];
    const sources = para.exhibits.flatMap(label => exhibits.filter(doc => doc.exhibit?.toUpperCase() === label));
    if (!sources.length) return []; // Missing exhibit is reported by the structural audit.
    return substantiveQuotes(para.text).map(quote => {
      const available = sources.filter(doc => !!doc.extractedText.trim());
      const matched = available.filter(doc => normalize(doc.extractedText).includes(normalize(quote)));
      return {
        paragraph: para.number, quote,
        status: !available.length ? 'source-unavailable' : matched.length ? 'matched' : 'not-found',
        sources: sources.map(doc => `${doc.exhibit}: ${doc.name}`),
        sourceHashes: sources.map(doc => doc.sha256),
      };
    });
  });
}
