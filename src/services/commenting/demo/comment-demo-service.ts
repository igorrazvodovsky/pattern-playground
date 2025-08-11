import type { Editor } from '@tiptap/react';
import type { UniversalCommentingService } from '../universal-commenting-service.js';
import type { TipTapPointerAdapter } from '../tiptap-pointer-adapter.js';

interface DemoCommentRange {
  text: string;
  threadId: string;
  resolved: boolean;
}

interface DemoComment {
  threadKey: string;
  content: string;
  author: string;
  timestamp: Date;
}

interface CommentInitializationResult {
  threadsCreated: number;
  commentsAdded: number;
  errors: string[];
}

export class CommentDemoService {
  /**
   * Initialize demo comments in a TipTap editor with highlighted text ranges
   */
  initializeDemoComments(
    editor: Editor,
    service: UniversalCommentingService,
    pointerAdapter: TipTapPointerAdapter,
    commentRanges: DemoCommentRange[],
    mockComments: DemoComment[]
  ): CommentInitializationResult {
    const result: CommentInitializationResult = {
      threadsCreated: 0,
      commentsAdded: 0,
      errors: []
    };

    const existingThreads = new Map();

    // Process each comment range
    commentRanges.forEach(({ text, threadId, resolved }) => {
      try {
        const positions = this.findTextPositions(editor, text);
        
        if (positions) {
          const { start, end } = positions;
          
          // Create pointer and thread
          const pointer = pointerAdapter.createPointerForRange(start, end);
          const thread = service.createThread(pointer);

          // Apply comment mark to highlight the text
          editor.chain()
            .setTextSelection({ from: start, to: end })
            .setMark('comment', { commentId: thread.id, resolved })
            .run();

          existingThreads.set(threadId, { thread, isResolved: resolved, pointer });
          result.threadsCreated++;
          
          console.log(`Created thread for "${text}" at positions ${start}-${end}`);
        } else {
          result.errors.push(`Could not find positions for text: "${text}"`);
        }
      } catch (error) {
        result.errors.push(`Error processing range "${text}": ${error}`);
      }
    });

    // Add comments to threads
    mockComments.forEach(comment => {
      try {
        const threadData = existingThreads.get(comment.threadKey);
        if (threadData) {
          service.addComment(threadData.thread.id, comment.content, comment.author);
          result.commentsAdded++;

          // Resolve thread if marked as resolved
          if (threadData.isResolved) {
            service.resolveThread(threadData.thread.id, 'system');
          }
        } else {
          result.errors.push(`Thread not found for key: ${comment.threadKey}`);
        }
      } catch (error) {
        result.errors.push(`Error adding comment to thread "${comment.threadKey}": ${error}`);
      }
    });

    console.log(`Demo initialization complete: ${result.threadsCreated} threads, ${result.commentsAdded} comments`);
    if (result.errors.length > 0) {
      console.warn('Demo initialization errors:', result.errors);
    }

    return result;
  }

  /**
   * Find the actual document positions for a given text string
   */
  private findTextPositions(editor: Editor, targetText: string): { start: number; end: number } | null {
    const content = editor.state.doc.textContent;
    const startIndex = content.indexOf(targetText);

    if (startIndex === -1) {
      console.warn(`Could not find text: "${targetText}" in document`);
      return null;
    }

    // Find the actual document positions by walking through the document
    let currentTextPos = 0;
    let actualStart = -1;
    let actualEnd = -1;

    editor.state.doc.descendants((node, pos) => {
      if (node.isText) {
        const nodeText = node.textContent;
        const nodeStart = currentTextPos;
        const nodeEnd = currentTextPos + nodeText.length;

        // Check if our target text starts within this text node
        if (actualStart === -1 && startIndex >= nodeStart && startIndex < nodeEnd) {
          actualStart = pos + (startIndex - nodeStart);
        }

        // Check if our target text ends within this text node
        if (actualEnd === -1 && (startIndex + targetText.length) > nodeStart && (startIndex + targetText.length) <= nodeEnd) {
          actualEnd = pos + ((startIndex + targetText.length) - nodeStart);
        }

        currentTextPos += nodeText.length;
      }
    });

    if (actualStart !== -1 && actualEnd !== -1 && actualEnd > actualStart) {
      return { start: actualStart, end: actualEnd };
    }

    return null;
  }

  /**
   * Create mock comment data for demo purposes
   */
  createMockCommentData(
    documentComments: Array<{
      content: string;
      authorId: string;
      timestamp: Date;
    }>
  ): DemoComment[] {
    return documentComments.map((comment, index) => ({
      threadKey: index < 2 ? 'thread-1' : 'thread-2', // Group first two in thread-1, last in thread-2
      content: comment.content,
      author: comment.authorId,
      timestamp: comment.timestamp
    }));
  }

  /**
   * Create standard demo comment ranges for climate change content
   */
  createClimateChangeDemoRanges(): DemoCommentRange[] {
    return [
      { text: 'reshaping ecosystems', threadId: 'thread-1', resolved: false },
      { text: 'habitats shrink or disappear', threadId: 'thread-2', resolved: true }
    ];
  }
}