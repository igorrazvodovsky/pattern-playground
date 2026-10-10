import type { Slice } from '@tiptap/pm/model';
import { quotes, getQuoteById, getDocumentById } from '@shared/data';
import type { RichContent } from '@shared/data';

/**
 * Quote object metadata structure
 */
export type QuoteMetadata = {
  sourceDocument: string;
  sourceRange: { from: number; to: number };
  createdAt: string;
  createdBy: string;
  selectedText: string;
};

/**
 * Complete quote object structure
 */
export interface QuoteObject {
  id: string;
  name: string;
  type: 'quote';
  icon: 'ph:quotes';
  description: string;
  searchableText: string;
  metadata: QuoteMetadata;
  content: Required<RichContent>;
}

// Comment and quote marks annotate the source document. A quote's own content
// leaves them behind: their threads stay with the source, and a renderer
// without those marks in its schema would reject them.
const ANNOTATION_MARKS = new Set(['comment', 'quote']);

type JSONNode = { marks?: Array<{ type: string }>; content?: JSONNode[] } & Record<string, unknown>;

function stripAnnotationMarks<T extends JSONNode>(nodes: T[]): T[] {
  return nodes.map(node => {
    const { marks, content, ...rest } = node;
    const kept = marks?.filter(mark => !ANNOTATION_MARKS.has(mark.type));
    return {
      ...rest,
      ...(kept && kept.length > 0 ? { marks: kept } : {}),
      ...(content ? { content: stripAnnotationMarks(content) } : {}),
    } as T;
  });
}

/**
 * Service for managing quote object lifecycle
 */
export class QuoteService {
  private quotes: Map<string, QuoteObject>;

  constructor() {
    // Initialize with existing quote data
    this.quotes = new Map(quotes.map(quote => [quote.id, quote as QuoteObject]));
  }

  /**
   * Create a quote object from content taken out of a TipTap document, such
   * as a commented passage without what was later typed between its pieces.
   */
  createFromSlice(
    slice: Slice,
    sourceRange: { from: number; to: number },
    userId: string,
    documentId: string
  ): QuoteObject {
    if (slice.content.size === 0) {
      throw new Error('Cannot create quote from an empty passage');
    }
    const selectedText = slice.content.textBetween(0, slice.content.size, ' ');

    const quote: QuoteObject = {
      id: `quote-${crypto.randomUUID()}`,
      name: this.generateName(selectedText),
      type: 'quote',
      icon: 'ph:quotes',
      description: `Quote from ${this.getDocumentName(documentId) || 'document'}`,
      searchableText: this.generateSearchableText(selectedText, documentId),
      metadata: {
        sourceDocument: documentId,
        sourceRange,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        selectedText
      },
      content: {
        plainText: selectedText,
        richContent: {
          type: 'doc',
          content: stripAnnotationMarks(slice.toJSON()?.content ?? [])
        }
      }
    };

    // Add to internal collection
    this.quotes.set(quote.id, quote);

    return quote;
  }

  /**
   * Generate a display name for the quote (first 100 chars)
   */
  private generateName(selectedText: string): string {
    const trimmed = selectedText.trim();
    return trimmed.length > 100 ? `${trimmed.substring(0, 100)}...` : trimmed;
  }

  /**
   * Generate searchable text for the quote
   */
  private generateSearchableText(selectedText: string, documentId: string): string {
    const docName = this.getDocumentName(documentId);
    const baseText = selectedText.toLowerCase();
    const contextText = docName ? ` ${docName.toLowerCase()}` : '';
    return `${baseText} quote excerpt selection${contextText}`;
  }

  private getDocumentName(documentId: string): string | null {
    return getDocumentById(documentId)?.name ?? null;
  }

  /**
   * Get quote by ID
   */
  getQuoteById(id: string): QuoteObject | undefined {
    return this.quotes.get(id) || getQuoteById(id) as QuoteObject;
  }

  /**
   * Delete a quote
   */
  deleteQuote(id: string): boolean {
    return this.quotes.delete(id);
  }

  /**
   * Get all quotes in the service
   */
  getAllQuotes(): QuoteObject[] {
    return Array.from(this.quotes.values());
  }
}

// Singleton instance for global use
let quoteServiceInstance: QuoteService | null = null;

/**
 * Get or create the global quote service instance
 */
export function getQuoteService(): QuoteService {
  if (!quoteServiceInstance) {
    quoteServiceInstance = new QuoteService();
  }
  return quoteServiceInstance;
}

