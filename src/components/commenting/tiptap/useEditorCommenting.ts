import { useState, useCallback, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import { EditorCommentingPlugin } from './EditorCommentingPlugin';
import { useCommenting } from '../../../services/commenting/hooks/use-commenting';
import type { CommentPointer } from '../../../services/commenting/core/comment-pointer';
import type { QuoteObject } from '../../../services/commenting/quote-service';

interface UseEditorCommentingOptions {
  documentId: string;
  currentUser: string;
}

interface EditorCommentingState {
  activePointer: CommentPointer | null;
  activeQuote: QuoteObject | null;
  plugin: EditorCommentingPlugin | null;
}

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

  const { comments, createComment } = useCommenting(state.activePointer || undefined);

  useEffect(() => {
    if (!editor) return;

    const plugin = new EditorCommentingPlugin();

    plugin.onActivate({
      editor,
      documentId,
      currentUser
    });

    setState(prev => ({ ...prev, plugin }));

    const handleQuoteCreated = ({ quote, pointer }: { quote: QuoteObject; pointer: CommentPointer }) => {
      setState(prev => ({
        ...prev,
        activePointer: pointer,
        activeQuote: quote
      }));
    };

    const handleQuoteClicked = ({ quoteId, quote }: { quoteId: string; quote: QuoteObject }) => {
      import('../../../services/commenting/core/quote-pointer').then(({ QuotePointer }) => {
        // Adapt quote object to match pointer expectations
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

  const createQuoteComment = useCallback(() => {
    if (!state.plugin) {
      console.warn('Plugin not initialized');
      return false;
    }

    const quote = state.plugin.createQuoteFromSelection();
    return quote !== null;
  }, [state.plugin]);

  const navigateToQuote = useCallback((quote: QuoteObject) => {
    if (!state.plugin) return false;
    return state.plugin.navigateToQuoteSource(quote);
  }, [state.plugin]);

  const insertReference = useCallback((object: { id: string; type: string; label: string }) => {
    if (!state.plugin) return false;
    return state.plugin.insertReference(object);
  }, [state.plugin]);

  const clearActiveComment = useCallback(() => {
    setState(prev => ({
      ...prev,
      activePointer: null,
      activeQuote: null
    }));
  }, []);

  const capabilities = state.plugin?.getCapabilities() || {
    canCreateQuote: false,
    canInsertReference: false,
    hasRichTextComposer: false
  };

  const createCommentComposer = useCallback(() => {
    if (!state.plugin) return null;
    return state.plugin.createCommentComposer();
  }, [state.plugin]);

  return {
    comments,
    createComment,
    createQuoteComment,
    navigateToQuote,
    insertReference,
    createCommentComposer,
    activePointer: state.activePointer,
    activeQuote: state.activeQuote,
    capabilities,
    clearActiveComment,
    plugin: state.plugin
  };
}