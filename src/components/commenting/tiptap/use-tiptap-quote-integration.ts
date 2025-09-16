import { useCallback, useEffect, useMemo } from 'react';
import React from 'react';
import type { Editor } from '@tiptap/react';
import { getQuoteService, type QuoteObject } from '../../../services/commenting/quote-service';
import { getQuotesByDocument } from '../../../stories/data/index';
import { useModalService } from '../../../hooks/useModalService';
import { QuoteDrawerContent } from '../../quote/QuoteDrawerContent';
import { getUserById } from '../../../stories/data/index';

interface UseTipTapQuoteIntegrationOptions {
  documentId: string;
  currentUser: string;
}

export const useTipTapQuoteIntegration = (
  editor: Editor | null,
  options: UseTipTapQuoteIntegrationOptions
) => {
  const { documentId, currentUser } = options;
  const quoteService = getQuoteService();
  const { openDrawer } = useModalService();

  const documentQuotes = useMemo(() => {
    return getQuotesByDocument(documentId) as QuoteObject[];
  }, [documentId]);

  // Validate quote integrity when editor loads
  useEffect(() => {
    if (!editor || documentQuotes.length === 0) return;

    documentQuotes.forEach(quote => {
      const { from, to } = quote.metadata.sourceRange;

      if (from >= 0 && to <= editor.state.doc.content.size && from < to) {
        try {
          const currentText = editor.state.doc.textBetween(from, to, ' ');

          // Detect if document changes broke quote integrity
          if (currentText.trim() !== quote.metadata.selectedText.trim()) {
            console.warn(`Quote text mismatch for ${quote.id}: expected "${quote.metadata.selectedText}", found "${currentText}"`);
          }
        } catch (error) {
          console.error(`Failed to validate quote ${quote.id}:`, error);
        }
      }
    });
  }, [editor, documentQuotes]);

  const createQuote = useCallback((): QuoteObject | null => {
    if (!editor) return null;

    const { from, to } = editor.state.selection;

    if (from === to) {
      console.warn('No text selected for quote creation');
      return null;
    }

    try {
      // Create the quote object
      const quote = quoteService.createFromTipTapSelection(
        editor,
        currentUser,
        documentId
      );

      editor.commands.convertSelectionToQuoteReference({
        id: quote.id,
        label: quote.name,
        metadata: quote.metadata
      });

      console.log('Created quote object:', quote);
      return quote;
    } catch (error) {
      console.error('Failed to create quote:', error);
      return null;
    }
  }, [editor, currentUser, documentId, quoteService]);

  const canCreateQuote = useCallback((): boolean => {
    if (!editor) return false;

    const { from, to } = editor.state.selection;
    return from !== to;
  }, [editor]);

  const getQuote = useCallback((quoteId: string): QuoteObject | undefined => {
    return quoteService.getQuoteById(quoteId);
  }, [quoteService]);

  const handleQuoteClick = useCallback(async (quoteId: string) => {
    const quote = getQuote(quoteId);
    if (quote) {
      try {
        console.log('Opening quote in drawer:', quote);

        const currentUserObj = getUserById(currentUser) || {
          id: currentUser,
          name: currentUser
        };

        const modalId = openDrawer(
          React.createElement(QuoteDrawerContent, {
            quote: quote,
            currentUser: currentUserObj
          }),
          {
            position: 'right',
            title: quote.name,
            className: 'quote-drawer-modal'
          }
        );

        console.log('Quote drawer opened successfully:', modalId);
      } catch (error) {
        console.error('Failed to open quote drawer:', error);
      }
    } else {
      console.warn(`Quote not found: ${quoteId}`);
    }
  }, [openDrawer, getQuote, currentUser]);

  const navigateToQuoteSource = useCallback((quote: QuoteObject) => {
    if (!editor) return;

    const { from, to } = quote.metadata.sourceRange;

    // Validate range and focus editor at the quote position
    if (from >= 0 && to <= editor.state.doc.content.size && from < to) {
      editor.commands.focus();
      editor.commands.setTextSelection({ from, to });

      const { view } = editor;
      const pos = view.coordsAtPos(from);
      if (pos) {
        view.dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      console.warn(`Invalid quote source range for ${quote.id}`);
    }
  }, [editor]);

  const deleteQuote = useCallback((quoteId: string): boolean => {
    const quote = getQuote(quoteId);
    if (!quote || !editor) return false;

    try {
      // Find reference node in document tree
      const { doc } = editor.state;
      let nodePos: number | null = null;

      doc.descendants((node, pos) => {
        if (node.type.name === 'reference' && node.attrs.id === quoteId) {
          nodePos = pos;
          return false;
        }
        return true;
      });

      if (nodePos !== null) {
        editor.chain()
          .setTextSelection({ from: nodePos, to: nodePos + 1 })
          .deleteSelection()
          .run();
      }

      const deleted = quoteService.deleteQuote(quoteId);

      if (deleted) {
        console.log(`Deleted quote: ${quoteId}`);
      }

      return deleted;
    } catch (error) {
      console.error(`Failed to delete quote ${quoteId}:`, error);
      return false;
    }
  }, [editor, getQuote, quoteService]);

  // Get all quotes in the current document
  const getDocumentQuotes = useCallback((): QuoteObject[] => {
    return quoteService.getQuotesByDocument(documentId);
  }, [documentId, quoteService]);

  // Search quotes by content
  const searchQuotes = useCallback((searchText: string): QuoteObject[] => {
    return quoteService.searchQuotes(searchText);
  }, [quoteService]);

  // Validate quote integrity after document changes
  const validateQuoteIntegrity = useCallback(() => {
    if (!editor) return;

    const quotes = getDocumentQuotes();
    const invalidQuotes: string[] = [];

    quotes.forEach(quote => {
      if (!quoteService.validateSourceIntegrity(quote)) {
        invalidQuotes.push(quote.id);
        console.warn(`Quote ${quote.id} has invalid source integrity`);
      }
    });

    return invalidQuotes;
  }, [editor, getDocumentQuotes, quoteService]);

  // Clean up orphaned quotes
  const cleanupOrphanedQuotes = useCallback(() => {
    const orphanedIds = quoteService.cleanupOrphanedQuotes();

    if (orphanedIds.length > 0) {
      console.log(`Cleaned up ${orphanedIds.length} orphaned quotes:`, orphanedIds);
    }

    return orphanedIds;
  }, [quoteService]);

  // Export all quotes for the document
  const exportDocumentQuotes = useCallback(() => {
    const quotes = getDocumentQuotes();
    const exportData = {
      documentId,
      exportedAt: new Date().toISOString(),
      quotes: quotes.map(quote => ({
        ...quote,
        content: {
          ...quote.content,
          // Include both plain text and rich content for full export
        }
      }))
    };

    return exportData;
  }, [documentId, getDocumentQuotes]);

  return {
    // Core functionality
    createQuote,
    canCreateQuote,
    getQuote,
    handleQuoteClick,

    // Navigation and management
    navigateToQuoteSource,
    deleteQuote,

    // Data access
    documentQuotes,
    getDocumentQuotes,
    searchQuotes,

    // Maintenance
    validateQuoteIntegrity,
    cleanupOrphanedQuotes,
    exportDocumentQuotes,

    // Service instance for advanced usage
    quoteService
  };
};

/**
 * Hook for handling quote reference click events in TipTap editor
 */
export const useQuoteReferenceHandler = (
  editor: Editor | null,
  onQuoteClick: (quoteId: string) => void
) => {
  useEffect(() => {
    if (!editor) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const referenceElement = target.closest('[data-reference-type="quote"]');

      if (referenceElement) {
        const quoteId = referenceElement.getAttribute('data-reference-id');
        if (quoteId) {
          event.preventDefault();
          event.stopPropagation();
          onQuoteClick(quoteId);
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleClick);

    return () => {
      editorElement.removeEventListener('click', handleClick);
    };
  }, [editor, onQuoteClick]);
};