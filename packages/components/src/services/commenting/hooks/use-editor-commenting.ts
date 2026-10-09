import { useState, useEffect, useCallback } from 'react';
import type { EventBus } from '../../../components/editor/types';
import type { QuoteObject } from '../quote-service';

// Takes the editor's plugin event bus (from `useEditorContext()`), where the
// commenting plugin announces new quotes and listens for commands. Tracks the
// quote being commented on; the thread UI owns writing the comments.
export function useEditorCommenting(eventBus: EventBus | null) {
  const [activeQuote, setActiveQuote] = useState<QuoteObject | null>(null);

  useEffect(() => {
    if (!eventBus) return;

    return eventBus.on('quote:created', ({ quote }) => {
      setActiveQuote(quote);
    });
  }, [eventBus]);

  // Ask the commenting plugin to quote the current selection
  const createQuoteComment = useCallback(() => {
    eventBus?.emit('command:execute', {
      command: 'commenting:create-quote-comment',
      params: {},
    });
  }, [eventBus]);

  const clearActiveQuote = useCallback(() => {
    setActiveQuote(null);
  }, []);

  return {
    createQuoteComment,
    activeQuote,
    clearActiveQuote,
  };
}