import { BasePlugin } from '../core/Plugin';
import type { EditorContext, SlotRegistry, EventBus } from '../../editor/types';
import type { Extension } from '@tiptap/core';
import { Reference, createReferenceSuggestion } from '../../reference/index.js';
import React from 'react';
import CommentingBubbleMenu from './components/CommentingBubbleMenu';
import CommentingToolbar from './components/CommentingToolbar';
import type { ReferenceCategory } from '../../reference/types.js';
import { getCommentService } from '../../../services/commenting/core/index';
import { QuotePointer } from '../../../services/commenting/core/quote-pointer';
import { getQuoteService } from '../../../services/commenting/quote-service';

export interface CommentingPluginConfig {
  documentId: string;
  currentUser: string;
  bubbleMenu?: boolean;
  toolbar?: boolean;
  referenceCategories?: ReferenceCategory[];
  enableQuoteComments?: boolean;
}

export class EditorCommentingPlugin extends BasePlugin {
  id = 'editor-commenting';
  name = 'Editor Commenting Plugin';
  version = '2.0.0';
  
  capabilities = {
    requiresSelection: true,
    modifiesContent: true,
    providesUI: true,
    requiresNetwork: false,
    supportsStreaming: false,
  };

  private config: CommentingPluginConfig = {
    documentId: '',
    currentUser: '',
    bubbleMenu: true,
    toolbar: false,
    enableQuoteComments: true,
  };

  private commentService = getCommentService();
  private quoteService = getQuoteService();

  configure(config: unknown): void {
    if (config && typeof config === 'object') {
      this.config = { ...this.config, ...config as CommentingPluginConfig };
    }
  }

  getExtensions(): Extension[] {
    const extensions: Extension[] = [];
    
    if (this.config.enableQuoteComments && this.config.referenceCategories) {
      const referenceExt = Reference.configure({
        suggestion: createReferenceSuggestion(this.config.referenceCategories),
      });
      extensions.push(referenceExt as any);
    }

    return extensions;
  }

  onActivate(context: EditorContext): void {
    console.log('CommentingPlugin: onActivate called with context:', context);
    super.onActivate(context);
    
    // Store plugin reference in editor storage for hook access
    if (context.editor && context.editor.storage) {
      if (!context.editor.storage.plugins) {
        context.editor.storage.plugins = new Map();
      }
      context.editor.storage.plugins.set('editor-commenting', this);
      console.log('CommentingPlugin: Plugin stored in editor storage');
    }
    
    // Add editor commands
    this.addEditorCommands(context);
    
    // Initialize quote commenting when plugin activates
    this.initializeQuoteCommenting();
    
    // Set up click handlers for existing quote references
    this.setupQuoteReferenceHandlers();
  }

  private addEditorCommands(context: EditorContext): void {
    if (!context.editor) return;
    
    // Add the createQuoteFromSelection command that the hook expects
    (context.editor.commands as any).createQuoteFromSelection = () => {
      console.log('EditorCommand: createQuoteFromSelection called');
      this.handleCreateQuoteComment();
      return true;
    };
    
    console.log('CommentingPlugin: Added createQuoteFromSelection command to editor');
  }

  private initializeQuoteCommenting(): void {
    if (!this.config.enableQuoteComments) return;

    // Emit initialization event for UI components
    this.emit('commenting:initialized', {
      documentId: this.config.documentId,
      currentUser: this.config.currentUser,
    });
  }

  private setupQuoteReferenceHandlers(): void {
    // Reference handlers will be set up when context is available
    // For now, simplified implementation
    this.cleanupHandlers = () => {
      // Cleanup logic here
    };
  }

  private cleanupHandlers?: () => void;

  onDeactivate(): void {
    super.onDeactivate();
    this.cleanupHandlers?.();
  }

  onDestroy(): void {
    super.onDestroy();
    this.cleanupHandlers?.();
  }

  registerUI(slots: SlotRegistry): void {
    if (this.config.bubbleMenu) {
      slots.register('bubble-menu', {
        pluginId: this.id,
        render: () => React.createElement(CommentingBubbleMenu, {
          editor: this.context?.editor,
          config: this.config,
        }),
        condition: () => {
          // Only show when there's a text selection
          const selection = this.context?.editor?.state?.selection;
          return selection ? !selection.empty : false;
        },
        priority: 10,
      });
    }

    if (this.config.toolbar) {
      slots.register('toolbar', {
        pluginId: this.id,
        render: () => React.createElement(CommentingToolbar, {
          editor: this.context?.editor,
          config: this.config,
        }),
        priority: 20,
      });
    }
  }

