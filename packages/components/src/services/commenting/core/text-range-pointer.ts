import { BaseCommentPointer, type PointerContext } from './comment-pointer';

// A passage of a document that carries a comment. The passage is found through
// its comment mark, which holds the thread id, so the pointer stores no
// positions and stays valid while the text around it is edited.
export class TextRangePointer extends BaseCommentPointer {
  readonly type = 'text-range';
  readonly id: string;

  constructor(
    readonly documentId: string,
    readonly threadId: string,
    private readonly excerpt?: string
  ) {
    super();
    this.id = `${documentId}:${threadId}`;
  }

  serialize(): string {
    return JSON.stringify({
      type: this.type,
      documentId: this.documentId,
      threadId: this.threadId,
    });
  }

  async getContext(): Promise<PointerContext> {
    return {
      title: 'Passage',
      excerpt: this.excerpt,
      location: this.documentId,
      metadata: { documentId: this.documentId, threadId: this.threadId },
    };
  }
}
