import { Editor } from '@tiptap/react';
import { EventEmitter } from '../../../services/commenting/core/event-emitter.js';
import { getQuoteService, type QuoteObject } from '../../../services/commenting/quote-service.js';
import { StarterKit } from '@tiptap/starter-kit';
import { Mention } from '@tiptap/extension-mention';
import type { CommentPointer } from '../../../services/commenting/core/comment-pointer.js';

// Extend Tiptap's Commands interface with our custom commands
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    editorCommenting: {
      /**
       * Create a quote from the current selection
       */
      createQuoteFromSelection: () => ReturnType;
      /**
       * Insert a reference to an object (like a mention)
       */
      insertReference: (object: { id: string; type: string; label: string }) => ReturnType;
      /**
       * Convert selection to a quote reference
       */
      convertSelectionToQuoteReference: (quote: {
        id: string;
        label: string;
        metadata: Record<string, unknown>;
      }) => ReturnType;
    };
  }
}

interface EditorContext {
  editor: Editor;
  documentId: string;
  currentUser: string;
}

interface EditorSelection {
  from: number;
  to: number;
  empty: boolean;
}


interface QuoteCreatedEvent {
  quote: QuoteObject;
  pointer: CommentPointer;
}

/**
 * Adapts quote-service format to quote-pointer format
 */
