import { useState, useCallback, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import { EditorCommentingPlugin } from './EditorCommentingPlugin.js';
import { useCommenting } from '../../../services/commenting/hooks/use-commenting.js';
import type { CommentPointer } from '../../../services/commenting/core/comment-pointer.js';
import type { QuoteObject } from '../../../services/commenting/quote-service.js';

interface UseEditorCommentingOptions {
  documentId: string;
  currentUser: string;
}

interface EditorCommentingState {
  activePointer: CommentPointer | null;
  activeQuote: QuoteObject | null;
  plugin: EditorCommentingPlugin | null;
}

/**
 * Hook for editor-enhanced commenting
 * Combines universal commenting system with editor-specific capabilities
 */
export function useEditorCommenting(
  editor: Editor | null,
  options: UseEditorCommentingOptions
) {
  const { documentId, currentUser } = options;
  
  const [state, setState] = useState<EditorCommentingState>({
    activePointer: null,
    activeQuote: null,
    plugin: null
  });

  // Get universal commenting capabilities for active pointer
  const { comments, createComment } = useCommenting(state.activePointer || undefined);

  // Initialize plugin when editor is available
  useEffect(() => {
    if (!editor) return;

    const plugin = new EditorCommentingPlugin();
    
    plugin.onActivate({
      editor,
      documentId,
      currentUser
    });

    setState(prev => ({ ...prev, plugin }));

    // Listen for quote creation events
    const handleQuoteCreated = ({ quote, pointer }: { quote: QuoteObject; pointer: CommentPointer }) => {
      setState(prev => ({
        ...prev,
        activePointer: pointer,
        activeQuote: quote
      }));
    };

    // Listen for quote clicks
    const handleQuoteClicked = ({ quoteId, quote }: { quoteId: string; quote: QuoteObject }) => {
      // Create pointer for existing quote
      import('../../../services/commenting/core/quote-pointer.js').then(({ QuotePointer }) => {
        // Use the same adapter function from the plugin
        const adaptedQuote = {
          id: quote.id,
          content: {
            plainText: quote.content.plainText,
            html: quote.content.richContent ? JSON.stringify(quote.content.richContent) : quote.content.plainText
          },
          metadata: {
            ...quote.metadata,
            authorId: quote.metadata.createdBy
          },
          actions: {
            annotate: { enabled: true },
            cite: { enabled: true },
            challenge: { enabled: false },
            pin: { enabled: true }
          }
        };
        const pointer = new QuotePointer(quoteId, adaptedQuote);
        setState(prev => ({
          ...prev,
          activePointer: pointer,
          activeQuote: quote
        }));
      });
    };

    plugin.on('quote:created', handleQuoteCreated);
    plugin.on('quote:clicked', handleQuoteClicked);

    return () => {
      plugin.off('quote:created', handleQuoteCreated);
      plugin.off('quote:clicked', handleQuoteClicked);
      plugin.onDeactivate();
    };
  }, [editor, documentId, currentUser]);

  // Create quote and start commenting flow
  const createQuoteComment = useCallback(() => {
    if (!state.plugin) {
      console.warn('Plugin not initialized');
      return false;
    }

    const quote = state.plugin.createQuoteFromSelection();
    return quote !== null;
  }, [state.plugin]);

  // Navigate to quote source
  const navigateToQuote = useCallback((quote: QuoteObject) => {
    if (!state.plugin) return false;
    return state.plugin.navigateToQuoteSource(quote);
  }, [state.plugin]);

  // Insert reference to any object
  const insertReference = useCallback((object: { id: string; type: string; label: string }) => {
    if (!state.plugin) return false;
    return state.plugin.insertReference(object);
  }, [state.plugin]);

  // Clear active comment context
  const clearActiveComment = useCallback(() => {
    setState(prev => ({
      ...prev,
      activePointer: null,
      activeQuote: null
    }));
  }, []);

  // Get plugin capabilities
  const capabilities = state.plugin?.getCapabilities() || {
    canCreateQuote: false,
    canInsertReference: false,
    hasRichTextComposer: false
  };

  // Create rich text composer for comments
  const createCommentComposer = useCallback(() => {
    if (!state.plugin) return null;
    return state.plugin.createCommentComposer();
  }, [state.plugin]);

  return {
    // Comment data (from universal system)
    comments,
    createComment,
    
    // Editor-specific actions
    createQuoteComment,
    navigateToQuote,
    insertReference,
    createCommentComposer,
    
    // State
    activePointer: state.activePointer,
    activeQuote: state.activeQuote,
    capabilities,
    
    // Control
    clearActiveComment,
    
    // Plugin instance for advanced usage
    plugin: state.plugin
  };
}