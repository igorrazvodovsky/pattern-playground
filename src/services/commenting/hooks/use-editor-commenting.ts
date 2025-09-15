import { useState, useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import type { CommentPointer } from '../core/comment-pointer';
import type { QuoteObject } from '../core/quote-pointer';
import { useCommenting } from './use-commenting';
import type { EditorCommentingPlugin } from '../../../components/editor-plugins/commenting/CommentingPlugin';

interface UseEditorCommentingOptions {
  documentId: string;
  currentUser: string;
  enableQuoteComments?: boolean;
}

export function useEditorCommenting(editor: Editor | null, options: UseEditorCommentingOptions) {
  const [activePointer, setActivePointer] = useState<CommentPointer | null>(null);
  const [, setSelectedQuote] = useState<QuoteObject | null>(null);

  // Use the universal commenting hook with the active pointer
  const commenting = useCommenting(activePointer || undefined, {
    currentUser: options.currentUser,
  });

  // Get the plugin instance which handles quote creation via QuoteService
  const plugin = editor?.storage?.plugins?.get('editor-commenting') as EditorCommentingPlugin | null;

  // Listen for quote creation events from the editor plugin
  useEffect(() => {
    if (!plugin) return;

    const unsubscribe = plugin.on('quote:created', ({ quote, pointer }: { quote: QuoteObject; pointer: CommentPointer }) => {
      setSelectedQuote(quote);
      setActivePointer(pointer);
    });

    return unsubscribe;
  }, [plugin]);

  // Trigger quote creation via the editor command (handled by the plugin's QuoteService)
  const createQuoteComment = useCallback(() => {
    if (!editor) return;
    (editor.commands as { createQuoteFromSelection?: () => void }).createQuoteFromSelection?.();
  }, [editor]);



  const clearActivePointer = useCallback(() => {
    setActivePointer(null);
    setSelectedQuote(null);
  }, []);

  return {
    comments: commenting.comments,
    createComment: commenting.createComment,
    createQuoteComment,
    activePointer,
    clearActivePointer,
  };
}