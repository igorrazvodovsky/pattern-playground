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
      extensions.push(referenceExt as Extension);
    }

    return extensions;
  }

  onActivate(context: EditorContext): void {
    super.onActivate(context);
    
    if (context.editor && context.editor.storage) {
      if (!context.editor.storage.plugins) {
        context.editor.storage.plugins = new Map();
      }
      context.editor.storage.plugins.set('editor-commenting', this);
    }

    this.addEditorCommands(context);

    this.initializeQuoteCommenting();

    this.setupQuoteReferenceHandlers();
  }

  private addEditorCommands(context: EditorContext): void {
    if (!context.editor) return;

    (context.editor.commands as unknown as { createQuoteFromSelection: () => boolean }).createQuoteFromSelection = () => {
      this.handleCreateQuoteComment();
      return true;
    };
    
  }

  private initializeQuoteCommenting(): void {
    if (!this.config.enableQuoteComments) return;

    this.emit('commenting:initialized', {
      documentId: this.config.documentId,
      currentUser: this.config.currentUser,
    });
  }

  private setupQuoteReferenceHandlers(): void {
    this.cleanupHandlers = () => {
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
          this.handleCreateQuoteComment();
          break;
        case 'commenting:show-comments':
          if (typeof params === 'object' && params && 'quoteId' in params) {
            this.emit('commenting:show-comments', { quoteId: (params as { quoteId: string }).quoteId });
          }
          break;
      }
    });

    eventBus.on('selection:change', ({ from, to, content }) => {
      this.emit('commenting:selection-change', { from, to, content });
    });
  }

  private handleCreateQuoteComment(): void {
    if (!this.context?.editor) {
      return;
    }

    const { from, to } = this.context.editor.state.selection;
    if (from === to) {
      return;
    }

    const selectedText = this.context.editor.state.doc.textBetween(from, to, ' ');

    const quote = this.quoteService.createFromTipTapSelection(
      this.context.editor, 
      this.config.currentUser,
      this.config.documentId
    );

    this.pendingQuotes.set(quote.id, {
      from,
      to,
      text: selectedText
    });

    const pointer = new QuotePointer(quote.id, quote);

    this.emit('quote:created', { quote, pointer });
  }

  private pendingQuotes = new Map<string, { from: number; to: number; text: string }>();

  finalizeQuoteCreation(quoteId: string): void {
    if (!this.context?.editor) return;

    const pendingQuote = this.pendingQuotes.get(quoteId);
    if (!pendingQuote) {
      return;
    }


    const { from, to, text } = pendingQuote;

    this.context.editor.commands.setTextSelection({ from, to });

    this.context.editor.state.doc.textBetween(from, to, ' ');

    (this.context.editor.commands as unknown as { convertSelectionToQuoteReference: (quote: { id: string; label: string; metadata: Record<string, unknown> }) => boolean }).convertSelectionToQuoteReference({
      id: quoteId,
      label: text.length > 50 ? text.substring(0, 47) + '...' : text,
      metadata: {
        quoteId: quoteId,
        documentId: this.config.documentId,
        createdAt: new Date().toISOString()
      }
    });

    this.pendingQuotes.delete(quoteId);
  }

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