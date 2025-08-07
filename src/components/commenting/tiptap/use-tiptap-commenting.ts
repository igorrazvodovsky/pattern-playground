import { useCallback, useEffect, useMemo } from 'react';
import type { Editor } from '@tiptap/react';
import { TipTapPointerAdapter } from '../../../services/commenting/tiptap-pointer-adapter.js';
import { useTipTapCommenting } from '../../../services/commenting/hooks/use-universal-commenting.js';
import type { TipTapTextPointer } from '../../../services/commenting/document-pointer.js';

interface UseTipTapCommentingOptions {
  documentId: string;
  editorId?: string;
  currentUser: string;
}

export const useTipTapCommentingIntegration = (
  editor: Editor | null,
  options: UseTipTapCommentingOptions
) => {
  const { documentId, editorId, currentUser } = options;
  const commenting = useTipTapCommenting(documentId, editorId);

  // Create pointer adapter
  const pointerAdapter = useMemo(() => {
    if (!editor) return null;
    return new TipTapPointerAdapter(editor, documentId, editorId);
  }, [editor, documentId, editorId]);

  // Highlight all existing comments when editor loads
  useEffect(() => {
    if (!editor || !pointerAdapter) return;

    commenting.editorThreads.forEach(thread => {
      thread.pointers.forEach(pointer => {
        if (pointer.type === 'tiptap-text-range') {
          const tipTapPointer = pointer as TipTapTextPointer;
          if (pointerAdapter.validatePointer(tipTapPointer)) {
            pointerAdapter.highlightPointer(tipTapPointer, thread.id);
          }
        }
      });
    });
  }, [editor, pointerAdapter, commenting.editorThreads]);

  // Create a new comment thread
  const createCommentThread = useCallback(() => {
    if (!editor || !pointerAdapter) return null;

    if (!pointerAdapter.hasValidSelection()) {
      console.warn('No valid text selection for creating comment');
      return null;
    }

    const pointer = pointerAdapter.createPointer();
    const thread = commenting.service.createThread(
      pointer
    );

    // Highlight the commented text
    pointerAdapter.highlightPointer(pointer, thread.id);

    // Set as active thread and show panel
    commenting.actions.setActiveThread(thread.id);
    if (!commenting.panelVisible) {
      commenting.actions.togglePanel();
    }

    return thread;
  }, [editor, pointerAdapter, commenting.service, commenting.actions, commenting.panelVisible, currentUser]);

  // Add comment to existing thread
  const addCommentToThread = useCallback((threadId: string, content: string) => {
    return commenting.service.addComment(threadId, content, currentUser);
  }, [commenting.service, currentUser]);

  // Resolve a thread
  const resolveThread = useCallback((threadId: string) => {
    commenting.service.resolveThread(threadId, currentUser);
    
    // Update comment marks to show resolved state
    if (editor && pointerAdapter) {
      const thread = commenting.service.getThread(threadId);
      if (thread) {
        thread.pointers.forEach(pointer => {
          if (pointer.type === 'tiptap-text-range') {
            const tipTapPointer = pointer as TipTapTextPointer;
            if (pointerAdapter.validatePointer(tipTapPointer)) {
              editor.chain().focus()
                .setTextSelection({
                  from: tipTapPointer.from,
                  to: tipTapPointer.to
                })
                .updateAttributes('comment', { resolved: true })
                .run();
            }
          }
        });
      }
    }
  }, [commenting.service, currentUser, editor, pointerAdapter]);

  // Handle clicking on commented text
  const handleCommentClick = useCallback((threadId: string) => {
    commenting.actions.setActiveThread(threadId);
    if (!commenting.panelVisible) {
      commenting.actions.togglePanel();
    }

    // Focus the editor at the comment location
    if (editor && pointerAdapter) {
      const thread = commenting.service.getThread(threadId);
      if (thread) {
        const pointer = thread.pointers.find(p => p.type === 'tiptap-text-range') as TipTapTextPointer;
        if (pointer && pointerAdapter.validatePointer(pointer)) {
          pointerAdapter.focusAtPointer(pointer);
        }
      }
    }
  }, [commenting.actions, commenting.panelVisible, commenting.service, editor, pointerAdapter]);

  // Check if current selection has overlapping comments
  const hasOverlappingComments = useCallback(() => {
    if (!editor || !pointerAdapter) return false;
    
    const selection = pointerAdapter.getCurrentSelection();
    if (!selection) return false;
    
    return pointerAdapter.hasOverlappingComments(selection.from, selection.to);
  }, [editor, pointerAdapter]);

  // Get thread for a specific position
  const getThreadAtPosition = useCallback((pos: number) => {
    if (!editor) return null;
    
    return commenting.editorThreads.find(thread => {
      return thread.pointers.some(pointer => {
        if (pointer.type === 'tiptap-text-range') {
          const tipTapPointer = pointer as TipTapTextPointer;
          return pos >= tipTapPointer.from && pos <= tipTapPointer.to;
        }
        return false;
      });
    });
  }, [editor, commenting.editorThreads]);

  // Clean up invalid pointers after document changes
  const cleanupInvalidPointers = useCallback(() => {
    if (!pointerAdapter) return;

    commenting.editorThreads.forEach(thread => {
      thread.pointers.forEach(pointer => {
        if (pointer.type === 'tiptap-text-range') {
          const tipTapPointer = pointer as TipTapTextPointer;
          if (!pointerAdapter.validatePointer(tipTapPointer)) {
            console.warn(`Invalid pointer found for thread ${thread.id}, removing highlight`);
            pointerAdapter.unhighlightPointer(tipTapPointer);
          }
        }
      });
    });
  }, [pointerAdapter, commenting.editorThreads]);

  return {
    ...commenting,
    pointerAdapter,
    createCommentThread,
    addCommentToThread,
    resolveThread,
    handleCommentClick,
    hasOverlappingComments,
    getThreadAtPosition,
    cleanupInvalidPointers,
    canCreateComment: pointerAdapter?.hasValidSelection() ?? false
  };
};