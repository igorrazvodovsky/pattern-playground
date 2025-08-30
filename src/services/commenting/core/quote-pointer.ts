import { BaseCommentPointer, type PointerContext } from './comment-pointer';

// Define the expected QuoteObject interface for the new commenting system
export interface QuoteObject {
  id: string;
  content: {
    plainText: string;
    html: string;
  };
  metadata: {
    sourceDocument: string;
    authorId: string;
    createdAt: string;
    [key: string]: any;
  };
  actions: {
    annotate: { enabled: boolean };
    cite: { enabled: boolean };
    challenge: { enabled: boolean };
    pin: { enabled: boolean };
  };
}

export class QuotePointer extends BaseCommentPointer {
  readonly type = 'quote';
  
  constructor(
    readonly id: string,
    private quote: QuoteObject
  ) {
    super();
  }
  
  serialize(): string {
    return JSON.stringify({ type: this.type, id: this.id });
  }
  
  async getContext(): Promise<PointerContext> {
    return {
      title: 'Quote',
      excerpt: this.quote.content.plainText,
      location: this.quote.metadata.sourceDocument,
      metadata: this.quote.metadata
    };
  }
  
  static deserialize(data: string): QuotePointer | null {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type !== 'quote' || !parsed.id) return null;
      
      // In production, would fetch quote from storage
      // For now, returning a placeholder
      const placeholderQuote: QuoteObject = {
        id: parsed.id,
        content: { plainText: '', html: '' },
        metadata: {
          sourceDocument: '',
          authorId: '',
          createdAt: new Date().toISOString()
        },
        actions: {
          annotate: { enabled: true },
          cite: { enabled: true },
          challenge: { enabled: false },
          pin: { enabled: true }
        }
      };
      
      return new QuotePointer(parsed.id, placeholderQuote);
    } catch {
      return null;
    }
  }
}