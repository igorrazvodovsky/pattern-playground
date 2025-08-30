import { useState, useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import type { CommentPointer } from '../core/comment-pointer';
import { QuotePointer, type QuoteObject } from '../core/quote-pointer';
import { useCommenting } from './use-commenting';
import type { EditorCommentingPlugin } from '../../../components/editor-plugins/commenting/CommentingPlugin';

interface UseEditorCommentingOptions {
  documentId: string;
  currentUser: string;
  enableQuoteComments?: boolean;
}

export function useEditorCommenting(editor: Editor | null, options: UseEditorCommentingOptions) {
  const [activePointer, setActivePointer] = useState<CommentPointer | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  // We'll create quotes directly in this hook for now
  // TODO: Integrate with actual quote service later
  
  // Use the universal commenting hook with the active pointer
  const commenting = useCommenting(activePointer || undefined, {
    currentUser: options.currentUser,
  });
  
  // Get the plugin instance as shown in the plan
  const plugin = editor?.storage?.plugins?.get('editor-commenting') as EditorCommentingPlugin | null;
  
  // Listen for quote creation from editor as shown in the plan
  useEffect(() => {
    console.log('useEditorCommenting: Setting up quote:created listener, plugin:', plugin);
    if (!plugin) return;
    
    const unsubscribe = plugin.on('quote:created', ({ quote, pointer }: { quote: QuoteObject; pointer: CommentPointer }) => {
      console.log('useEditorCommenting: Received quote:created event', { quote, pointer });
      setSelectedQuote(quote);
      setActivePointer(pointer);
    });
    
    console.log('useEditorCommenting: Listener setup complete, unsubscribe function:', unsubscribe);
    return unsubscribe;
  }, [plugin]);
  
  // Create a quote comment as shown in the plan
  const createQuoteComment = useCallback(() => {
    if (!editor) return;
    (editor.commands as any).createQuoteFromSelection();
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