  subscribeToEvents(eventBus: EventBus): void {
    eventBus.on('command:execute', ({ command, params }) => {
      if (!this.context?.editor) return;

      switch (command) {
        case 'commenting:create-quote-comment':
          console.log('CommentingPlugin: Received commenting:create-quote-comment command');
          this.handleCreateQuoteComment();
          break;
        case 'commenting:show-comments':
          if (typeof params === 'object' && params && 'quoteId' in params) {
            this.emit('commenting:show-comments', { quoteId: (params as any).quoteId });
          }
          break;
      }
    });

    // Listen for selection changes to update UI state
    eventBus.on('selection:change', ({ from, to, content }) => {
      this.emit('commenting:selection-change', { from, to, content });
    });
  }

  private handleCreateQuoteComment(): void {
    if (!this.context?.editor) {
      console.log('CommentingPlugin: No editor context available');
      return;
    }

    console.log('CommentingPlugin: handleCreateQuoteComment called');
    const { from, to } = this.context.editor.state.selection;
    if (from === to) {
      console.log('CommentingPlugin: No text selected');
      return;
    }
    
    // Get selected text for the pending quote
    const selectedText = this.context.editor.state.doc.textBetween(from, to, ' ');
    
    // Create quote using the quote service
    const quote = this.quoteService.createFromTipTapSelection(
      this.context.editor, 
      this.config.currentUser,
      this.config.documentId
    );
    
    // Store the selection info for later use
    this.pendingQuotes.set(quote.id, {
      from,
      to,
      text: selectedText
    });
    
    // Create pointer for the quote
    const pointer = new QuotePointer(quote.id, quote);
    
    // Show comment interface WITHOUT creating the reference yet
    console.log('CommentingPlugin: About to emit quote:created event', { quote, pointer });
    console.log('CommentingPlugin: Stored selection for quote:', { quoteId: quote.id, from, to, text: selectedText });
    const emitResult = this.emit('quote:created', { quote, pointer });
    console.log('CommentingPlugin: Emit result:', emitResult);
  }

  // Store pending quotes with their selection info
  private pendingQuotes = new Map<string, { from: number; to: number; text: string }>();

  // Method to finalize the quote creation after comment is added
  finalizeQuoteCreation(quoteId: string): void {
    if (!this.context?.editor) return;

    // Get the stored selection for this quote
    const pendingQuote = this.pendingQuotes.get(quoteId);
    if (!pendingQuote) {
      console.log('CommentingPlugin: No pending quote found for ID:', quoteId);
      return;
    }

    console.log('CommentingPlugin: Finalizing quote with stored selection:', pendingQuote);

    // Use the stored selection to create the reference
    const { from, to, text } = pendingQuote;

    // First restore the selection to the original position
    const setSelectionResult = this.context.editor.commands.setTextSelection({ from, to });
    console.log('CommentingPlugin: setTextSelection result:', setSelectionResult);
    console.log('CommentingPlugin: Current selection after restore:', this.context.editor.state.selection);
    
    // Check if the text at that position still matches
    const currentText = this.context.editor.state.doc.textBetween(from, to, ' ');
    console.log('CommentingPlugin: Original text:', text);
    console.log('CommentingPlugin: Current text at position:', currentText);
    
    // Then create the reference at that position
    const convertResult = (this.context.editor.commands as any).convertSelectionToQuoteReference({
      id: quoteId,
      label: text.length > 50 ? text.substring(0, 47) + '...' : text,
      metadata: {
        quoteId: quoteId,
        documentId: this.config.documentId,
        createdAt: new Date().toISOString()
      }
    });
    
    console.log('CommentingPlugin: convertSelectionToQuoteReference available:', !!(this.context.editor.commands as any).convertSelectionToQuoteReference);

    console.log('CommentingPlugin: Quote finalized, convertSelectionToQuoteReference result:', convertResult);
    
    // Clean up the pending quote
    this.pendingQuotes.delete(quoteId);
  }

  // Public API for accessing services
  getCommentService() {
    return this.commentService;
  }
  
  getQuoteService() {
    return this.quoteService;
  }

  canCreateQuoteComment(): boolean {
    if (!this.context?.editor) return false;
    const { selection } = this.context.editor.state;
    return !selection.empty;
  }

  createQuoteWithComment(): void {
    // This method will be called by the editor command
    // Implementation moved to addEditorCommands
    this.emit('command:execute', {
      command: 'commenting:create-quote-comment',
      params: {},
    });
  }
}

export function commentingPlugin(config: CommentingPluginConfig): EditorCommentingPlugin {
  const plugin = new EditorCommentingPlugin();
  plugin.configure(config);
  return plugin;
}