function adaptQuoteForPointer(quote: QuoteObject): import('../../../services/commenting/core/quote-pointer.js').QuoteObject {
  return {
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
}

interface PluginCapabilities {
  canCreateQuote: boolean;
  canInsertReference: boolean;
  hasRichTextComposer: boolean;
}

/**
 * TipTap integration layer for commenting system
 * Provides editor-specific capabilities like quote creation
 */
export class EditorCommentingPlugin extends EventEmitter {
  private context: EditorContext | null = null;
  private quoteService = getQuoteService();
  
  constructor() {
    super();
  }

  /**
   * Activate the plugin with editor context
   */
  onActivate(context: EditorContext): void {
    this.context = context;
    this.setupEditorCommands();
    this.setupEventListeners();
  }

  /**
   * Deactivate the plugin and clean up
   */
  onDeactivate(): void {
    this.removeEventListeners();
    this.context = null;
  }

  /**
   * Get current plugin capabilities
   */
  getCapabilities(): PluginCapabilities {
    return {
      canCreateQuote: this.canCreateQuote(),
      canInsertReference: true,
      hasRichTextComposer: true
    };
  }

  /**
   * Create quote from current selection
   * This is editor-specific functionality - the quote becomes just another commentable object
   */
  async createQuoteFromSelection(): Promise<QuoteObject | null> {
    if (!this.context || !this.canCreateQuote()) {
      return null;
    }

    try {
      const quote = this.quoteService.createFromTipTapSelection(
        this.context.editor,
        this.context.currentUser,
        this.context.documentId
      );

      // Check if editor has the command (may not be available)
      const editorCommands = this.context.editor.commands as unknown;
      if ('convertSelectionToQuoteReference' in editorCommands) {
        editorCommands.convertSelectionToQuoteReference({
          id: quote.id,
          label: quote.name,
          metadata: quote.metadata
        });
      } else {
        console.warn('convertSelectionToQuoteReference command not available');
      }

      // Create pointer for the new quote
      const { QuotePointer } = await import('../../../services/commenting/core/quote-pointer.js');
      const adaptedQuote = adaptQuoteForPointer(quote);
      const pointer = new QuotePointer(quote.id, adaptedQuote);

      // Emit event for UI to show comment interface
      this.emit('quote:created', { quote, pointer } as QuoteCreatedEvent);
      
      return quote;
    } catch (error) {
      console.error('Failed to create quote:', error);
      return null;
    }
  }

  /**
   * Check if quote creation is possible
   */
  canCreateQuote(): boolean {
    if (!this.context) return false;

    const selection = this.context.editor.state.selection as EditorSelection;
    return !selection.empty && selection.from !== selection.to;
  }

  /**
   * Insert reference to any object (@mention functionality)
   */
  insertReference(object: { id: string; type: string; label: string }): boolean {
    if (!this.context) return false;

    try {
      // Insert as a simple mention-style text for now
      // In a full implementation, this would use a custom node type
      this.context.editor.commands.insertContent(`@${object.label}`);
      return true;
    } catch (error) {
      console.error('Failed to insert reference:', error);
      return false;
    }
  }

  /**
   * Create rich text editor for comment composition
   */
  createCommentComposer(): Editor | null {
    try {
      return new Editor({
        extensions: [
          StarterKit,
          Mention.configure({
            HTMLAttributes: {
              class: 'mention',
            },
          })
        ],
        content: '',
        editorProps: {
          attributes: {
            class: 'comment-composer prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          },
        }
      });
    } catch (error) {
      console.error('Failed to create comment composer:', error);
      return null;
    }
  }

  /**
   * Handle quote reference clicks
   */
  handleQuoteReferenceClick(quoteId: string): void {
    const quote = this.quoteService.getQuoteById(quoteId);
    if (quote) {
      this.emit('quote:clicked', { quoteId, quote });
    } else {
      console.warn(`Quote not found: ${quoteId}`);
    }
  }

  /**
   * Navigate to quote source position
   */
  navigateToQuoteSource(quote: QuoteObject): boolean {
    if (!this.context) return false;

    const { from, to } = quote.metadata.sourceRange as { from: number; to: number };
    const { editor } = this.context;
    const docSize = editor.state.doc.content.size;

    if (from >= 0 && to <= docSize && from < to) {
      editor.commands.focus();
      editor.commands.setTextSelection({ from, to });

      // Scroll into view
      const { view } = editor;
      try {
        const pos = view.coordsAtPos(from);
        if (pos) {
          view.dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (error) {
        console.warn('Failed to scroll to quote position:', error);
      }
      return true;
    }

    console.warn(`Invalid quote source range for ${quote.id}: from=${from}, to=${to}, docSize=${docSize}`);
    return false;
  }

  /**
   * Get quote by ID (convenience method)
   */
  getQuote(quoteId: string): QuoteObject | undefined {
    return this.quoteService.getQuoteById(quoteId);
  }

  /**
   * Setup editor commands with proper typing
   */
  private setupEditorCommands(): void {
    if (!this.context) return;

    // Add custom commands to editor with proper typing
    try {
      // Extend the editor commands object with our custom methods
      const editorCommands = this.context.editor.commands as unknown;

      editorCommands.createQuoteFromSelection = async (): Promise<boolean> => {
        const result = await this.createQuoteFromSelection();
        return result !== null;
      };

      editorCommands.insertReference = (object: { id: string; type: string; label: string }): boolean => {
        return this.insertReference(object);
      };
    } catch (error) {
      console.warn('Failed to setup custom editor commands:', error);
    }
  }

  /**
   * Setup event listeners for quote reference clicks
   */
  private setupEventListeners(): void {
    if (!this.context) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const referenceElement = target.closest('[data-reference-type="quote"]');

      if (referenceElement) {
        const quoteId = referenceElement.getAttribute('data-reference-id');
        if (quoteId) {
          event.preventDefault();
          event.stopPropagation();
          this.handleQuoteReferenceClick(quoteId);
        }
      }
    };

    this.context.editor.view.dom.addEventListener('click', handleClick);
    
    // Store reference for cleanup
    (this.context.editor as unknown as { _commentPluginClickHandler?: (event: MouseEvent) => void })._commentPluginClickHandler = handleClick;
  }

  /**
   * Remove event listeners
   */
  private removeEventListeners(): void {
    if (!this.context) return;

    const handler = (this.context.editor as unknown as { _commentPluginClickHandler?: (event: MouseEvent) => void })._commentPluginClickHandler;
    if (handler) {
      this.context.editor.view.dom.removeEventListener('click', handler);
      delete (this.context.editor as unknown as { _commentPluginClickHandler?: (event: MouseEvent) => void })._commentPluginClickHandler;
    }
  }
}

/**
 * Factory function to create plugin instance
 */
export function createEditorCommentingPlugin(): EditorCommentingPlugin {
  return new EditorCommentingPlugin();
}