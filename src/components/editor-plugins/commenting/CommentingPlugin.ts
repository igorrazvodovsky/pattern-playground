import { BasePlugin } from '../core/Plugin';
import type { EditorContext, SlotRegistry, EventBus } from '../../editor/types';
import type { Extension } from '@tiptap/core';
import { Reference, createReferenceSuggestion } from '../../reference/index.js';
import CommentingBubbleMenu from './components/CommentingBubbleMenu';
import CommentingToolbar from './components/CommentingToolbar';
import type { ReferenceCategory } from '../../reference/types.js';

export interface CommentingPluginConfig {
  documentId: string;
  currentUser: string;
  bubbleMenu?: boolean;
  toolbar?: boolean;
  referenceCategories?: ReferenceCategory[];
  enableQuoteComments?: boolean;
}

export class CommentingPlugin extends BasePlugin {
  id = 'commenting';
  name = 'Commenting Plugin';
  version = '1.0.0';
  
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

  private quoteCommenting: ReturnType<typeof useTipTapQuoteCommenting> | null = null;

  configure(config: unknown): void {
    if (config && typeof config === 'object') {
      this.config = { ...this.config, ...config as CommentingPluginConfig };
    }
  }

  getExtensions(): Extension[] {
    const extensions: Extension[] = [];
    
    if (this.config.enableQuoteComments && this.config.referenceCategories) {
      extensions.push(
        Reference.configure({
          suggestion: createReferenceSuggestion(this.config.referenceCategories),
        })
      );
    }

    return extensions;
  }

  onActivate(context: EditorContext): void {
    super.onActivate(context);
    
    // Initialize quote commenting when plugin activates
    this.initializeQuoteCommenting();
    
    // Set up click handlers for existing quote references
    this.setupQuoteReferenceHandlers();
  }

  private initializeQuoteCommenting(): void {
    if (!this.context?.editor || !this.config.enableQuoteComments) return;

    // Note: This would typically be handled in the component that uses the plugin
    // For now, we'll store the reference for access in UI components
    this.emit('commenting:initialized', {
      documentId: this.config.documentId,
      currentUser: this.config.currentUser,
    });
  }

  private setupQuoteReferenceHandlers(): void {
    if (!this.context?.editor) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const referenceElement = target.closest('[data-reference-type="quote"]');

      if (referenceElement) {
        const quoteId = referenceElement.getAttribute('data-reference-id');
        if (quoteId) {
          event.preventDefault();
          event.stopImmediatePropagation();
          this.emit('commenting:quote-reference-click', { quoteId });
        }
      }
    };

    const editorElement = this.context.editor.view.dom;
    editorElement.addEventListener('click', handleClick, { capture: true });

    // Store cleanup function
    this.cleanupHandlers = () => {
      editorElement.removeEventListener('click', handleClick, { capture: true });
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
    this.quoteCommenting = null;
  }

  registerUI(slots: SlotRegistry): void {
    if (this.config.bubbleMenu) {
      slots.register('bubble-menu', {
        pluginId: this.id,
        render: () => CommentingBubbleMenu({ 
          editor: this.context?.editor,
          config: this.config,
        }),
        condition: () => {
          if (!this.context?.editor) return false;
          const { selection } = this.context.editor.state;
          return !selection.empty;
        },
        priority: 10, // Lower priority than formatting to appear after
      });
    }

    if (this.config.toolbar) {
      slots.register('toolbar', {
        pluginId: this.id,
        render: () => CommentingToolbar({ 
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
          this.emit('commenting:create-quote-comment', { params });
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

  // Public API for accessing commenting functionality
  getQuoteCommenting() {
    return this.quoteCommenting;
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

export function commentingPlugin(config: CommentingPluginConfig): CommentingPlugin {
  const plugin = new CommentingPlugin();
  plugin.configure(config);
  return plugin;
}