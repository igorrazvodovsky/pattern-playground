import type {
  UniversalComment,
  CommentThread,
  DocumentPointer
} from './document-pointer.js';
import { useCommentStore } from './state/comment-store.js';
import { shallow } from 'zustand/shallow';

// Type for the Zustand store state and actions
type CommentStoreState = ReturnType<typeof useCommentStore>;

// Pointer equality using Zustand's shallow comparison (already available)
function pointersEqual(a: DocumentPointer, b: DocumentPointer): boolean {
  return shallow(a, b);
}

// Universal commenting service with Zustand-only integration (Tier 1)
export class UniversalCommentingService {
  private getState: () => CommentStoreState;

  constructor(getState: () => CommentStoreState) {
    this.getState = getState;
  }

  // Create thread (local-only in Tier 1)
  createThread(
    pointer: DocumentPointer
  ): CommentThread {
    // Business logic validation
    return this.getState().actions.createThread(pointer);
  }

  addComment(threadId: string, content: string, author: string): UniversalComment {
    return this.getState().actions.addComment(threadId, content, author);
  }

  resolveThread(threadId: string, resolvedBy: string): void {
    this.getState().actions.resolveThread(threadId, resolvedBy);
  }

  getThreadsForDocument(documentId: string): CommentThread[] {
    const state = this.getState();
    return Array.from(state.threads.values()).filter(thread =>
      thread.pointers.some(pointer =>
        (pointer as any).documentId === documentId
      )
    );
  }

  getThreadsByPointerType(pointerType: string): CommentThread[] {
    const state = this.getState();
    return Array.from(state.threads.values()).filter(thread =>
      thread.pointers.some(pointer => pointer.type === pointerType)
    );
  }

  // Get all threads
  getAllThreads(): CommentThread[] {
    const state = this.getState();
    return Array.from(state.threads.values());
  }

  getCommentsForThread(threadId: string): UniversalComment[] {
    const state = this.getState();
    const thread = state.threads.get(threadId);
    if (!thread) return [];

    return Array.from(state.comments.values()).filter(comment =>
      comment.pointers.some(pointer =>
        thread.pointers.some(threadPointer =>
          pointersEqual(pointer, threadPointer)
        )
      )
    );
  }

  getThread(threadId: string): CommentThread | undefined {
    const state = this.getState();
    return state.threads.get(threadId);
  }

  getComment(commentId: string): UniversalComment | undefined {
    const state = this.getState();
    return state.comments.get(commentId);
  }

  hasThreadForPointer(pointer: DocumentPointer): boolean {
    const state = this.getState();
    return Array.from(state.threads.values()).some(thread =>
      thread.pointers.some(threadPointer =>
        pointersEqual(pointer, threadPointer)
      )
    );
  }

  getThreadsForPointer(pointer: DocumentPointer): CommentThread[] {
    const state = this.getState();
    return Array.from(state.threads.values()).filter(thread =>
      thread.pointers.some(threadPointer =>
        pointersEqual(pointer, threadPointer)
      )
    );
  }

  // Get statistics about comments
  getCommentStats() {
    const state = this.getState();
    const threads = Array.from(state.threads.values());
    const comments = Array.from(state.comments.values());

    return {
      totalThreads: threads.length,
      activeThreads: threads.filter(t => t.status === 'active').length,
      resolvedThreads: threads.filter(t => t.status === 'resolved').length,
      totalComments: comments.length
    };
  }
}